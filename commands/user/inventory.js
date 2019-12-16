const { Command } = require('discord.js-commando')

const { findPlayer } = require('../../entities/Player')
const { INVENTORY } = require('../../setup/embeds')

module.exports = class InventoryCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'inventory',
      aliases: ['inv', 'i'],
      group: 'user',
      memberName: 'inventory',
      description: 'Displays inventory',
      details: 'Shows the users game inventory',
      argsPromptLimit: 0,
      throttling: {
        usages: 1,
        duration: 30
      }
    })
  }

  run(msg) {
    if (msg.channel.type !== 'dm') return
    if (!msg.content.startsWith(this.client.commandPrefix)) return
    findPlayer(msg.author.id, false).then(player => {
      if (!player || !player.inGame())
        return msg.reply('You can only use that command if you are in a game!')
      msg.reply(INVENTORY(player.items, player.footer()))
    })
  }
}
