const { findPlayer } = require('../entities/Player')
const { parseInvite, verifyKey, INVITE_WELCOME } = require('../InviteSystem')

module.exports = {
  event: 'message',
  disabled: false,
  once: false,
  run: (bot, msg) => {
    if (msg.author.bot) return
    if (msg.content.startsWith(bot.commandPrefix)) return
    if (msg.channel.type !== 'dm') return
    bot.mainGuild.fetchMember(msg.author).then(member => {
      // Invite Check
      const invite = parseInvite(msg.content)
      findPlayer(msg.author.id, true)
        .then(async player => {
          if (player.isDead()) return
          let pass = false
          if (!player.inGame()) {
            if (invite) {
              if (!player.used_invite) pass = !(await verifyKey(player, invite, msg))
              else msg.reply('You cannot use an invite when you are already in the game')
            } else if (!player.used_invite) return msg.reply(INVITE_WELCOME)
            else if (player.used_invite) pass = true
            if (!pass) return
            if (player.scenarios_completed === 0 && player.death_count === 0) {
              player.start()
              bot.startScenario.startNode.resolveActions(player, msg)
              return msg.reply(bot.startScenario.startNode.resolveEmbed(player))
            }
            return console.debug('WTF happened to get here?')
          }
          const scenario = bot.scenarios.find(s => s.name === player.scenario_name)
          const node = scenario.nodes[player.node_name]
          if (node.ending) return player.endCurrent(msg, bot)
          if (node.cmds.indexOf(msg.content.toLowerCase()) < 0) return
          node.resolveActions(player, msg, msg.content.toLowerCase())
          player.save()
          console.debug(`Completed node ${node.name}`)
          const nextNode =
            scenario.nodes[
              node.links
                .find(l => l.command.toLowerCase() === msg.content.toLowerCase())
                .link.toLowerCase()
            ]
          if (!nextNode) {
            return console.error(
              `Something went wrong! scenario: ${scenario.name} node: ${node.name}`
            )
          }
          nextNode.resolveActions(player, msg)
          player.node_name = nextNode.name
          player.save()
          msg.reply(nextNode.resolveEmbed(player))
          if (player.health <= 0 || nextNode.death) {
            player.triggerDeath(msg, bot)
          } else if (nextNode.ending) {
            player.endCurrent(msg, bot)
          }
          // TODO: Death and End
        })
        .catch(err => console.error(err))
    })
  }
}
