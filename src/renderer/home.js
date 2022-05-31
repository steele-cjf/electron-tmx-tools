//渲染进程
const { dialog, getCurrentWindow } = require('@electron/remote')
const $ = require('jquery')
const jQuery  = $ // 必须执行，bootstrap需要
require('bootstrap')// 引入modal alert等js插件，当前使用的是v3版本

const { exec } = require('child_process');
const iconv = require('iconv-lite');
const encoding = 'cp936';
const binaryEncoding = 'binary';
const sleepTime = 10

var Home = {
    timerObj:null,
    init() {
        let _this = this
        _this.eventInit()
        Port.init()
        Port.sendCommand({command: '7E 39 30 09 00 7E 39 30 09 00 60 30 80 7F'})
        _this.appendText('welcome to thingsmatrix')
    },
    appendText(type, text) {
        var dom = getDomTel(type, text)
        $('#textShow').append(dom)
        var height = $('#textShow').prop("scrollHeight"); //等同 $('.out-box')[0].scrollHeight
        $('#textShow').scrollTop(height);
    },
    dataListener(text, type) {
        let _this = this
        _this.appendText(text, type)
        var card = cardList.find((item) => item.key === text)
        console.log(card)
        switch (text) {
            case 'back':
                _this.windowCommond(card.command)
              break;
            case 'logoff':
            case 'reboot':
            case 'shutdown':
            case 'sleep':
                _this.showModal(text)
              break;
            default:
              break;
        }
    },
    // windows 电脑指令
    windowCommond(command) {
        let _this = this
        var result = exec('command',  { encoding: binaryEncoding }, function(err, stdout, stderr) {
        if(err || stderr) {
            var err =  iconv.decode(Buffer.from(stderr, binaryEncoding), encoding)
            _this.showWarn('error', err)
        }
        });
        result.stdin.end();
    },
    // 弹出warning
    showWarn(type, text) {
        dialog.showMessageBox(getCurrentWindow(), {
            type:'error',
            title: `warning`,
            message: text
        })
        return
        $('#alermContent').text(text)
        $('#alert').modal({
            keyboard: false,
            backdrop: false
        })
        setTimeout(() => {
            $('#alert').modal('hide')
        }, 1000)
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
        $('#test').on('click', function() {
            var text = 'reboot'
            var card = cardList.find((item) => item.key === text)

            dialog.showMessageBox(getCurrentWindow(), {
                type:'warning',
                title: `${text} Countdown`,
                message: `8 seconds later ${text}，Click the Cancel button to interrupt`,
                buttons:['ok','cancel']
            }).then((item) => {
                if (item.response) {// cancel
                } else {
                    _this.windowCommond(card.command)
                }
            })
            
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
            _this.windowCommond(card.command)
            $('#commondModal').modal('hide')
        })
        // 取消执行
        $('#cancelCommond').on('click', function() {
            clearTimeout(_this.timerObj)
            $('#commondModal').modal('hide')
        })
    }
}
Home.init()