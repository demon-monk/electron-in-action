const {
    app, // 1.hide, show, quit the application 2. events: before-quit, window-all-closed, browser-window-blur, and browser-window-focus
} = require('electron')

app.on('ready', () => {
    console.log('Hello from electron');
})