const {app, BrowserWindow, dialog, Menu} = require('electron')
const path = require('path')
const fs = require('fs')
const createApplicationMenu = require('./application-menu')
let mainWindow = null
const windows = new Set()
const openedFiles = new Map()
app.on('ready', () => {
    createApplicationMenu()
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
    newWindow.on('focus', createApplicationMenu)
    newWindow.on('close', event => {
        if (newWindow.isDocumentEdited()) {
            event.preventDefault()
            const result = dialog.showMessageBox(newWindow, {
                type: 'warning',
                title: 'Quit with Unsaved Changes',
                message: 'Your changes will be lost if you do not save',
                buttons: [
                    'Quit Anyway',
                    'Cancel',
                ],
                defaultId: 0,
                cancelId: 1,
            })
            if (result === 0) {
                newWindow.destroy()
            }
        }
    })
    newWindow.on('closed', () => {
        windows.delete(newWindow)
        createApplicationMenu()
        stopWatchingFile(newWindow)
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
    startWatchingFile(targetWindow, file)
    app.addRecentDocument(file)
    targetWindow.setRepresentedFilename(file)
    targetWindow.webContents.send('file-opened', file, content)
    createApplicationMenu()
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

const startWatchingFile = (targetWindow, file) => {
    stopWatchingFile(targetWindow)
    const watcher = fs.watchFile(file, event => {
        if (event === 'change') {
            const content = fs.readFileSync(file)
            targetWindow.webContents.send('file-opened', file, content)
        }
    })
    openedFiles.set(targetWindow, watcher)
}

const stopWatchingFile = (targetWindow) => {
    if (openedFiles.has(targetWindow)) {
        openedFiles.get(targetWindow).stop()
        openedFiles.delete(targetWindow)
    }
}