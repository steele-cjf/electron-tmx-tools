// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { SerialPort } = require('serialport')
const $ = require('jquery')
const jQuery  = $ // 必须执行，bootstrap限制
require('bootstrap')// 为了modal框
const { exec } = require('child_process');
const iconv = require('iconv-lite');
const encoding = 'cp936';
const binaryEncoding = 'binary';
const sleepTime = 10

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
      var card = cardList.find((item) => item.key === key)
      switch (key) {
        case 'device':
          // debugger
          break;
        case 'back':
          obj.windowCommond(card.command)
          break;
        case 'logoff':
        case 'reboot':
        case 'shutdown':
        case 'sleep':
          obj.showModal(key)
          break;
        default:
          break;
      }
    })
    // 模态框弹出监听事件
    $('#myModal').on('show.bs.modal', function (e) {
      clearTimeout(obj.timerObj)
      var num = sleepTime
      var title = $('#modalIndex').val()
      var card = cardList.find((item) => item.key === title)
      $('#secondShow').text(num)

      $('#myModalLabel').text(card.title)
      function timeLower() {
        if(num > 0) {
          obj.timerObj = setTimeout(() => {
            num = num - 1
            $('#secondShow').text(num)
            timeLower()
          }, 1000)
        } else {
          obj.windowCommond(card.command)
          $('#myModal').modal('hide')
        }
      }
      timeLower()
    })
    // 立即执行
    $('#okCommond').on('click', function() {
      var title = $('#modalIndex').val()
      var card = cardList.find((item) => item.key === title)
      obj.windowCommond(card.command)
      $('#myModal').modal('hide')
    })
     // 取消执行
     $('#cancelCommond').on('click', function() {
      clearTimeout(obj.timerObj)
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
  windowCommond(command) {
    // console.log(command)
    var result = exec(command,  { encoding: binaryEncoding }, function(err, stdout, stderr) {
      if(err || stderr) {
        var err =  iconv.decode(Buffer.from(stderr, binaryEncoding), encoding)
        obj.showWarn('error', err)
      }
    });
    result.stdin.end();
  },
  showWarn(type, text) {
    $('#alermContent').text(text)
    $('#alert').modal({
      keyboard: false,
      backdrop: false
    })
    setTimeout(() => {
      $('#alert').modal('hide')
    }, 1000)
  }
}
obj.init()