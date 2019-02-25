const {
    app, // 1.hide, show, quit the application 2. events: before-quit, window-all-closed, browser-window-blur, and browser-window-focus
    BrowserWindow, // 1. DOM 2. access chromium web api 3. Node built-in modules
} = require('electron')
const path = require('path')

let mainWindow = null
app.on('ready', () => {
    mainWindow = new BrowserWindow()
    mainWindow.webContents.loadFile(path.join(__dirname, 'index.html')) // should always use path.join
})