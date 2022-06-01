const { BrowserWindow, screen } = require('electron')

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
    let display = screen.getPrimaryDisplay().workAreaSize;
    let w = display.width
    let t = (w - x)/100

    const newWindow = new BrowserWindow({
        width,
        height,
        frame,
        resizable,
        movable,
        alwaysOnTop,
        w,
        y,
        webPreferences: {
            nodeIntegration: true, // to allow require
            contextIsolation: false, // allow use with Electron 12+
            enableRemoteModule: true,
            preload: preloadPath,
            devTools: false,
        }
    })
    var _cache = setInterval(() => {
        if(w - t < x) clearInterval(_cache)
        w =Math.floor( w - t )
        try {
            newWindow.setBounds({
                x: w,
                width,
                y
            })
        } catch(e) {
            console.log(e)
        }
        
    }, 1)
    

    
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