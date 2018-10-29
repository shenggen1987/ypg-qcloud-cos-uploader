const pathResolve = require('path').resolve

/**
 * 配置在项目 package.json 里面的 key
 */
const CONFIG_KEY = 'cosUploader'

/**
 * 文档 URL
 */
const CONFIG_DOCS_URL = 'https://github.com/yuezhilunhui2009/cos-uploader'

/**
 * 文档位置提示
 */
const CONFIG_DOCS_TIP = `\nReference document: ${CONFIG_DOCS_URL}`

/**
 * 必填配置
 */
const CONFIG_REQUIRED_FIELD = ['secretId', 'secretKey', 'bucket', 'region', 'baseUrl']

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

        // 拼接链接需要的源 url = baseUrl + relativeFilePath
        'baseUrl': '',

        // 是否将文件上传到随机名字的文件夹
        'randomPrefix': false,

        // key：正则表达式字符串，用于匹配 filePath
        // value：值可以是字符串或者数组，使用数组时会生成 Array.length 个预览链接
        // example：
        //  {
        //    'foo\\.html$': '?k1=v1&k2=v2#section1'
        //  }
        // 原始链接：https://xxx.xxx/foo.html
        // 最终打印链接：https://xxx.xxx/foo.html?k1=v1&k2=v2#section1
        'suffix': {},

        // 生成二维码规则
        'qrCode': '\\.html$',

        // 是否打印每个文件的上传信息到控制台
        'debug': false
    }

    return {
        ...standardConfig,
        ...config
    }
}

const readConfig = () => {
    const pkg = require(pathResolve(process.cwd(), 'package.json'))
    const config = pkg[CONFIG_KEY]

    if (typeof config !== 'object') {
        throw Error(`"cos-uploader" can't be found in package.json ${CONFIG_DOCS_TIP}`)
    }

    CONFIG_REQUIRED_FIELD.forEach(requiredField => {
        if (config[requiredField] === undefined || config[requiredField] === '') {
            throw Error(`config field "${requiredField}" must be required ${CONFIG_DOCS_TIP}`)
        }
    })
    return normalizeConfig(config)
}

module.exports = {
    CONFIG_DOCS_TIP,
    ...readConfig()
}
