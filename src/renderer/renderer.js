// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const $ = require('jquery')
const jQuery  = $ // 必须执行，bootstrap需要
require('bootstrap')// 引入modal alert等js插件，当前使用的是v3版本
require('bootstrap-table')

const { exec } = require('child_process');
const iconv = require('iconv-lite');
const encoding = 'cp936';
const binaryEncoding = 'binary';
const sleepTime = 10

var RenderObj = {
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
    this.PortConnectInit()
  },
  // 连接port和初始化table
  PortConnectInit() {
    Port.init() // 接入模块
    $('#tableContent').bootstrapTable({
      columns: [{
        field: 'id',
        title: '#'
      }, {
        field: 'description',
        title: '接受消息'
      }]
    })
  },
  // 点击事件声明
  clickInit() {
    // 卡片列表点击事件
    $('.module-box').on('click', function(e) {
      var key = e.currentTarget.dataset.key
      var card = cardList.find((item) => item.key === key)
      switch (key) {
        case 'device':
          RenderObj.deciceOperation()
          break;
        case 'back':
          RenderObj.windowCommond(card.command)
          break;
        case 'logoff':
        case 'reboot':
        case 'shutdown':
        case 'sleep':
          RenderObj.showModal(key)
          break;
        default:
          break;
      }
    })
    // command模态框弹出监听事件
    $('#commondModal').on('show.bs.modal', function (e) {
      clearTimeout(RenderObj.timerObj)
      var num = sleepTime
      var title = $('#modalIndex').val()
      var card = cardList.find((item) => item.key === title)

      $('#secondShow').text(num)
      $('#myModalLabel').text(card.title)
      function timeLower() {
        if(num > 0) {
          RenderObj.timerObj = setTimeout(() => {
            num = num - 1
            $('#secondShow').text(num)
            timeLower()
          }, 1000)
        } else {
          RenderObj.windowCommond(card.command)
          $('#commondModal').modal('hide')
        }
      }
      timeLower()
    })
    // 重新连接
    $('#refreshConnect').on('click', function() {
      Port.init()
    })
    // 立即执行
    $('#okCommond').on('click', function() {
      var title = $('#modalIndex').val()
      var card = cardList.find((item) => item.key === title)
      RenderObj.windowCommond(card.command)
      $('#commondModal').modal('hide')
    })
     // 取消执行
     $('#cancelCommond').on('click', function() {
      clearTimeout(RenderObj.timerObj)
      $('#commondModal').modal('hide')
    })
    // 测试连接
    $('#testConnect').on('click', function() {
      Port.writeCommonCommand({
        callback: function(err) {
          if(!err) return
          RenderObj.showWarn('error', err)
        }
      })
    })
  },
  deciceOperation() {
    $('#deviceInfoModal').modal('show')
  },
  showModal (type) {
    $('#modalIndex').val(type)
    $('#commondModal').modal({
      keyboard: false,
      backdrop: 'static'
    })
  },
  // windows 电脑指令
  windowCommond(command) {
    var result = exec(command,  { encoding: binaryEncoding }, function(err, stdout, stderr) {
      if(err || stderr) {
        var err =  iconv.decode(Buffer.from(stderr, binaryEncoding), encoding)
        RenderObj.showWarn('error', err)
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
  // 刷新数据
  async refreshMessage(data) {
    $('#tableContent').bootstrapTable('prepend', data)
  }
}
RenderObj.init()