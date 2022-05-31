const cardList =[{
    title: '设备上报消息',
    description: '查看设备上报消息',
    icon: 'icon-shebeixinxihuoqu',
    key: 'device'
},{
    title: '回到桌面',
    description: '返回桌面',
    icon: 'icon-zhuomian',
    key: 'back',
    command: 'explorer.exe shell:::{3080F90D-D7AD-11D9-BD98-0000947B0257}'
}, {
    title: '注销',
    description: '注销电脑',
    icon: 'icon-shuimian',
    key: 'logoff',
    command: 'logoff'
}, {
    title: '睡眠',
    description: '进入睡眠状态',
    icon: 'icon-shuimian',
    key: 'sleep',
    command: 'shutdown -h'
}, {
    title: '关机',
    description: '关闭计算机',
    icon: 'icon-guanji',
    key: 'shutdown',
    command: 'shutdown -s -t 00'
}, {
    title: '重启',
    description: '重启计算机',
    icon: 'icon-restart-fill',
    key: 'reboot',
    command: 'shutdown -r -t 00'
}]

const commandCf = {
    // 39 70 0b 00 00 70 00 00 a2 7f
    '70': { // Control code
        '7000': 'transparent' // Command ID
    },
    // 39 00 09 00 03 00 c3 7f
    '00': {
        '0003': 'ecStatus',
        '0004': ''
    }
}
const getDomTel = function(text, type) {
    let date = formatTime()
    let domList = {
        0: `<p><span class='desc'></span>${text || '未知消息'}</p>`,
        1: `<p><span class='desc'>[${date}]  send-></span>${text || '未知消息'}</p>`,
        2: `<p><span class='desc'>[${date}]  return<-</span>${text || '未知消息'}</p>`,
        400: `<p class='error-content'>[${date}]  ${text || '未知消息'}</p>`,

    }
    return domList[type || 0] || domList[1]
}
function formatTime() { 
    var date = new Date()
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    let hour = date.getHours()
    let minute = date.getMinutes()
    let second = date.getSeconds()
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}
const hexCf = {
    '7265626F6F74': 'reboot',
    '73687574646F776E': 'shutdown',
    '6C6F676F6666': 'logoff',
    '736C656570': 'sleep',
    '6465736B746F70': 'desktop'
}
module.exports = {
    cardList,
    commandCf,
    getDomTel,
    hexCf
}

