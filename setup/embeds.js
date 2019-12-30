const { RichEmbed } = require('discord.js')

module.exports.COMPLETE = (scenarioName, author, footer) =>
  new RichEmbed()
    .setTitle('**Congratulations!**')
    .setColor('WHITE')
    .setDescription('You have successfully completed a scenario! Moving on...')
    .addField('Scenario', scenarioName, true)
    .addField('Author', author, true)
    .setFooter(footer)

module.exports.DEATH = footer =>
  new RichEmbed()
    .setTitle('**You Died**')
    .setColor('RED')
    .setDescription(
      'Unfortunetaly you have died. Perhaps you should make better choices in your future adventures.'
    )
    .setFooter(footer)

module.exports.NEED_REVIVE = (invite, footer) =>
  new RichEmbed()
    .setTitle('**You are unconscious and stranded**')
    .setColor('BLACK')
    .setDescription('Tough Luck! Ask a friend to revive you by sending him this invite!')
    .setImage(
      'https://cdn.discordapp.com/attachments/561336627482460219/562060455976239104/HighresScreenshot00089.png'
    )
    .addField('Invite', invite, true)
    .setFooter(footer)

module.exports.SELF_REVIVE = (lives, footer) =>
  new RichEmbed()
    .setTitle('**You have been resurrected!**')
    .setColor('GREEN')
    .setDescription('You have used a life!')
    .addField('Lives Left', lives)
    .setFooter(footer)

module.exports.REVIVE_OTHER = (reviver, footer) =>
  new RichEmbed()
    .setTitle('**You have been revived!**')
    .setColor('#ffff00')
    .setImage(
      'https://cdn.discordapp.com/attachments/561336627482460219/562063339606376497/HighresScreenshot00091.png'
    )
    .setDescription(`Nomad <@${reviver.snowflake}> came along and revived you! Huzzah!`)
    .setFooter(footer)

module.exports.INFO = new RichEmbed().setColor('#007f00')

module.exports.ADDITEM = (itemName, count) =>
  new RichEmbed()
    .setDescription('You have picked up something up!')
    .setColor('#007f00')
    .addField('Item', itemName, true)
    .addField('Count', count, true)
    .setFooter('Use !inventory to view your current inventory')

module.exports.REMOVEITEM = (itemName, count) =>
  new RichEmbed()
    .setDescription('You have dropped something!')
    .setColor('#007f00')
    .addField('Item', itemName, true)
    .addField('Count', count, true)
    .setFooter('Use !inventory to view your current inventory')

module.exports.INVENTORY_EMPTY = footer =>
  new RichEmbed()
    .setTitle('**Your inventory is empty!**')
    .setColor('RED')
    .setFooter(footer)

module.exports.INVENTORY = (items, footer) => {
  if (items.length === 0) return this.INVENTORY_EMPTY(footer)
  const embed = new RichEmbed()
    .setDescription('Here is your inventory')
    .setColor('#007f00')
    .setFooter(footer)
  items.forEach(i => embed.addField(i.name, i.count, true))
  return embed
}

module.exports.DAMAGE = (dealer, dealt, damageAmount, player) =>
  new RichEmbed()
    .setTitle('**Damage has been done**')
    .setColor('DARK_RED')
    .setFooter('Use !help for help during combat')
    .setDescription(
      `${dealer} hit ${dealt} for ${damageAmount} hp! ${dealt} scream${
        dealt === 'You' ? '' : 's'
      } in pain!`
    )
    .addField('Player HP', player.health, true)
    .addField('Enemy HP', player.enemy.hp, true)

module.exports.DEFEAT = player =>
  new RichEmbed()
    .setTitle('**You have been defeated**')
    .setColor('BLACK')
    .setFooter(player.footer())
    .setDescription(player.enemy.defeattext)

module.exports.VICTORY = (player, links) => {
  const embed = new RichEmbed()
    .setTitle('**You have defeated the enemy!**')
    .setColor('GREEN')
    .setFooter(player.footer())
    .setDescription(player.enemy.victorytext)
  links.forEach(l => {
    if (l.resolveConditions()) embed.addField(l.command, l.description, true)
  })
  return embed
}

module.exports.HELP_IN_GAME = footer =>
  new RichEmbed()
    .setTitle('**In-Game Help**')
    .setThumbnail(
      'https://cdn.discordapp.com/attachments/562283263658557451/639693508789403649/LastOasisLogoBlackOnWhite_cropped.png'
    )
    .setFooter(footer)
    .setDescription(
      'So you have found yourself in a game huh?\n\n\nWell, Each stage has a little story and sometimes a picture to go along with it. They also have several options that might look like the ones below. Your job is to read the story and make the best choice to ensure your survival!\n\nGood luck!'
    )
    .addField('Turn right', 'This would have you turn right in the story', true)
    .addField('Open chest', 'Here you might open a chest', true)
    .addField(
      '\u200b',
      'I hope you understand! You can ask in the Last Oasis discord (https://discord.gg/lastoasis) if you need more help.'
    )

module.exports.HELP_IN_COMBAT = footer =>
  new RichEmbed()
    .setTitle('**In-Combat Help**')
    .setThumbnail(
      'https://cdn.discordapp.com/attachments/562283263658557451/639693508789403649/LastOasisLogoBlackOnWhite_cropped.png'
    )
    .setFooter(footer)
    .setDescription(
      "So now you got yourself into a fight and have no clue what to do. Well here are your options.\n\nThere are two attack actions, `attack` and `block` and each of those actions can be followed by a direction, `left`, `right`, or `up`. So `attack right` would be an attack from the right and so on.\n\n\nRemember that the enemy will respond to your moves. Don't let them get an advantage!"
    )
