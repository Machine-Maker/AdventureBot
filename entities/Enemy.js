const { RichEmbed } = require('discord.js')

const required = ['name', 'hp', 'damage', 'description', 'victorytext', 'defeattext']

const defEmbed = new RichEmbed()
  .setTitle('**IN COMBAT**')
  .setColor('DARK_ORANGE')
  .setFooter('Use !help for help during combat')

module.exports = class Enemy {
  constructor(node, data) {
    this.node = node
    for (const key in data) {
      this[key.toLowerCase()] = data[key]
    }
    this.embed = new RichEmbed(Object.assign({}, defEmbed)).setDescription(
      `You are in combat with ${this.description}.`
    )
  }

  validate() {
    required.forEach(r => {
      if (!this[r])
        throw this.node.getError(
          'Could not find %1% for %2%enemy in node %name%!',
          r,
          this.name + ' ' || ''
        )
    })
  }

  getEmbed(player) {
    this.embed.fields = []
    this.embed.addField('Your HP', player.health, true).addField('Enemy HP', this.hp, true)
    return this.embed
  }

  static getEmbed(enemy, player) {
    return new RichEmbed(Object.assign({}, defEmbed))
      .setDescription(`You are in combat with ${enemy.description}.`)
      .addField('Your HP', player.health, true)
      .addField('Enemy HP', this.hp, true)
  }
}
