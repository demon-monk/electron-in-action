const {app, BrowserWindow, dialog} = require('electron')
const path = require('path')
const fs = require('fs')
let mainWindow = null
const windows = new Set()
app.on('ready', () => {
    createWindow()
})

const createWindow = exports.createWindow = () => {
    let newWindow = new BrowserWindow({ show: false })
    newWindow.loadFile(path.join(__dirname, 'index.html'))
    newWindow.once('ready-to-show', () => {
        newWindow.show()
    })
    newWindow.on('closed', () => {
        windows.delete(newWindow)
        newWindow = null
    })
    windows.add(newWindow)
    return newWindow
}

const createWindow = exports.createWindow = () => {
    let newWindow = new BrowserWindow({ show: false })
    newWindow.loadFile(path.join(__dirname, 'index.html'))
    newWindow.once('ready-to-show', () => {
        newWindow.show()
    })
    newWindow.on('closed', () => {
        windows.delete(newWindow)
        newWindow = null
    })
    windows.add(newWindow)
    return newWindow
}

const getFileFromUser = exports.getFileFromUser = (targetWindow) => {
    const files = dialog.showOpenDialog(targetWindow, {
        // other options: openDirectory, multiselections
        properties: ['openFile'],
        // restrict certain file types
        filters: [
            { name: 'Markdown Files', extensions: ['md', 'markdown'] },
            { name: 'Text Files', extensions: ['txt'] },
        ],  
    })
    if (files && files[0]) {
        openFile(targetWindow, files[0])
    }
}

const openFile = exports.openFile = (targetWindow, file) => {
    const content = fs.readFileSync(file, 'utf8')
    targetWindow.webContents.send('file-opened', file, content)
}