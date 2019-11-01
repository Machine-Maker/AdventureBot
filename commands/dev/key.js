const { Command } = require('discord.js-commando')

const { encrypt } = require('../../InviteSystem')

module.exports = class KeyCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'key',
      aliases: ['k'],
      group: 'dev',
      memberName: 'key',
      description: 'Produce a key with a deathcount',
      details: 'Generates a key for a player with a deathcount that defaults to 0',
      argsPromptLimit: 0,
      args: [
        {
          key: 'target',
          label: 'user id',
          prompt: 'Enter a user',
          type: 'user',
          default: msg => msg.author
        },
        {
          key: 'deathCount',
          label: 'death count',
          prompt: 'Enter a death count',
          type: 'integer',
          default: msg => 0
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
    if (!msg.content.startsWith(this.client.commandPrefix)) return
    const key = `<${encrypt(args.target.id, args.deathCount)}>`
    msg.reply(
      `Here is the Key for <@${args.target.id}> with \`${args.deathCount}\` death(s): ${key}`
    )
  }
}
