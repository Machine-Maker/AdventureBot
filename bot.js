require('dotenv').config()

// Argument setup
process.HIDE_WARNINGS = false
const argv = process.argv.slice(2)
if (argv.includes('-nw') || argv.includes('--no-warnings')) process.HIDE_WARNINGS = true

const { CommandoClient } = require('discord.js-commando')
const path = require('path')

const botConfig = require('./configs/bot_config')

const databases = require('./setup/databases')
const scenarios = require('./setup/scenarios')
const logging = require('./setup/logging')
const promises = require('./setup/promises')
const events = require('./setup/events')

const bot = new CommandoClient({
  commandPrefix: '!',
  owner: '338670732403933194',
  unknownCommandResponse: false
})

module.exports = bot

bot.config = botConfig

logging.setup()
promises.setup()
databases.setup(bot).then(res => {
  bot.db = res
  scenarios.setup(bot).then(res => {
    bot.scenarios = res
    bot.startScenario = bot.scenarios.find(s => s.name === 'Start')
    if (!bot.startScenario) console.error('Could not find start scenario!')
    bot.randomScenario = () =>
      bot.scenarios.filter(s => s.name !== 'Start')[
        Math.floor(Math.random() * (bot.scenarios.length - 1))
      ]
    events.setup(bot)
  })
})

bot.registry
  .registerDefaultTypes()
  .registerDefaultGroups()
  .registerDefaultCommands({
    help: false,
    prefix: false,
    ping: false,
    unknownCommand: false,
    commandState: false
  })
  .registerGroups([['admin', 'Admin'], ['dev', 'Dev'], ['user', 'User']])
  .registerCommandsIn(path.join(__dirname, 'commands'))

bot.login(process.env.ENVIRONMENT === 'dev' ? process.env.TOKEN_TEST : process.env.TOKEN)
