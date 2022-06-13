//渲染进程
const { screen, BrowserWindow } = require('@electron/remote')
var {ipcRenderer} = require('electron')
const $ = require('jquery')
const path = require('path')


var Home = {
    newWindow: false,
    timerObj:null,
    init() {
        Port.init()
        // setTimeout(() => {
        //     Port.sendCommand({command: '7e 39 70 12 00 00 70 07 00 64 65 73 6b 74 6f 70 b5 7f'})
        // }, 2000)
    },
    dataListener({key, text}, type) {
        if(Home.newWindow) return
        let _this = this
        var card = cardList.find((item) => item.key === key)
        switch (key) {
            case 'desktop':
            case 'logoff':
            case 'reboot':
            case 'shutdown':
            case 'sleep':
                _this.creatNewWindow(card)
              break;
            default:
              break;
        }
    },
    creatNewWindow(data) {
        if(!data) return
        ipcRenderer.send('commandData', data) // 主進程記錄
    }
}
Home.init()