const cardList =[{
    title: '查看设备',
    description: '查看设备消息',
    icon: 'icon-shebeixinxihuoqu',
    key: 'back'
},{
    title: '回到桌面',
    description: '返回桌面',
    icon: 'icon-zhuomian',
    key: 'back'
}, {
    title: '睡眠',
    description: '进入睡眠状态',
    icon: 'icon-shuimian',
    key: 'sleep'
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
    command: 'reboot'
}]
module.exports = {
    cardList
}