const { Command } = require('discord.js-commando')

const { findPlayer } = require('../../entities/Player')
const { INVITE_WELCOME } = require('../../InviteSystem')
const { HELP_IN_GAME, HELP_IN_COMBAT } = require('../../setup/embeds')

module.exports = class HelpCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'help',
      aliases: ['h'],
      group: 'user',
      memberName: 'help',
      description: 'General help',
      details: 'Shows help information depending on where you are in the game',
      argsPromptLimit: 0,
      argsCount: 0,
      throttling: {
        usages: 1,
        duration: 30
      }
    })
  }

  run(msg) {
    if (!msg.content.startsWith(this.client.commandPrefix)) return
    findPlayer(msg.author.id, false).then(player => {
      if (!player) msg.reply(INVITE_WELCOME)
      else {
        if (player.inGame() && !player.enemy) {
          msg.reply(HELP_IN_GAME(player.footer()))
        } else if (player.inGame() && player.enemy) {
          msg.reply(HELP_IN_COMBAT(player.footer()))
        }
      }
    })
  }
}
