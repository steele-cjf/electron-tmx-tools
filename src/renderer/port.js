const { SerialPort } = require('serialport')
var {ipcRenderer} = require('electron')

var Port = {
    // restart 7e 39 70 12 00 00 70 07 00 72 65 73 74 61 72 74 b5 7f
    // 7e 39 30 09 00 7e 39 30 09 00 60 30 80 7f
    // 7E 39 30 09 00 7E 39 30 09 00 60 30 80 7F
    constCommand: [0x7E,0x39,0x30,0x09,0x00,0x7E,0x39,0x30,0x09,0x00,0x60,0x30,0x80,0x7F],
    SerialPortCache: null,
    checkConnect: false,
    async init() {
        if( Port.SerialPortCache) {
            await Port.SerialPortCache.close()
        }
        Port.SerialPortCache = null
        let list = await Port.getList()
        await list.forEach((item) => {
            this.connectPort({path: item.path})
        })
        setTimeout(() => {
            if(!Port.checkConnect) {
                ipcRenderer.send('portText',{ type: 'error', text: `no port can connect！`})
            }
        }, 1000)
    },
    getList() {
        return SerialPort.list()
    },
    // 连接串口
    async connectPort({path, baudRate = 9600, autoOpen = false, stopBits = 1, parity = 'none', flowControl = false}) {
        let p = await new SerialPort({ path,  baudRate, autoOpen, stopBits, parity, flowControl})
        let _this = this
        p.open(function(openErr) {
            if(!openErr) {// 开启成功
                Port.checkConnect = true
                ipcRenderer.send('portText',{ type: 'success', text: `connect ${path} success`})
                p.on('data', function(data) { // 监听读取
                    ipcRenderer.send('portText',{ type: 'success', text: `Get data:${data.toString('hex').toLowerCase()} `})
                    Port.SerialPortCache = p
                    _this.formatData(data) // 格式化数据
                })
                p.on('error', function (err) {
                    ipcRenderer.send('portText',{ type: 'error', text: `error: ${err}`})
                    console.log('Error: ', err);
                })
                p.on('close', function (err) {
                    ipcRenderer.send('portText',{ type: 'error', text: `Close ${path}: ${err}`})
                    console.log('close: ', err);
                })
                p.write(Port.constCommand, 'hex')// 检验是否能写数据
            }
            return null
        })
        
    },
    // 写入指令
    sendCommand({command, p}, callback) {
        command = this.formatCommand(command)
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
    formatCommand(code) {
        return code && code.split(' ').map((item) => '0x' + item)
    }, 
    formatData(data) {
        // 业务定制化处理
        let _this = this
        let str = data.toString('hex').toLowerCase().split('7e')// Start(2)
        let s = str[str.length - 1].trim() // 防止重复返回7e
        if(s && s.length > 12) {
            s = Port.SplitFn(2, s).split(' ')  // 分割成xx xx xx xx
            let startCode = '7e',
            addressCode = s[0],
            controlCode = s[1],
            dataLength = s[3] + s[2],
            commandId = s[5] + s[4],
            payloadLen = s[7] + s[6],
            message = startCode + ' ' + s.join(' ')

            if (commandCf[controlCode] && commandCf[controlCode][commandId] === 'transparent') {
                let len = parseInt(payloadLen, 16)
                let result = s.slice(8, 8 + len)
                let key = result.join('')
                let strEnd = _this.hextoString(result.join(''))
                var t = 'Transparent data：'+ (strEnd || key || 'no data')
                ipcRenderer.send('portText',{ type: 'success', text: t})
                Home.dataListener({
                    text: t,
                    key: strEnd,
                    message
                })
            } else {
                ipcRenderer.send('portText',{ type: 'error', text: 'it is not transparent code:' + message})
            }
        }
    },
    
    // 分割字符串
    SplitFn(length, str) {
      var reg = new RegExp('[^\n]{1,'+length+'}','g')
      var res = str.match(reg)
      return res.join(' ')
    },
    hextoString (hex) {
        var arr = hex.split("")
        var out = ""
        for (var i = 0; i < arr.length / 2; i++) {
            var tmp = "0x" + arr[i * 2] + arr[i * 2 + 1]
            var charValue = String.fromCharCode(tmp);
            out += charValue
        }
        return out
    }
}