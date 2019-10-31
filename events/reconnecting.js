module.exports = {
  event: 'reconnecting',
  disabled: false,
  once: false,
  run: bot => bot.user.setPresence({ game: { name: 'CYOA - Dev', type: 'PLAYING' }, status: 'dnd' })
}
