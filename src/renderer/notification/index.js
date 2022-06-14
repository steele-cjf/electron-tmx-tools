const {ipcRenderer} = require('electron')
const { getCurrentWindow, dialog } = require('@electron/remote')

const { exec } = require('child_process');

const $ = require('jquery')
const iconv = require('iconv-lite');
const encoding = 'cp936';
const binaryEncoding = 'binary';
const sleepTime = 10

var notification = {
    timerObj: null,
    init() {
        ipcRenderer.on('replyChildToMain', function(event, arg) {
            notification.initEvent(arg)
            if (!arg) return
            notification.timeLower(arg)
        })
    },
    initEvent(card) {
        $('#cacelBtn, #errorBtn').on('click', function(e) {
            getCurrentWindow().close()
        })
        $('#okBtn').on('click', function(e) {
            notification.windowCommond(card.command)
        })
    },
    timeLower(card) {
        var num = sleepTime
        $('#command').text(card.key)
        var fn = function() {
            if(num > 0) {
                notification.timerObj = setTimeout(() => {
                    num = num - 1
                    $('#secondShow').text(num)
                    fn()
                }, 1000)
            } else {
                notification.windowCommond(card.command)
            }
        }
        fn()
    },
    // windows 电脑指令
    windowCommond(command) {
        var result = exec(command,  { encoding: binaryEncoding }, function(err, stdout, stderr) {
            if(err || stderr) {
                var title =  iconv.decode(Buffer.from(stderr, binaryEncoding), encoding)
                $('#contentBox').hide()
                $('#errorBody').css('display', 'flex')
                $('#erroBox').text(title || err)
                setTimeout(() => {
                    getCurrentWindow().close()
                }, 3000)
            } else {
                setTimeout(() => {
                    getCurrentWindow().close()
                }, 1000)
            }
        });
        result.stdin.end();
    },
}
notification.init()