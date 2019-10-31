const { Command } = require('discord.js-commando')
const { RichEmbed } = require('discord.js')

const { parseInvite } = require('../../InviteSystem')

module.exports = class KeyInfoCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'keyinfo',
      aliases: ['keyi', 'info'],
      group: 'dev',
      memberName: 'keyinfo',
      description: 'Displays key info',
      details: 'Shows the player and death count associated with this key',
      argsPromptLimit: 0,
      args: [
        {
          key: 'key',
          label: 'key',
          prompt: 'Enter an LO Key',
          type: 'string',
          validate: (val, msg, arg) => {
            const invite = parseInvite(val)
            if (invite && invite.id) return true
            return 'Invalid invite format'
          },
          parse: (val, msg, arg) => parseInvite(val)
        }
      ]
    })
  }

  hasPermission(msg) {
    const member = this.client.mainGuild.members.get(msg.author.id)
    return (
      member &&
      (member.roles.has(this.client.cyoaRoles.dev.id) ||
        member.roles.has(this.client.cyoaRoles.admin.id))
    )
  }

  run(msg, args) {
    msg.reply(
      new RichEmbed()
        .setTitle('Key Info')
        .setColor('GREEN')
        .addField('Key', args.key.key, true)
        .addField('User', `<@${args.key.id}>`, true)
        .addField('Death Count', args.key.deathCount, true)
        .setTimestamp()
    )
  }
}
