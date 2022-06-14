require('@electron/remote/main').initialize()
const { app, BrowserWindow, Tray, Menu, screen, ipcMain } = require('electron')
const path = require('path')
const { createWindowFn } = require('./src/tools')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var newWindowCheck = false

function createWindow() {
    process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
   
    var debugWindow = debugWindowObj()
    var mainWindow = mainWindowObj()
    
    initTrayIcon(mainWindow, debugWindow)
    
    ipcMain.on('portText', (event, arg) => {
        debugWindow.webContents.send('getPortText', arg)
    })
    //主进程接受事件
    ipcMain.on('commandData', (event, arg) => {
        if(newWindowCheck) return
        newWindowCheck = true
        setTimeout(() => {
            newWindowCheck = false
        }, 8000)
        let display = screen.getPrimaryDisplay().workAreaSize;
        let preloadPath = path.join(__dirname, './src/renderer/notification/preload.js')
        let htmlPath = path.join(__dirname, './src/renderer/notification/index.html')
        var newWindow = createWindowFn(htmlPath, preloadPath, {
            x: display.width - 305,      
            y: display.height - 158,
            readyCallback: function() {
                newWindow.webContents.send('replyChildToMain', arg)
            }
        })
        // newWindow.webContents.openDevTools()
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.whenReady().then(() => {
    createWindow()
    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})
  
  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
  })

  function mainWindowObj() {
       // Create the browser window.
    let display = screen.getPrimaryDisplay().workAreaSize;
    let preloadPath = path.join(__dirname, './preload.js')
    let htmlPath = path.join(__dirname, './src/index.html')
    const offset = 15
    const width = 290
    const height = 150
    const mainWindow = new BrowserWindow({
        width,
        height,
        autoHideMenuBar: true,
        resizable: false,
        movable: false,
        x: display.width - width - offset,      
        y: display.height - height - offset,
        show: false,
        webPreferences: {
            nodeIntegration: true, // to allow require
            contextIsolation: false, // allow use with Electron 12+
            enableRemoteModule: true,
            preload: preloadPath,
            devTools: false,
        }
    })
    mainWindow.loadFile(htmlPath)
    require('@electron/remote/main').enable(mainWindow.webContents)
    mainWindow.webContents.openDevTools()

    //  触发关闭时触发
    mainWindow.on('close', (event) => {
        // 截获 close 默认行为
        event.preventDefault();
        // 点击关闭时触发close事件，我们按照之前的思路在关闭时，隐藏窗口，隐藏任务栏窗口
        mainWindow.hide();
        mainWindow.setSkipTaskbar(true);

    });
    return mainWindow
  }

  function debugWindowObj() {
    // Create the browser window.
    let debugPreloadPath = path.join(__dirname, './preload.js')
    let debughtmlPath = path.join(__dirname, './src/renderer/debugger/index.html')
    const debugWindow = new BrowserWindow({
        width: 900,
        height: 600,
        autoHideMenuBar: true,
        resizable: true,
        movable: true,
        center: true,
        show: false,
        webPreferences: {
            nodeIntegration: true, // to allow require
            contextIsolation: false, // allow use with Electron 12+
            enableRemoteModule: true,
            preload: debugPreloadPath,
            devTools: true,
        }
    })
    debugWindow.loadFile(debughtmlPath)
    
    require('@electron/remote/main').enable(debugWindow.webContents)
    //  触发关闭时触发
    debugWindow.on('close', (event) => {
        // 截获 close 默认行为
        event.preventDefault();
        // 点击关闭时触发close事件，我们按照之前的思路在关闭时，隐藏窗口，隐藏任务栏窗口
        debugWindow.hide();
        debugWindow.setSkipTaskbar(true);

    });
    // Open the DevTools.
    debugWindow.webContents.openDevTools()
    return debugWindow
}


// 右下角按鈕
function initTrayIcon(mainWindow, debugWindow) {
    let icoPath = path.join(__dirname, './src/assets/img/thingsmatrix.ico')
    const tray = new Tray(icoPath);
    const trayContextMenu = Menu.buildFromTemplate([
        {
            label: 'open',
            click: () => {
                mainWindow.setSkipTaskbar(false);
                mainWindow.show()
            }
        }, {
            label: 'debug log',
            click: () => {
                debugWindow.setSkipTaskbar(false);
                debugWindow.show()
            }
        }, {
            label: 'close',
            click: () => {
                debugWindow.destroy()
                mainWindow.destroy()
            }
        }
    ]);
    tray.setToolTip('thingsmatrix');
    tray.on('click', () => {
        mainWindow.setSkipTaskbar(false);
        mainWindow.show()
    });
    tray.on('right-click', () => {
        tray.popUpContextMenu(trayContextMenu);
    });
}