module.exports = {
  prompts() {
    return [
      {
        name: 'name',
        message: '프로젝트 이름을 입력하세요22.',
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
  async completed() {
    // this.gitInit()
    require('./command/gitClone')()
    await this.npmInstall({
      packages: ['andami-components-package'],
      registry: 'http://verdaccio.andami.kr'
    })
    await this.npmInstall()
    this.showProjectTips()
  }
}
