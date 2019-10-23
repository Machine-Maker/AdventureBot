module.exports = {
  event: 'disconnect',
  disabled: false,
  once: false,
  run: () => console.warn('Disconnected!')
}
