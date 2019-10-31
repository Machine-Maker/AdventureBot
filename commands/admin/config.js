const { Command } = require('discord.js-commando')

module.exports = class ConfigCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'config',
      aliases: ['conf', 'settings'],
      group: 'admin',
      memberName: 'config',
      description: 'Managing the configuration',
      details: 'Enables viewing and changing configuration options.',
      argsPromptLimit: 0,
      argsType: 'multiple'
    })
  }

  hasPermission(msg) {
    this.client.mainGuild
      .fetchMember(msg.author)
      .then(member => {
        if (member && member.roles.has(this.client.cyoaRoles.admin.id)) return true
        return false
      })
      .catch(err => {
        console.error(err)
        return false
      })
  }

  run(msg, args) {
    if (args.length === 1 || args.length === 0) {
      let m = this.client.config
      if (args.length !== 0) {
        const v = this.getValue(args[0])
        if (!v) return msg.reply('- Invalid configuration option', { code: 'diff' })
        else m = v
      }
      msg.reply(JSON.stringify(m, null, 2), { code: 'json' })
    } else if (args.length === 2) {
      if (!this.setValue(args[0], args[1]))
        msg.reply('- Invalid configuration option', { code: 'diff' })
      else msg.reply(`Changed \`${args[0]}\` to \`${args[1]}\`!`)
    }
  }

  getValue(string) {
    try {
      return string.split('.').reduce((o, i) => o[i], this.client.config)
    } catch (err) {
      return false
    }
  }

  setValue(string, value) {
    try {
      string
        .split('.')
        .slice(0, string.split('.').length - 1)
        .reduce((o, i) => o[i], this.client.config)[
        string.split('.')[string.split('.').length - 1]
      ] = value
      // TODO: Update config file
      return true
    } catch (err) {
      return false
    }
  }
}
