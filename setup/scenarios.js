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
      const errors = []
      results.forEach(res => {
        if (res.status === 'fulfilled') {
          scenarios.push(res.value)
          console.log(`Successfully loaded ${chalk.inverse(res.value.name)}!`)
        } else
          errors.push({
            scenario: chalk.bgRed.white(res.reason[0].scenario),
            errors: res.reason
          })
      })
      errors.forEach(err => {
        console.warn(`Error loading ${err.scenario}!`)
        err.errors.forEach(e =>
          console.warn(`${e.reason.reason ? e.reason.reason.stack : e.reason.stack}`)
        )
      })
      // TODO Add scenarios to database
      console.log(`Loaded ${scenarios.length} adventure${scenarios.length === 1 ? '' : 's'}`)
      resolve(scenarios)
    })
  })
