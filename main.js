require('@electron/remote/main').initialize()
const { app, BrowserWindow, Tray, Menu, screen, ipcMain } = require('electron')
const path = require('path')
const { createWindowFn } = require('./src/tools')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
function createWindow() {
    process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
    // Create the browser window.
    let display = screen.getPrimaryDisplay().workAreaSize;
    let preloadPath = path.join(__dirname, './preload.js')
    let htmlPath = path.join(__dirname, './src/index.html')
    // const mainWindow = createWindowFn(htmlPath, preloadPath, {
    //     // frame: false,
    //     alwaysOnTop: true,
    //     // autoHideMenuBar: true,
    //     x: display.width - 305,      
    //     y: display.height - 158
    // })
    const offset = 15
    const width = 290
    const height = 150
    const mainWindow = new BrowserWindow({
        width,
        height,
        // frame: false,
        autoHideMenuBar: true,
        resizable: false,
        movable: false,
        // alwaysOnTop: true,
        x: display.width - width - offset,      
        y: display.height - height - offset,
        show: true,
        webPreferences: {
            nodeIntegration: true, // to allow require
            contextIsolation: false, // allow use with Electron 12+
            enableRemoteModule: true,
            preload: preloadPath,
            devTools: false,
        }
    })
    mainWindow.loadFile(htmlPath)

    // 右下角按鈕
    function initTrayIcon() {
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
                label: 'close',
                click: () => {
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
    initTrayIcon()
    //  触发关闭时触发
     mainWindow.on('close', (event) => {
        // 截获 close 默认行为
        event.preventDefault();
        // 点击关闭时触发close事件，我们按照之前的思路在关闭时，隐藏窗口，隐藏任务栏窗口
        mainWindow.hide();
        mainWindow.setSkipTaskbar(true);

    });
    // and load the index.html of the app.
    
     //增加该配置
     require('@electron/remote/main').enable(mainWindow.webContents)
    // Open the DevTools.
    mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
var newWindowCheck = false

app.whenReady().then(() => {
    createWindow()
    //主进程接受事件
    ipcMain.on('commandData', (event, arg) => {
        if(newWindowCheck) return
        newWindowCheck = true
        let display = screen.getPrimaryDisplay().workAreaSize;
        let preloadPath = path.join(__dirname, './src/renderer/notification/preload.js')
        let htmlPath = path.join(__dirname, './src/renderer/notification/index.html')
        var newWindow = createWindowFn(htmlPath, preloadPath, {
            x: display.width - 305,      
            y: display.height - 158,
            closeCallback: function(){
                newWindowCheck = false
            },
            readyCallback: function() {
                newWindow.webContents.send('replyChildToMain', arg)
            }
        })
        newWindow.webContents.openDevTools()
    })

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