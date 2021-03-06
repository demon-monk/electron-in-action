const { app, BrowserWindow, Menu, shell, dialog} = require('electron')
const mainProcess = require('./main')

const createApplicationMenu = () => {
    const hasOneOrMoreWindows = !!BrowserWindow.getAllWindows().length
    const focusedWindow = BrowserWindow.getFocusedWindow()
    const hasFilePath = !! (focusedWindow && focusedWindow.getRepresentedFilename())

    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New File',
                    accelerator: 'CmdOrCtrl+N',
                    click() {
                        mainProcess.createWindow()
                    },
                },
                {
                    label: 'Open File',
                    accelerator: 'CmdOrCtrl+O',
                    click (item, focusedWindow) {
                        if (focusedWindow) {
                            return mainProcess.getFileFromUser(focusedWindow)
                        }
                        const newWindow = mainProcess.createWindow()
                        newWindow.on('show', () => {
                            mainProcess.getFileFromUser(newWindow)
                        })
                    },
                },
                {
                    label: 'Save File',
                    accelerator: 'CmdOrCtrl+S',
                    enabled: hasOneOrMoreWindows,
                    click (item, focusedWindow) {
                        if (!focusedWindow) {
                            return showSaveDialog()
                        }
                        focusedWindow.webContents.send('save-markdown')
                    },
                },
                {
                    label: 'Export HTML',
                    accelerator: 'Shift+CmdOrCtrl+S',
                    enabled: hasOneOrMoreWindows,
                    click (item, focusedWindow) {
                        if (!focusedWindow) {
                            return showSaveDialog()
                        }
                        focusedWindow.webContents.send('save-html')
                    },
                },
                { type: 'separator' },
                {
                    label: 'Show File',
                    accelerator: 'Shift+CmdOrCtrl+O',
                    enabled: hasFilePath,
                    click (item, focusedWindow) {
                        if (!focusedWindow) {
                            return dialog.showErrorBox(
                                'Cannot Open File in Default Editor',
                                'There is currently no active document to open',
                            )
                        }
                        focusedWindow.webContents.send('show-file')
                    },
                },
                {
                    label: 'Open in Default Editor',
                    accelerator: 'Alt+CmdOrCtrl+O',
                    enabled: hasFilePath,
                    click (item, focusedWindow) {
                        if (!focusedWindow) {
                            return dialog.showErrorBox(
                                'Cannot Open File in Default Editor',
                                'There is currently no active document to open',
                            )
                        }
                        focusedWindow.webContents.send('open-in-default')
                    },
                }
            ]
        },
        {
            label: 'Edit',
            role: 'edit',
            submenu: [
                {
                    label: 'Undo',
                    accelerator: 'CommandOrControl+Z',
                    role: 'undo',
                }, 
                {
                    label: 'Redo',
                    accelerator: 'CmdOrCtrl+Z',
                    role: 'redo',
                },
                { type: 'separator' },
                {
                    label: 'Cut',
                    accelerator: 'CommandOrControl+X',
                    role: 'cut',
                },
                {
                    label: 'Copy',
                    accelerator: 'CmdOrCtrl+C',
                    role: 'copy',
                },
                {
                    label: 'Paste',
                    accelerator: 'CmdOrCtrl+V',
                    role: 'paste'
                }
            ]
        },
        {
            label: 'Window',
            role: 'window',
            submenu: [
                {
                    label: 'Minimize',
                    accelerator: 'CmdOrCtrl+M',
                    role: 'minimize',
                },
                {
                    label: 'Close',
                    accelerator: 'CmdOrCtrl+W',
                    role: 'close',
                }
            ]
        },
        {
            label: 'help',
            role: 'help',
            submenu: [
                {
                    label: 'Visit Website',
                    click () { /* TODO: */ },
                },
                {
                    label: 'Toggle Developer Tools',
                    click (item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.webContents.toggleDevTools()
                        }
                    },
                },
            ],
        },
    ]
    if (process.platform === 'darwin') {
        const name = 'Notes'
        template.unshift({
            label: name,
            submenu: [
                {
                    label: `About ${name}`,
                    role: 'about',
                },
                { type: 'separator' },
                {
                    label: 'Services',
                    role: 'services',
                    submenu: [],
                },
                { type: 'separator' },
                {
                    label: `Hide ${name}`,
                    accelerator: 'Cmd+H',
                    role: '',
                },
                {
                    label: 'Hide Others',
                    accelerator: 'Cmd+Alt+H',
                    role: 'hideothers',
                },
                {
                    label: 'Show All',
                    role: 'unhide',
                },
                { type: 'separator' },
                {
                    label: `Quit ${name}`,
                    accelerator: 'Cmd+Q',
                    click() { app.quit() },
                },
            ],
        })
        const windowMenu = template.find(item => item.label === 'Window')
        windowMenu.role = 'window'
        windowMenu.submenu.push(
            { type: 'separator' },
            {
                label: 'Bring All to Front',
                role: 'front',
            }
        )
    }
    return Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

const showSaveDialog = () => dialog.showErrorBox(
    'Cannot Save or Export',
    'There is currently no active document to save or export',
)

module.exports = createApplicationMenu