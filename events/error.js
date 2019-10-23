module.exports = {
  event: 'error',
  disabled: false,
  once: false,
  run: (bot, err) => console.error(err)
}
