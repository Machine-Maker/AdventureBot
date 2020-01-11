const _ = require('lodash')
const { INFO, ADDITEM, REMOVEITEM } = require('../../setup/embeds')

module.exports = {
  giveexp: amount => (player, msg) => {
    player.xp += amount
    msg.reply(INFO.setDescription(`You have gained ${amount} xp`))
  },
  takedamage: amount => (player, msg) => {
    player.health = Math.max(0, player.health - amount)
    msg.reply(INFO.setDescription(`You took ${amount} damage!`))
  },
  setflag: flag => (player, msg) => player.flags.push(flag),
  unsetflag: flag => (player, msg) => _.remove(player.flags, f => f === flag),
  additem: (item, count) => (player, msg) => {
    const curItem = player.items.find(i => i.name === item.name)
    if (curItem) curItem.count += count
    else player.items.push({ ...item, count })
    msg.reply(ADDITEM(item.name, count))
  },
  removeitem: (item, count) => (player, msg) => {
    const curItem = player.items.find(i => i.name === item.name)
    if (curItem) {
      curItem.count -= count
      if (curItem.count <= 0) player.items = player.items.filter(i => i.name !== item.name)
      msg.reply(REMOVEITEM(item.name, count))
    }
  }
}
