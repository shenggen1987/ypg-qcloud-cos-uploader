const COS = require('cos-nodejs-sdk-v5')
const task = require('./task')
const logger = require('./logger')
let previewUrls = []

const onProgress = (info, config) => {
    const percent = parseInt(info.percent * 10000) / 100
    const speed = parseInt(info.speed / 1024 * 100) / 100

    if (!config.debug) {
        logger.logEnd('upload-progress', `${logger.progressTemplate(percent)} ${info.loaded}/${info.total} 上传速率：${speed}Kb/s`)
    }
}

const onFileFinish = (err, data, options, config) => {
    // debug log
    if (config.debug) {
        console.log(options)
    }

    task.updateByKey(options.Key, { hasDone: true, isSuccess: !err })

    // config.qrCode
    if ((new RegExp(config.qrCode)).test(options.FilePath)) {
        // 默认链接
        previewUrls.push(options.url)

        // 添加拼装参数之后的链接
        Object.keys(config.suffix)
            .filter(regStr => (new RegExp(regStr)).test(options.FilePath))
            .forEach(regStr => {
                const suffix = config.suffix[regStr]
                if (typeof suffix === 'string') previewUrls.push(`${options.url}${config.suffix[regStr]}`)
                if (Array.isArray(suffix)) {
                    suffix.forEach(suffix => previewUrls.push(`${options.url}${suffix}`))
                }
            })
    }

    // 结果
    if (task.isAllDone()) {
        if (config.debug) {
            console.log('result-success', `上传结束，成功：${task.countSuccess()}/${task.countDone()}`)
            if (task.countFailed() > 0) {
                console.log('result-fail', '上传失败文件：')
                console.log('result-fail-files', task.getFailedList().map(task => task.FilePath))
            }
        } else {
            // 打印链接和二维码
            previewUrls.forEach(url => require('./utils').printQrcode(url, config))
        }
    }
}

module.exports = {
    runUploadTasks (config) {
        const cos = new COS({ SecretId: config.secretId, SecretKey: config.secretKey })
        cos.uploadFiles({
            files: task.createTaskQueue(config),
            onProgress: (info) => onProgress(info, config),
            onFileFinish: (err, data, options) => onFileFinish(err, data, options, config)
        })
    }
}
