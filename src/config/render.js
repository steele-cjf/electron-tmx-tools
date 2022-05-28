const cardList =[{
    title: '查看设备',
    description: '查看设备消息',
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
    command: 'shutdown -r now'
}]
module.exports = {
    cardList
}