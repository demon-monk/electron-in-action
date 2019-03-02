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

// dragging, not dropped, can only get file metadata
const getDraggedFile = event => {
    return event.dataTransfer.items[0]
}
// dropped, can get real file data
const getDroppedFile = event => event.dataTransfer.files[0]
const fileTypeIsSupported = file => {
    return ['text/plain', 'text/markdown'].includes(file.type)
}
const removeDropStyle = () => {
    markdownView.classList.remove('drag-over')
    markdownView.classList.remove('drag-error')
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

saveMarkdownButton.addEventListener('click', () => {
    mainProcess.saveMarkdown(currentWindow, filePath, markdownView.value)
})

revertButton.addEventListener('click', () => {
    markdownView.value = originContent
    renderMarkdownToHtml(originContent)
})

document.addEventListener('dragstart', event => event.preventDefault())
document.addEventListener('dragover', event => event.preventDefault())
document.addEventListener('dragleave', event => event.preventDefault())
document.addEventListener('drop', event => event.preventDefault())

markdownView.addEventListener('dragover', event => {
    const file = getDraggedFile(event)
    if (fileTypeIsSupported(file)) {
        console.log(file)
        markdownView.classList.add('drag-over')
    } else {
        markdownView.classList.add('drag-error')
    }
})

markdownView.addEventListener('dragleave', removeDropStyle)

markdownView.addEventListener('drop', event => {
    const file = getDroppedFile(event)
    if (fileTypeIsSupported) {
        mainProcess.openFile(currentWindow, file.path)
    } else {
        alert('This file type is not supported')
    }
    removeDropStyle()
})

ipcRenderer.on('file-opened', (event, file, content) => {
    filePath = file
    originContent = content
    markdownView.value = content
    renderMarkdownToHtml(content)
    updateUserInterface()
})