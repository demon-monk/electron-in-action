const { app, BrowserWindow, Menu, shell} = require('electron')
const mainProcess = require('./main')

const template = [
    {
        label: 'Edit',
        role: 'edit',
        submenu: [
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
    }
]
if (process.platform === 'darwin') {
    const name = 'Notes'
    template.unshift({
        label: name
    })
}

module.exports = Menu.buildFromTemplate(template)