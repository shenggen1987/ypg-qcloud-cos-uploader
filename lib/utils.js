const fs = require('fs')
const pathResolve = require('path').resolve
const pathIsAbsolute = require('path').isAbsolute

/**
 * 以当前进程运行目录为基准，计算传入的相对路径对应的绝对路径
 * @param {string} path 路径
 */
const resolveAbsPath = (path) => pathIsAbsolute(path) ? path : pathResolve(process.cwd(), path)

/**
 * 遍历目录，返回所有文件绝对路径列表
 * @param {string} dir 需要遍历的目录
 * @return {Array} 绝对路径数组
 */
const walk = (dir) => {
    let fileList = []
    let absDir = resolveAbsPath(dir)

    fs.readdirSync(absDir).forEach(dirItem => {
        const absPath = pathResolve(absDir, dirItem)
        if (fs.statSync(absPath).isDirectory()) {
            fileList = fileList.concat(walk(absPath))
        } else {
            fileList.push(absPath)
        }
    })
    return fileList
}

const printQrcode = (str, config) => {
    console.log('\r\n')
    require('qrcode-terminal').generate(str, {
        small: true
    }, function (qrcode) {
        if (!config.debug) {
            console.log(`${require('chalk').green(str)} \n${qrcode}`)
        }
    })
}

module.exports = {
    resolveAbsPath,
    walk,
    printQrcode
}
