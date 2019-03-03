const path = require('path')
const { app, Menu, Tray, systemPreferences } = require('electron')
let tray = null
const clippings = []

const getIcon = () => {
    if (process.platform === 'win32') {
        return 'icon-light@2x.ico'
    }
    if (systemPreferences.isDarkMode()) {
        return 'icon-light.png'
    }
    return 'icon-dark.png'
}

const updateMenu = () => {
    const menu = Menu.buildFromTemplate([
        {
            label: 'Create New Clipping',
            click() { return },
        },
        { type: 'separator' },
        ...clippings.map((clipping, index) => ({ label: clipping })),
        { type: 'separator' },
        {
            label: 'Quit',
            click() { app.quit() },
        }
    ])
    tray.setContextMenu(menu)
}

app.on('ready', () => {
    if (app.dock) {
        app.dock.hide()
    }
    tray = new Tray(path.join(__dirname, getIcon()))
    if (process.platform === 'win32') {
        tray.on('click', tray.popUpContextMenu)
    }
    const menu = Menu.buildFromTemplate([
        {
            label: 'Quit',
            click () { app.quit() },
        }
    ])
    updateMenu()
    tray.setToolTip('Clipmaster')
})