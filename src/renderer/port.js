const { SerialPort } = require('serialport')

var Port = {
    // restart 7e 39 70 12 00 00 70 07 00 (72 65 73 74 61 72 74) b5 7f
    // 7e 39 30 09 00 7e 39 30 09 00 60 30 80 7f
    // 7E 39 30 09 00 7E 39 30 09 00 60 30 80 7F
    constCommand: [0x7E,0x39,0x30,0x09,0x00,0x7E,0x39,0x30,0x09,0x00,0x60,0x30,0x80,0x7F],
    SerialPortCache: null,
    message: [],
    async init() {
        if( Port.SerialPortCache) {
            await Port.SerialPortCache.close()
        }
        Port.SerialPortCache = null
        Port.message = []
        let list = await Port.getList()
        list.forEach((item) => {
            Port.connectPort({path: item.path})
        })
    },
    getList() {
        return SerialPort.list()
    },
    async connectPort({path, baudRate = 9600, autoOpen = false, stopBits = 1, parity = 'none', flowControl = false},callback) {
        let p = await new SerialPort({ path,  baudRate, autoOpen, stopBits, parity, flowControl})
        p.open(function(openErr) {
            if(!openErr) {// 开启成功
                p.on('data', function(data) { // 连接成功并且能发送数据
                    console.log(data.toString('hex'))
                    if(RenderObj) {
                        RenderObj.refreshMessage({
                            id: Port.format(),
                            description: data.toString('hex')
                        })
                    }
                    Port.SerialPortCache = p
                })
                p.on('error', function (err) {
                    console.log('Error: ', err);
                })
                p.on('close', function (err) {
                    console.log('close: ', err);
                })
                Port.writeCommonCommand({command: Port.constCommand, p})
            }
            return null
        })
        
    },
    writeCommonCommand({command, p, callback}) {
        if(!p) {
            p = Port.SerialPortCache
        }
        if (!command) {
            command = Port.constCommand
        }
        if(!p) {
            callback && callback('未找到可连接的设备')
            return
        }
        p.write(command, 'hex', function(err) {
            callback && callback(err)
        })
    },
    format() { 
        var date = new Date()
        let year = date.getFullYear()
        let month = date.getMonth() + 1
        let day = date.getDate()
        let hour = date.getHours()
        let minute = date.getMinutes()
        let second = date.getSeconds()
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`
    }
}