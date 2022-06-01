//渲染进程
const { screen, BrowserWindow } = require('@electron/remote')
const {ipcRenderer} = require('electron')

const $ = require('jquery')
const jQuery  = $ // 必须执行，bootstrap需要
require('bootstrap')// 引入modal alert等js插件，当前使用的是v3版本
const path = require('path')
const { exec } = require('child_process');
const iconv = require('iconv-lite');
const encoding = 'cp936';
const binaryEncoding = 'binary';
const sleepTime = 10

var Home = {
    newWindow: false,
    timerObj:null,
    init() {
        let _this = this
        _this.appendText('welcome to thingsmatrix ')
        _this.eventInit()
        Port.init()
    },
    appendText(type, text) {
        var dom = getDomTel(type, text)
        $('#textShow').append(dom)
        var height = $('#textShow').prop("scrollHeight"); //等同 $('.out-box')[0].scrollHeight
        $('#textShow').scrollTop(height);
    },
    dataListener({key, text}, type) {
        if(Home.newWindow) return
        let _this = this
        _this.appendText(text || key, type)
        var card = cardList.find((item) => item.key === key)
        switch (key) {
            case 'desktop':
            //     Home.newWindow = true
            //     _this.windowCommond(card.command)
            //   break;
            case 'logoff':
            case 'reboot':
            case 'shutdown':
            case 'sleep':
                Home.newWindow = true
                _this.creatNewWindow(card)
              break;
            default:
              break;
        }
    },
    // dataListener(command) {
    //     let _this = this
    //     var fn = _this.debounce(_this.windowCommondFn, sleepTime * 1000)
    //     fn && fn(command)
    // },
    // windows 电脑指令
    windowCommond(command) {
        var result = exec(command,  { encoding: binaryEncoding }, function(err, stdout, stderr) {
            Home.newWindow = false
            if(err || stderr) {
                var title =  iconv.decode(Buffer.from(stderr, binaryEncoding), encoding)
                Home.appendText(title || err, 400)
                Home.showWarn('error', title || err)
            }
        });
        result.stdin.end();
    },
    // 弹出warning
    showWarn(type, text) {
        $('#alermContent').text(text)
        $('#alert').modal({
            keyboard: false,
            backdrop: false
        })
        setTimeout(() => {
            $('#alert').modal('hide')
        }, 1000)
    },
    creatNewWindow(data) {
        let preloadPath = path.join(__dirname, './renderer/notification/preload.js')
        let htmlPath = path.join(__dirname, './renderer/notification/index.html')
        console.log(preloadPath, htmlPath)
        let display = screen.getPrimaryDisplay().workAreaSize;
        const offset = 15
        const width = 290
        const height = 150
        ipcRenderer.send('commandData', data) // 主進程記錄
        const mainWindow = new BrowserWindow({
            // width,
            // height,
            // frame: false,
            // resizable: false,
            // movable: false,
            // alwaysOnTop: true,
            // x: display.width - width - offset,      
            // y: display.height - height - offset,
            webPreferences: {
                nodeIntegration: true, // to allow require
                contextIsolation: false, // allow use with Electron 12+
                enableRemoteModule: true,
                preload: preloadPath,
                devTools: false,
            }
        })
        mainWindow.loadFile(htmlPath)
        mainWindow.webContents.openDevTools()

    },
    showModal (type) {
        $('#modalIndex').val(type)
        $('#commondModal').modal({
          keyboard: false,
          backdrop: 'static'
        })
    },
    eventInit() {
        let _this = this
        // 测试点击事件
        $('#test').on('click', function() {
            // var text = 'reboot'
            // _this.dataListener({text, key: text}, 1)
        })

         // command模态框弹出监听事件
        $('#commondModal').on('show.bs.modal', function (e) {
            clearTimeout(_this.timerObj)
            var num = sleepTime
            var title = $('#modalIndex').val()
            var card = cardList.find((item) => item.key === title)
    
            $('#secondShow').text(num)
            $('#myModalLabel').text(title)
            function timeLower() {
                if(num > 0) {
                    _this.timerObj = setTimeout(() => {
                        num = num - 1
                        $('#secondShow').text(num)
                        timeLower()
                    }, 1000)
                } else {
                    clearTimeout(_this.timerObj)
                    _this.windowCommond(card.command)
                    $('#commondModal').modal('hide')
                }
            }
            timeLower()
        })
        // 立即执行
        $('#okCommond').on('click', function() {
            var title = $('#modalIndex').val()
            var card = cardList.find((item) => item.key === title)
            clearTimeout(_this.timerObj)
            _this.windowCommond(card.command)
            $('#commondModal').modal('hide')
        })
        // 取消执行
        $('#cancelCommond').on('click', function() {
            clearTimeout(_this.timerObj)
            $('#commondModal').modal('hide')
        })
    },
    debounce(fn, delay) {
        var timer
        return function () {
          var context = this
          var args = arguments
          clearTimeout(timer)
          timer = setTimeout(function () {
            fn.apply(context, args)
          }, delay)
        }
      }
}
Home.init()