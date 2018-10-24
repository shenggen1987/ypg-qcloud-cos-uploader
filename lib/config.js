const pathResolve = require('path').resolve

/**
 * 对传入的配置做标准化处理，保证所有配置项都存在
 * @param {object} config 外部配置对象
 */
const normalizeConfig = (config = {}) => {
    const standardConfig = {
        // 腾讯云 COS 必要参数
        'secretId': '',
        'secretKey': '',
        'bucket': '',
        'region': '',

        // 本地需要上传的文件夹（不包含文件夹本身）
        'path': 'dist',
        'filter': '\\.+',

        // 拼接链接需要的源 url = baseUrl + relativeFilePath
        'baseUrl': '',

        // 是否将文件上传到随机名字的文件夹
        'randomPrefix': true,

        // key：正则表达式字符串，用于匹配 filePath
        // value：值可以是字符串或者数组，使用数组时会生成 Array.length 个预览链接
        // example：
        //  {
        //    'foo\\.html$': '?k1=v1&k2=v2#section1'
        //  }
        // 原始链接：https://xxx.xxx/foo.html
        // 最终打印链接：https://xxx.xxx/foo.html?k1=v1&k2=v2#section1
        'query': {},

        // 生成二维码规则
        'qrcode': '\\.html$',

        // 是否打印每个文件的上传信息到控制台
        'debug': false
    }

    return {
        ...standardConfig,
        ...config
    }
}

const docsTip = '\nReference document: https://github.com/yuezhilunhui2009/cos-uploader'

const requiredConfig = ['secretId', 'secretKey', 'bucket', 'region', 'baseUrl']

const read = () => {
    const pkg = require(pathResolve(process.cwd(), 'package.json'))
    const config = pkg['cos-uploader']

    if (typeof config !== 'object') {
        throw Error(`"cos-uploader" can't be found in package.json ${docsTip}`)
    }

    requiredConfig.forEach(configKey => {
        if (config[configKey] === undefined || config[configKey] === '') {
            throw Error(`config field "${configKey}" must be required ${docsTip}`)
        }
    })
    return normalizeConfig(config)
}

module.exports = {
    read,
    docsTip
}
