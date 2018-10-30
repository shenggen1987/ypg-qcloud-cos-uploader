const stdout = require('single-line-log').stdout
const logGroup = {}
const logIndex = []

module.exports = {
    logHead (id, content = '.') {
        if (!logGroup[id]) {
            logIndex.unshift(id)
        }

        logGroup[id] = content
        stdout(logIndex.map(id => logGroup[id]).join('\n\n'))
    },
    logEnd (id, content = '.') {
        if (!logGroup[id]) {
            logIndex.push(id)
        }

        logGroup[id] = content
        stdout(logIndex.map(id => logGroup[id]).join('\n\n'))
    },
    removeLog (id) {
        delete logGroup[id]
    },
    progressTemplate (progress) {
        progress = Math.round(progress / 2)
        const rest = 50 - progress
        return `上传进度：${'█'.repeat(progress)}${'░'.repeat(rest)} ${progress * 2}%`
    }
}
