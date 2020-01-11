module.exports = class ParseError extends Error {
  constructor(message, scenario, error = null) {
    super(message || error.message)
    this.name = 'ParseError'
    this.scenario = scenario
    this.reason = error || this
  }
}
