const { findPlayer } = require('../entities/Player')
const { parseInvite, verifyKey, INVITE_WELCOME } = require('../InviteSystem')
const { handleMsg } = require('../CombatSystem')

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

          if (player.enemy) {
            if (player.inProgress) return
            const time = await msg.react('\u23F3')
            player.inProgress = true
            await handleMsg(msg, player, node)
            player.inProgress = false
            time.remove()
            msg.react('\u2705')
            player.save()
            return
          }

          if (node.ending) return player.endCurrent(msg, bot)
          const link = node.links.find(l => l.command.toLowerCase() === msg.content.toLowerCase())
          if (!link) return
          node.resolveActions(player, msg, link)
          player.save()
          console.debug(`Completed node ${node.name}`)
          const nextNode =
            scenario.nodes[
              node.links.find(l => l.command.toLowerCase() === msg.content.toLowerCase()).link
            ]
          if (!nextNode) {
            return console.error(
              `Something went wrong! scenario: ${scenario.name} node: ${node.name}`
            )
          }
          nextNode.resolveActions(player, msg)
          player.node_name = nextNode.name
          player.save()
          msg
            .reply(nextNode.resolveEmbed(player))
            .then(msg1 => {
              // Death and End Scenario
              if (player.health <= 0 || nextNode.death) {
                return player.triggerDeath(msg)
              } else if (nextNode.ending) {
                return player.endCurrent(msg, bot)
              }

              // Enemy
              nextNode.resolveEnemy(player, msg1)
            })
            .catch(err => console.error(err))
        })
        .catch(err => console.error(err))
    })
  }
}
