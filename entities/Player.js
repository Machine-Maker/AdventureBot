const bot = require('../bot')
const { db } = require('../setup/databases')
const { encrypt } = require('../InviteSystem')
const {
  COMPLETE,
  DEATH,
  NEED_REVIVE,
  SELF_REVIVE,
  REVIVE_OTHER,
  DAMAGE
} = require('../setup/embeds')

/* eslint-disable */
// prettier-ignore
const LEVEL_REQS = [500, 1000, 1500, 2000, 3500, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11500, 13000, 14500, 16000, 17500, 20000, 23000, 26000, 30000, 34000, 38000, 43000, 50000, 60000, 70000, 80000, 90000, 100000]
/* eslint-enable */

module.exports.Player = class Player {
  constructor(snowflake, profile = null) {
    if (!profile) {
      this.snowflake = snowflake
      this.scenario_name = null
      this.node_name = null
      this.health = 100
      this.xp = 0
      this.items = []
      this.flags = []
      this.enemy = null
      this.lives = 2
      this.death_count = 0
      this.used_invite = false
      this.scenarios_completed = 0
    } else Object.assign(this, profile)
  }

  damage() {
    let max = 14
    this.items.forEach(i => {
      if (i.damage && i.damage > max) max = i.damage
    })
    return max
  }

  inGame() {
    return !!this.scenario_name
  }

  isDead() {
    return this.flags.includes('dead')
  }

  footer() {
    const nextXPAmount = LEVEL_REQS.find(v => v > this.xp)
    return `
      HP: ${this.health}/100${'\u2001'.repeat(2)}
      XP: ${this.xp}/${nextXPAmount}${'\u2001'.repeat(2)}
      Level: ${LEVEL_REQS.indexOf(nextXPAmount) + 1}${'\u2001'.repeat(2)}
      Damage: ${this.damage()}${'\u2001'.repeat(2)}
      Lives: ${this.lives}
    `.replace(/(\r?\n|\r|^\s*)/gm, '')
  }

  startRandom(msg, bot) {
    const newScenario = bot.randomScenario()
    this.scenario_name = newScenario.name
    this.node_name = 'start'
    newScenario.startNode.resolveActions(this, msg)
    msg.reply(newScenario.startNode.resolveEmbed(this))
    this.save()
  }

  endCurrent(msg, bot) {
    this.scenarios_completed++
    msg.reply(COMPLETE(this.scenario_name, 'TBF', this.footer())) // TODO: Add author
    this.reset()
    this.startRandom(msg, bot)
  }

  async takeDamage(msg) {
    const damageDealt = Math.min(Math.min(this.health, this.enemy.damage), 40)
    this.health -= damageDealt
    this.enemy.action = this.enemy.direction = null
    await msg.reply(DAMAGE(this.enemy.name, 'You', damageDealt, this))
  }

  triggerDeath(msg) {
    this.death_count++
    this.lives--
    this.health = 0
    this.scenario_name = null
    this.node_name = null
    this.enemy = null
    this.flags.push('dead')
    msg.reply(DEATH(this.footer()))
    if (this.lives > 0) this.respawn(msg, bot)
    else msg.reply(NEED_REVIVE(encrypt(this.snowflake, this.death_count), this.footer()))
    this.save()
  }

  respawn(msg, bot, other = false) {
    this.reset()
    if (!other)
      msg.reply(SELF_REVIVE(this.lives, this.footer())).then(msg => {
        this.startRandom(msg, bot)
      })
  }

  revive(msg, invite, player) {
    if (this.isDead() && invite.deathCount === this.death_count) {
      this.respawn(msg, bot, true)
      this.lives++
      player.used_invite = true
      bot.fetchUser(this.snowflake).then(async user => {
        if (!user.dmChannel) await user.createDM()
        user.dmChannel
          .send(REVIVE_OTHER(player, this.footer()))
          .then(msg => this.startRandom(msg, bot))
      })
      return true
    } else
      msg.reply(
        'This Invite has expired already, sorry. Invites can only be used once. See if you can fetch another one!'
      )
    return false
  }

  start() {
    this.reset(true)
    this.scenario_name = 'Start'
    this.node_name = 'start'
    this.save()
  }

  reset(hard = false) {
    this.health = 100
    this.flags = []
    this.scenario_name = null
    this.node_name = null
    this.enemy = null
    if (hard) this.lives = 2
    if (hard) this.xp = 0
    if (hard) this.items = []
    if (hard) this.death_count = 0
    if (hard) this.scenarios_completed = 0
  }

  save() {
    db.run(
      `
      UPDATE players SET scenario_name="${this.scenario_name}",
      node_name="${this.node_name}",
      health=${this.health},
      xp=${this.xp},
      items='${JSON.stringify(this.items).replace(/'/g, "''")}',
      flags='${JSON.stringify(this.flags).replace(/'/g, "''")}',
      enemy='${this.enemy ? JSON.stringify(this.enemy, null, 2).replace(/'/g, "''") : '{}'}',
      lives=${this.lives},
      death_count=${this.death_count},
      used_invite=${this.used_invite ? 1 : 0},
      scenarios_completed=${this.scenarios_completed}
      WHERE snowflake=?`,
      [this.snowflake],
      err => {
        if (err) console.error(err.stack)
      }
    )
  }

  create() {
    return new Promise((resolve, reject) => {
      db.run(`INSERT INTO players(snowflake) VALUES (?)`, [this.snowflake], err => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}

const players = {}

module.exports.findPlayer = (snowflake, create) =>
  new Promise((resolve, reject) => {
    if (players[snowflake]) return resolve(players[snowflake])
    db.get('SELECT * FROM players WHERE snowflake=?', [snowflake], async (err, row) => {
      if (err) return reject(err)
      if (!row && !create) return resolve(null)
      if (row) {
        row.items = JSON.parse(row.items)
        row.flags = JSON.parse(row.flags)
        if (row.enemy === '{}') row.enemy = null
        else row.enemy = JSON.parse(row.enemy)
        row.used_invite = row.used_invite !== 0
        row = new this.Player(snowflake, row)
      } else {
        row = new this.Player(snowflake)
        await row.create()
        console.log(`Created player data for ${snowflake}!`)
      }
      players[snowflake] = row
      resolve(row)
    })
  })

module.exports.playerExists = snowflake => !!players[snowflake]
