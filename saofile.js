const rimraf = require('rimraf');
const logger = require('./command/utils/logger')
module.exports = {
  prompts() {
    return [
      {
        name: 'name',
        message: '프로젝트 이름을 입력하세요6.',
        default: this.outFolder,
        filter: val => val.toLowerCase()
      },
      {
        name: 'description',
        message: '프로젝트에 대한 설명을 입력하세요.',
        default: `my project`
      },
      {
        name: 'username',
        message: 'GitHub username을 입력하세요.',
        default: this.gitUser.username || this.gitUser.name,
        filter: val => val.toLowerCase(),
        store: true
      },
      {
        name: 'email',
        message: 'email을 입력하세요.',
        default: this.gitUser.email,
        store: true
      },
      {
        name: 'website',
        message: 'Github URL을 입력하세요.',
        default({ username }) {
          return `github.com/${username}`
        },
        store: true
      }
    ]
  },
  actions: [
    {
      type: 'add',
      files: '**'
    },
    {
      type: 'move',
      patterns: {
        gitignore: '.gitignore'
      }
    }
  ],
  async completed(prompts) {
    // this.gitInit()
    logger.info('## prompts.sao : ', prompts.sao.opts)
    logger.info('## env cwd : ', process.cwd(), ' name: ', prompts._answers.name)
    // await require('./command/gitClone')({ cwd: process.cwd() })
    // ** 1. Andami-components source gitclone
    await require('./command/gitClone')({ cwd: process.cwd(), username: prompts._answers.name })
    // ** 2. package modify
    await require('./command/runActions')(
      {
        actions: [
          {
            type: 'modify',
            files: 'package.json',
            handler(data, filepath) {
              data.name = prompts._answers.name
              data.version = '1.0.0'
              data.description = prompts._answers.description
              data.homepage = prompts._answers.website
              data.author = {
                name: prompts._answers.username,
                email: prompts._answers.email,
                url: prompts._answers.website
              }
              return data
            }
          },
        ]
      },
      prompts.sao.opts
    )
    // ** 3. Andami-components-package npm install
    await this.npmInstall({
      packages: ['andami-components-package'],
      registry: 'http://verdaccio.andami.kr'
    })
    // ** 4. npm install
    await this.npmInstall()
    // ** 5. git clone data delete
    rimraf.sync(`${prompts._answers.name}/.git`);
    // ** 6. success message show
    this.showProjectTips()
  }
}
