const fs = require('fs')
const path = require('path')
const uuidv1 = require('uuid/v1')()
const utils = require('./utils')

class Task {
    constructor ({ bucket, region, key, filePath, baseUrl }) {
        this.Bucket = bucket
        this.Region = region
        this.Key = key
        this.FilePath = filePath
        this.hasDone = false
        this.isSuccess = false
        this.fileType = path.extname(filePath)
        this.baseUrl = baseUrl.replace(/\/*$/, '')
        this.url = `${this.baseUrl}/${this.Key}`

        if (!Task.total) {
            Task.total = {
                progress: 0,
                map: {},
                keyList: []
            }
        }

        Task.total.map[key] = this
        Task.total.keyList.push(key)
    }
}

const getList = () => Task.total.keyList.map(key => Task.total.map[key])

const getDoneList = () => getList().filter(task => task.hasDone)

const getSuccessList = () => getList().filter(task => task.isSuccess)

const getFailedList = () => getList().filter(task => task.hasDone && !task.isSuccess)

const count = () => Task.total.keyList.length

const countDone = () => getDoneList().length

const countSuccess = () => getSuccessList().length

const countFailed = () => getFailedList().length

const isAllDone = () => count() === countDone()

const updateByKey = (key, payload = {}) => {
    Task.total.map[key] = {
        ...Task.total.map[key],
        ...payload
    }
}

const generateKey = config => filePath => {
    let normalizePath = path.normalize(path.relative(utils.resolveAbsPath(config.path), filePath))
    normalizePath = normalizePath.split(path.sep).join('/')
    return `${config.randomPrefix ? uuidv1 : ''}${config.randomPrefix ? '/' : ''}${normalizePath}`
}

const createTaskQueue = config => {
    const taskQueue = utils
        // 扫描待上传文件路径
        .walk(config.path)
        // 创建上传任务队列
        .map(filePath => new Task({
            bucket: config.bucket,
            region: config.region,
            key: generateKey(config)(filePath),
            filePath,
            baseUrl: config.baseUrl
        }))
        // 调整上传任务队列顺序 - 将 .html 或 .htm 移动到队列末尾
        .sort((prevTask, nextTask) => prevTask.fileType.match(/\.html$|\.htm$/) ? 1 : -1)

    return taskQueue
}

module.exports = {
    getList,
    getDoneList,
    getSuccessList,
    getFailedList,
    count,
    countDone,
    countSuccess,
    countFailed,
    isAllDone,
    updateByKey,
    createTaskQueue
}
