const chalk = require('chalk')
const _ = require('lodash')
const { RichEmbed } = require('discord.js')

const ParseError = require('./ParseError')
const { INFO, ADDITEM, REMOVEITEM } = require('../setup/embeds')

const requiredAttrs = ['text']

const stringCheck = str => (/\S/.test(str) ? str : false)
const integerCheck = int => (!isNaN(int) ? parseInt(int) : false)
// TODO: Add item parsing
const itemCheck = item => item
const availActions = {
  setflag: [['setflag', stringCheck]],
  unsetflag: [['unsetflag', stringCheck]],
  additem: [['additem', itemCheck], ['count', integerCheck]],
  removeitem: [['removeitem', itemCheck], ['count', integerCheck]],
  giveexp: [['giveexp', integerCheck]],
  takedamage: [['takedamage', integerCheck]]
}

const actions = {
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

module.exports = class Node {
  constructor(scenario, name, config) {
    this.scenario = scenario
    this.name = name
    this.nodeActions = []
    this.cmds = []
    this.linkActions = []
    this.ending = false
    this.death = false
    Object.assign(this, toLowerCase(config))
    this.embed = new RichEmbed()
      .setTitle('**Your Situation**' + (this.title ? `: ${this.title}` : ''))
      .setDescription(this.text)
      .setColor('#a92d09')
    if (this.imageurl) {
      if (this.imageurl.startsWith('http')) this.embed.setImage(this.imageurl)
      else
        console.warn(
          `${this.scenario.name}::${this.name} has an invalid image url: ${this.imageurl}`
        )
    }
  }

  parseNode(scenario) {
    return new Promise((resolve, reject) => {
      try {
        requiredAttrs.forEach(attr => {
          if (!this[attr]) throw this.getError('Could not find %1% for node %name%!', attr)
        })
        if (this.actions) {
          if (!Array.isArray(this.actions))
            throw this.getError('Actions attr must be an Array for node %name%!')
          this.actions.forEach(a => {
            const action = Object.entries(a)
            const actionType = action[0][0]
            if (!Object.keys(availActions).includes(actionType))
              throw this.getError('%name% has an invalid action %1%!', actionType)
            availActions[actionType].forEach((arg, i) => {
              const parsed = arg[1](a[arg[0]])
              if (parsed === false)
                throw this.getError('%name% has an invalid action (%1%)', arg[0])
              a[arg[0]] = parsed
            })
          })
          this.actions.forEach(a => {
            if (a.setflag && a.setflag.toLowerCase() === 'dead') this.death = true
            else {
              const info = Object.entries(a)
              if (info.length === 1) this.nodeActions.push(actions[info[0][0]](info[0][1]))
              else if (info.length === 2) {
                const itemName = info[0][1]
                const item = scenario.items.find(i => i.name === itemName)
                if (item) {
                  this.nodeActions.push(actions[info[0][0]](item, info[1][1]))
                } else throw this.getError('%name% has an invalid item %1%!', itemName)
              }
            }
          })
        }
        if (this.links) {
          if (!Array.isArray(this.links))
            throw this.getError('Links attr must be an Array for node %name%!')
          // TODO: Verify no duplicate links
          this.links.forEach(l => {
            if ((!l.command || !l.link) && !l.endscenario)
              throw this.getError('Link for %name% does not have Link or Command attrs!')
            if (l.endscenario) this.ending = true
            else {
              this.cmds.push(l.command.toLowerCase())
              this.embed.addField(l.command, l.description || '\u200b', true)
              if (l.actions && l.actions.length) {
                this.linkActions[l.command] = []
                l.actions.forEach(lAction => {
                  const info = Object.entries(lAction)
                  if (info.length === 1)
                    this.linkActions[l.command].push(actions[info[0][0]](info[0][1]))
                  else if (info.length === 2) {
                    const itemName = info[0][1]
                    const item = scenario.items.find(i => i.name === itemName)
                    if (item)
                      this.linkActions[l.command].push(actions[info[0][0]](item, info[1][1]))
                    else
                      throw this.getError(
                        '%name% has an invalid item %1% on link %2%',
                        itemName,
                        l.command
                      )
                  }
                })
              }
            }
          })
        } else if (!this.actions || !this.actions.find(a => a.setflag.toLowerCase() === 'dead'))
          throw this.getError('Could not find Links for node %name%!')
      } catch (err) {
        reject(err)
      }
      resolve(this)
    })
  }

  resolveActions(playerData, msg, command) {
    if (!command) {
      this.nodeActions.forEach(a => {
        a(playerData, msg)
      })
    } else {
      if (!this.linkActions[command] || !this.linkActions[command].length) return playerData
      this.linkActions[command].forEach(a => {
        a(playerData, msg)
      })
    }
    return playerData
  }

  resolveEmbed(player) {
    return new RichEmbed(Object.assign({}, this.embed)).setFooter(player.footer())
  }

  getError(msg, ...args) {
    args.forEach((a, i) => {
      msg = msg.replace(`%${i + 1}%`, a)
    })
    return new ParseError(msg.replace('%name%', chalk.bgRed.white(this.name)), this.scenario.name)
  }
}

function toLowerCase(obj) {
  if (obj instanceof Array) {
    const newObj = []
    obj.forEach(e => {
      if (e instanceof Object) newObj.push(toLowerCase(e))
      else newObj.push(e)
    })
    return newObj
  } else {
    const newObj = {}
    for (const key in obj) {
      if (obj[key] instanceof Object) newObj[key.toLowerCase()] = toLowerCase(obj[key])
      else newObj[key.toLowerCase()] = obj[key]
    }
    return newObj
  }
}
