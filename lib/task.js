const fs = require('fs')
const path = require('path')
const uuidv1 = require('uuid/v1')()
const utils = require('./utils')

class Task {
    constructor ({ bucket, region, key, filePath, baseUrl, suffix }) {
        this.Bucket = bucket
        this.Region = region
        this.Key = key
        this.FilePath = filePath
        this.hasDone = false
        this.isSuccess = false
        this.fileType = path.extname(filePath)
        this.url = `${baseUrl}/${this.Key}`
        this.suffix = suffix

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

const count = () => Task.total.keyList.length

const getList = () => Task.total.keyList.map(key => Task.total.map[key])

const getDoneList = () => getList().filter(task => task.hasDone)

const getSuccessList = () => getList().filter(task => task.isSuccess)

const getFailedList = () => getList().filter(task => task.hasDone && !task.isSuccess)

const updateByKey = (key, payload = {}) => {
    Task.total.map[key] = {
        ...Task.total.map[key],
        ...payload
    }
}

const createIgnoreFilter = config => {
    const reg = new RegExp(config.ignore)
    return filePath => reg.test(filePath) === false
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
        // 过滤掉 ignore 匹配的文件
        .filter(createIgnoreFilter(config))
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
    count,
    getList,
    getDoneList,
    getSuccessList,
    getFailedList,
    updateByKey,
    createTaskQueue
}
