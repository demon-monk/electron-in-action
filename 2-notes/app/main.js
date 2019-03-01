const {app, BrowserWindow, dialog} = require('electron')
const path = require('path')
const fs = require('fs')
let mainWindow = null
const windows = new Set()
app.on('ready', () => {
    createWindow()
})

app.on('window-all-closed', () => {
    // darwin, freebsd, linux, sunos, win32
    if (process.platform === 'darwin') {
        return false
    }
    app.quit()
})

// only fires on MacOS
app.on('activate', (event, hasVisibleWindows) => {
    if (!hasVisibleWindows) {
        createWindow()
    }
})

app.on('will-finish-launching', () => {
    app.on('open-file', (event, file) => {
        const win = createWindow()
        win.once('ready-to-show', () => {
            openFile(win, file)
        })
    })
})

const createWindow = exports.createWindow = () => {
    let x, y
    const currentWindow = BrowserWindow.getFocusedWindow()
    if (currentWindow) {
        const [currentWindowX, currentWindowY] = currentWindow.getPosition()
        x = currentWindowX + 20
        y = currentWindowY + 20
    }
    let newWindow = new BrowserWindow({ x, y, show: false })
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
    app.addRecentDocument(file)
    targetWindow.setRepresentedFilename(file)
    targetWindow.webContents.send('file-opened', file, content)
}

const saveHtml = exports.saveHtml = (targetWindow, content) => {
    const file = dialog.showSaveDialog(targetWindow, {
        title: 'Save HTML',
        // can be set as 'home', 'desktop' ext. see 6.3.2
        defaultPath: app.getPath('documents'),
        filters: [{
            name: 'HTML Files',
            extensions: ['html', 'htm'],
        }]
    })
    if (!file) {
        return
    }
    fs.writeFileSync(file, content)
}

const saveMarkdown = exports.saveMarkdown = (targetWindow, file, content) => {
    if (!file) {
        file = dialog.showSaveDialog(targetWindow, {
            title: 'Save Markdown',
            defaultPath: app.getPath('documents'),
            filters: [{
                name: 'Markdown Files',
                extensions: ['md', 'markdown'],
            }]
        })
    }
    if (!file) {
        return
    }
    fs.writeFileSync(file, content)
    openFile(targetWindow, file)
}