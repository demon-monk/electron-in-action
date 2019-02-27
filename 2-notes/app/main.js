const {app, BrowserWindow, dialog} = require('electron')
const path = require('path')
const fs = require('fs')
let mainWindow = null

app.on('ready', () => {
    mainWindow = new BrowserWindow({ show: false })
    mainWindow.loadFile(path.join(__dirname, 'index.html'))
    mainWindow.once('ready-to-show', () => {
        mainWindow.show()
    })
    mainWindow.on('closed', () => {
        mainWindow = null
    })
})

const getFileFromUser = exports.getFileFromUser = () => {
    const files = dialog.showOpenDialog({
        // other options: openDirectory, multiselections
        properties: ['openFile'],
        // restrict certain file types
        filters: [
            { name: 'Markdown Files', extensions: ['md', 'markdown'] },
            { name: 'Text Files', extensions: ['txt'] },
        ],  
    })
    if (!files) {
        return
    }
    const file = files[0]
    const content = fs.readFileSync(file, 'utf8')
}