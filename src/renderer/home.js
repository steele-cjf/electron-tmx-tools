//渲染进程
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
        let _this = this
        _this.appendText(text || key, type)
        var card = cardList.find((item) => item.key === key)
        switch (key) {
            case 'desktop':
                _this.windowCommond(card.command)
              break;
            case 'logoff':
            case 'reboot':
            case 'shutdown':
            case 'sleep':
                _this.showModal(key)
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
            var text = 'reboot'
            _this.dataListener({text, key: text}, 1)
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