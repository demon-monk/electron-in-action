const marked = require('marked')
const { remote, ipcRenderer } = require('electron')
const path = require('path')

const mainProcess = remote.require('./main')
const currentWindow = remote.getCurrentWindow()

let filePath = null
let originContent = ''

const markdownView = document.querySelector("#markdown");
const htmlView = document.querySelector("#html");
const newFileButton = document.querySelector("#new-file");
const openFileButton = document.querySelector("#open-file");
const saveMarkdownButton = document.querySelector("#save-markdown");
const revertButton = document.querySelector("#revert");
const saveHtmlButton = document.querySelector("#save-html");
const showFileButton = document.querySelector("#show-file");
const openInDefaultButton = document.querySelector("#open-in-default");

const renderMarkdownToHtml = (markdown) => {
    // sanitize is used for preventing script injection
    htmlView.innerHTML = marked(markdown, { sanitize: true })
}

const updateUserInterface = (isEdited) => {
    let title = 'Notes'
    if (filePath) {
        title = `${path.basename(filePath)} - ${title}`
    }
    if (isEdited) {
        title = `${title} (Edited)`
    }
    currentWindow.setTitle(title)
    currentWindow.setDocumentEdited(isEdited)
    saveMarkdownButton.disabled = !isEdited
    revertButton.disabled = !isEdited
}

markdownView.addEventListener('keyup', (event) => {
    const currentContent = event.target.value
    renderMarkdownToHtml(currentContent)
    updateUserInterface(currentContent !== originContent)
})

openFileButton.addEventListener('click', () => {
    mainProcess.getFileFromUser(currentWindow)
})

newFileButton.addEventListener('click', () => {
    mainProcess.createWindow()
})

saveHtmlButton.addEventListener('click', () => {
    mainProcess.saveHtml(currentWindow, htmlView.innerHTML)
})

ipcRenderer.on('file-opened', (event, file, content) => {
    filePath = file
    originContent = content
    markdownView.value = content
    renderMarkdownToHtml(content)
    updateUserInterface()
})