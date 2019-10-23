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
