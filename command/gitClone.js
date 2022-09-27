const spawn = require('cross-spawn')
const logUpdate = require('log-update')
// const SAOError = require('./SAOError')
const spinner = require('./utils/spinner')
const logger = require('./utils/logger')

module.exports = async ({
  cwd = process.cwd()
}) => {
  return new Promise((resolve, reject) => {
    const args = ['clone', 'https://github.com/andamicompany/andamiComponents.git']

    logger.info('Git clone to ', cwd, '   env : ', process.cwd())
    spinner.start(`Start Git clone !!`)
    const ps = spawn('git', args, {
      stdio: [0, 'pipe', 'pipe'],
      cwd,
      env: Object.assign(
        {
          FORCE_COLOR: true,
        },
        process.env
      )
    })

    let stdoutLogs = ''
    let stderrLogs = ''

    ps.stdout &&
      ps.stdout.setEncoding('utf8').on('data', data => {
        stdoutLogs += data
        spinner.stop()
        logUpdate(stdoutLogs)
        spinner.start()
      })

    ps.stderr &&
      ps.stderr.setEncoding('utf8').on('data', data => {
        stderrLogs += data
        spinner.stop()
        logUpdate.clear()
        logUpdate.stderr(stderrLogs)
        logUpdate(stdoutLogs)
        spinner.start()
      })

    ps.on('close', code => {
      spinner.stop()
      // Clear output when succeeded
      if (code === 0) {
        logUpdate.clear()
        logUpdate.stderr.clear()
        logger.success(`Git clone`)
      } else {
        logger.error(`Failed to Git clone`)
      }
      resolve({ code })
    })

    ps.on('error', reject)
  })
}
