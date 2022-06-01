const { BrowserWindow } = require('electron')

const createWindowFn = function(htmlPath, preloadPath, { 
    width = 290,
    height = 150,
    frame = false,
    resizable = false,
    movable = false,
    alwaysOnTop = false,
    x,
    y,
    closeCallback,
    readyCallback
}) {
    
    const newWindow = new BrowserWindow({
        width,
        height,
        frame,
        resizable,
        movable,
        alwaysOnTop,
        x,      
        y,
        webPreferences: {
            nodeIntegration: true, // to allow require
            contextIsolation: false, // allow use with Electron 12+
            enableRemoteModule: true,
            preload: preloadPath,
            devTools: false,
        }
    })

    
    newWindow.loadFile(htmlPath)
    newWindow.on('ready-to-show',function(){
        newWindow.show();
        console.log('show')
        readyCallback && readyCallback()
    })
    newWindow.on('close', (event) => {
        // 截获 close 默认行为
        console.log('destory')
        event.preventDefault();
        newWindow.destroy()
        closeCallback && closeCallback()
    });
    require('@electron/remote/main').enable(newWindow.webContents)
    return newWindow
}
module.exports = {
    createWindowFn
}