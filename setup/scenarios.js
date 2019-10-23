const fs = require('fs')
const chalk = require('chalk')

const Scenario = require('../entities/Scenario')

module.exports.setup = bot =>
  new Promise((resolve, reject) => {
    const promises = []
    const scenarioFiles = fs
      .readdirSync(bot.config.scenario_directory)
      .filter(name => fs.statSync(`${bot.config.scenario_directory}/${name}`).isDirectory())
    if (scenarioFiles.length) {
      console.log('Parsing scenarios...')
      scenarioFiles.forEach(dir => {
        const scenario = new Scenario(`${bot.config.scenario_directory}/${dir}`)
        promises.push(scenario.parseScenario())
      })
    }

    const scenarios = []
    Promise.allSettled(promises).then(results => {
      results.forEach(res => {
        if (res.status === 'fulfilled') {
          scenarios.push(res.value)
          console.log(`Successfully loaded ${chalk.inverse(res.value.name)}!`)
        } else {
          console.warn(
            `Error loading ${chalk.bgRed.white(res.reason.scenario)}!\n${
              res.reason.reason ? res.reason.reason.stack : res.reason.stack
            }`
          )
        }
      })
      // TODO Add scenarios to database
      console.log(`Loaded ${scenarios.length} adventure${scenarios.length === 1 ? '' : 's'}`)
      resolve(scenarios)
    })
  })
