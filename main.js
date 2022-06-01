const { app, BrowserWindow, Tray, Menu } = require('electron')
const path = require('path')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
function createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        backgroundColor: "#ccc",
        webPreferences: {
            nodeIntegration: true, // to allow require
            contextIsolation: false, // allow use with Electron 12+
            enableRemoteModule: true,
            preload: path.join(__dirname, './preload.js')
        }
    })
    function initTrayIcon() { 
      const tray = new Tray('./src/assets/img/thingsmatrix.ico');
      const trayContextMenu = Menu.buildFromTemplate([
          {
              label: 'open',
              click: () => {
                winShow(mainWindow)
              }
          }, {
              label: 'close',
              click: () => {
                app.quit()
              }
          }
      ]);
      tray.setToolTip('thingsmatrix');
      tray.on('click', () => {
          winShow(mainWindow)
      });
      tray.on('right-click', () => {
          tray.popUpContextMenu(trayContextMenu);
      });
      function winShow(win) {
          if (win.isVisible()) {
              if (win.isMinimized()) {
                  win.restore()
                  win.focus()
                } else {
                    win.focus()
                }
            } else {
                win.show()
                win.setSkipTaskbar(false)
            }
        }
  }
  initTrayIcon()
    // and load the index.html of the app.
    mainWindow.loadFile('./src/index.html')
    // Open the DevTools.
    mainWindow.webContents.openDevTools()
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