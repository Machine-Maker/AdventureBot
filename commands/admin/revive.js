const { Command } = require('discord.js-commando')

const { parseInvite } = require('../../InviteSystem')
const { findPlayer } = require('../../entities/Player')

module.exports = class ReviveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'revive',
      aliases: ['rev'],
      group: 'admin',
      memberName: 'revive',
      description: 'Revies a player',
      details: 'Using a given key, revies that player',
      argsPromptLimit: 0,
      args: [
        {
          key: 'key',
          label: 'key',
          prompt: 'Enter an LO key',
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
    // TODO: Remove dev role from perms after launch
    const member = this.client.mainGuild.members.get(msg.author.id)
    return (
      member &&
      (member.roles.has(this.client.cyoaRoles.dev.id) ||
        member.roles.has(this.client.cyoaRoles.admin.id))
    )
  }

  run(msg, args) {
    if (!msg.content.startsWith(this.client.commandPrefix)) return
    findPlayer(args.key.id, false).then(player => {
      if (!player || !player.isDead() || player.death_count !== args.key.deathCount) return
      console.debug('pass')
    })
  }
}
