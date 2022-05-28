// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { SerialPort } = require('serialport')
const $ = require('jquery')
const jQuery  = $ // 必须执行，bootstrap限制
require('bootstrap')// 为了modal框
const { exec } = require('child_process');

var obj = {
  timerObj:null,
  init() {
    // 根据块渲染列表
    var dom = cardList.map(item => {
      return `<div class="module-box" data-key="${item.key}">
          <div class="media-left media-middle">
              <span class='iconfont ${item.icon} media-left-icon'></span>
          </div>
          <div class="media-left media-middle">
              <h4 class="media-heading">${item.title}</h4>
              <description class='description'>${item.description}</description>
          </div>
      </div>`
    })
    $('#contentBox').html(dom.join(''))
    this.clickInit()
  },
  // 点击事件声明
  clickInit() {
    // 卡片模块列表点击事件
    $('.module-box').on('click', function(e) {
      var key = e.currentTarget.dataset.key
      switch (key) {
        case 'back':
          break;
        case 'reboot':
          obj.showModal(key)
          break;
        case 'shutdown':
          obj.showModal(key)
          break;
        case 'sleep':
          break;
        default:
          break;
      }
    })
    // 模态框弹出事件
    $('#myModal').on('show.bs.modal', function (e) {
      var num = 6

      clearTimeout(obj.timerObj)
      var title = $('#modalIndex').val()
      $('#secondShow').text(num)

      var card = cardList.find((item) => item.key === title)
      $('#myModalLabel').text(card.title)
      function timeLower() {
        if(num > 0) {
          obj.timerObj = setTimeout(() => {
            num = num - 1
            $('#secondShow').text(num)
            timeLower()
          }, 1000)
        } else {
          obj.windowCommond(card.key, card.command)
          $('#myModal').modal('hide')
        }
      }
      timeLower()
    })
    // 立即执行
    $('#okCommond').on('click', function() {
      var title = $('#modalIndex').val()
      var card = cardList.find((item) => item.key === title)
      obj.windowCommond(card.key, card.command)
      $('#myModal').modal('hide')
    })
  },
  showModal (type) {
    $('#modalIndex').val(type)
    $('#myModal').modal({
      keyboard: false,
      backdrop: 'static'
    })
  },
  // windows 电脑指令
  windowCommond(key, command) {
    var result = exec(command, function(err, stdout, stderr) {
      if(err || stderr) {
          console.log(key + " failed" + err + stderr);
      }
    });
    result.stdin.end();
    result.on('close', function(code) {
        console.log("key",  code);
    });
  }
}
obj.init()