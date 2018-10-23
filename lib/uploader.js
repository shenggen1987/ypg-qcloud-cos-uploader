const COS = require('cos-nodejs-sdk-v5')
const task = require('./task')
const logger = require('./logger')

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

    if (options.fileType === '.html') {
        require('qrcode-terminal').generate(options.url, {
            small: true
        }, function (qrcode) {
            if (!config.debug) {
                logger.logHead(options.url, `${options.url} \n\n${qrcode}`)
            }
        })
    }

    const total = task.count()
    const doneCount = task.getDoneList().length
    if (total === doneCount) {
        const successCount = task.getSuccessList().length
        const failCount = task.getFailedList().length
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
