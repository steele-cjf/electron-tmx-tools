//渲染进程
const { screen, BrowserWindow } = require('@electron/remote')
const {ipcRenderer} = require('electron')

const $ = require('jquery')
const jQuery  = $ // 必须执行，bootstrap需要
require('bootstrap')// 引入modal alert等js插件，当前使用的是v3版本

var Debugger = {
    newWindow: false,
    timerObj:null,
    init() {
        let _this = this
        _this.appendText('welcome to thingsmatrix ')
        ipcRenderer.on('getPortText', function(event, arg) {
            if (!arg) return
            if(arg.type === 'error') {
                _this.appendText(arg.text, 400)
            } else if(arg.type === 'success') {
                _this.appendText(arg.text, 1)
            }
            console.log(88888, arg)
            // alert(arg)
        })
    },
    appendText(text, type) {
        var dom = getDomTel(text, type)
        $('#textShow').append(dom)
        var height = $('#textShow').prop("scrollHeight"); //等同 $('.out-box')[0].scrollHeight
        $('#textShow').scrollTop(height);
    }
}
Debugger.init()