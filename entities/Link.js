const actions = require('./funcs/actions')

const { conditionCheck } = require('./funcs/utils')

module.exports = class Link {
  constructor(node, data) {
    this.node = node
    this.command = data.command
    this.description = data.description || '\u200b'
    this.link = data.link.toLowerCase()
    this.actions = []
    // this.condition = data.condition
    if (data.actions && data.actions.length) {
      data.actions.forEach(a => {
        const info = Object.entries(a)
        if (info.length === 1) this.actions.push(actions[info[0][0]](info[0][1]))
        else if (info.length === 2) {
          const itemName = info[0][1]
          const item = this.node.scenario.items.find(i => i.name === itemName)
          if (item) this.actions.push(actions[info[0][0]](item, info[1][1]))
          else
            throw this.node.getError(
              '%name% has an invalid item %1% on link %2%',
              itemName,
              this.command
            )
        }
      })
    }

    if (data.condition) {
      if (!(data.condition instanceof Object) || data.condition instanceof Array)
        throw this.node.getError('%name% link %1% is not an object!', this.command)

      if (!conditionCheck(data.condition))
        throw this.node.getError('%name% has an invalid condition on link %1%', this.command)
      this.condition = data.condition
      // const c = Object.entries(this.condition)[0][0]
      // if (/(and|or|not)/.test(c)) {

      // }
    }
  }

  resolveConditions() {
    // TODO: Add conditionals
    return true
  }
}
