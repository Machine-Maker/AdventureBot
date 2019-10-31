module.exports = {
  event: 'ready',
  disabled: false,
  once: true,
  run: bot => {
    const msg = `Logged in as: ${bot.user.username}`
    console.log(`${msg}\nID: ${bot.user.id}`)
    console.log('-'.repeat(msg.length))
    bot.user.setPresence({ game: { name: 'CYOA! - Dev', type: 'PLAYING' }, status: 'dnd' })
    bot.mainGuild = bot.guilds.find(g => g.id === bot.config.mainGuild)
    if (!bot.mainGuild) return bot.destroy()
    bot.cyoaRoles = {
      admin: bot.mainGuild.roles.find(r => r.id === bot.config.roles.cyoa_adminRole),
      dev: bot.mainGuild.roles.find(r => r.id === bot.config.roles.cyoa_devRole)
    }
    if (!bot.cyoaRoles.admin || !bot.cyoaRoles.dev) return bot.destroy()
  }
}
