const {app, BrowserWindow} = require('electron')
const path = require('path')
let mainWindow = null

app.on('ready', () => {
    mainWindow = new BrowserWindow()
    mainWindow.loadFile(path.join(__dirname, 'index.html'))
    mainWindow.on('closed', () => {
        mainWindow = null
    })
})