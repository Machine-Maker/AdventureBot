const fs = require('fs')

module.exports.setup = bot =>
  new Promise((resolve, reject) => {
    fs.readdir('./events/', (err, files) => {
      if (err) reject(err)
      files.forEach(file => {
        const eventFunction = require(`../events/${file}`)
        if (eventFunction.disabled) return
        const event = eventFunction.event || file.split('.')[0]
        const emitter =
          (typeof eventFunction.emitter === 'string'
            ? bot[eventFunction.emitter]
            : eventFunction.emitter) || bot
        const once = eventFunction.once

        try {
          emitter[once ? 'once' : 'on'](event, (...args) => eventFunction.run(bot, ...args))
        } catch (err) {
          reject(err)
        }
      })
    })
  })
