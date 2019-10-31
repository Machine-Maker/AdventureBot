const chalk = require('chalk')
const moment = require('moment')

const logTypes = {
  log: chalk.green,
  warn: chalk.yellow,
  error: chalk.red
}

module.exports.setup = () => {
  Object.keys(logTypes).forEach(method => {
    const old = console[method].bind(console)
    console[method] = function() {
      let msg = null
      if (typeof arguments[0] === 'object' && arguments[0].stack) arguments[0] = arguments[0].stack
      if (typeof arguments[0] === 'string') {
        msg = logTypes[method](
          String(arguments[0])
            .split('\n')
            .join(`\n${chalk.cyan(moment().format('MM-DD-YYYY HH:mm:ss'))}${chalk.blue('❱')} `)
        )
      } else msg = arguments[0]
      old.apply(
        console,
        [`${chalk.cyan(moment().format('MM-DD-YYYY HH:mm:ss'))}${chalk.blue('❱')}`].concat(msg)
      )
    }
  })
}
