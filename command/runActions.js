const path = require('path')
const majo = require('majo')
const logger = require('./utils/logger')

module.exports = async (config, context) => {
  const actions =
    typeof config.actions === 'function'
      ? await config.actions.call(context, context)
      : config.actions

  for (const action of actions) {
    logger.debug('Running action:', action)
    if (action.handler) {
      const stream = majo()
      stream.source(action.files, { baseDir: context.outDir })
      stream.use(async ({ files }) => {
        await Promise.all(
          // eslint-disable-next-line array-callback-return
          Object.keys(files).map(async relativePath => {
            const isJson = relativePath.endsWith('.json')
            let contents = stream.fileContents(relativePath)
            if (isJson) {
              contents = JSON.parse(contents)
            }
            let result = await action.handler(contents, relativePath)
            if (isJson) {
              result = JSON.stringify(result, null, 2)
            }
            stream.writeContents(relativePath, result)
            logger.fileAction(
              'yellow',
              'Modified',
              path.join(context.outDir, relativePath)
            )
          })
        )
      })
      await stream.dest(context.outDir)
    }
  }
}
