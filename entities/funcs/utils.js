const stringCheck = str => (/\S/.test(str) ? str : false)
const integerCheck = int => (!isNaN(int) ? parseInt(int) : false)
// TODO: Add item parsing
const itemCheck = item => item
const arrayString = array => {
  if (!(array instanceof Array) || !array.length) return false
  return array.every(s => typeof s === 'string')
}
const arrayConditionCheck = array => array.every(conditionCheck)
const conditionCheck = condition => {
  const c = Object.entries(condition)
  const cType = c[0][0]
  if (!Object.keys(this.availConditions).includes(cType)) return false
  return this.availConditions[cType].every(arg => arg[1](condition[arg[0]]) !== false)
}

module.exports.conditionCheck = conditionCheck

module.exports.availConditions = {
  hasitem: [['hasitem', itemCheck], ['count', integerCheck]],
  flagset: [['flagset', stringCheck]],
  flagsset: [['flagsset', arrayString]],
  flagnotset: [['flagnotset', stringCheck]],
  flagsnotset: [['flagsnotset', arrayString]],
  and: [['and', arrayConditionCheck]],
  or: [['or', arrayConditionCheck]],
  not: [['not', conditionCheck]]
}

module.exports.availActions = {
  setflag: [['setflag', stringCheck]],
  unsetflag: [['unsetflag', stringCheck]],
  additem: [['additem', itemCheck], ['count', integerCheck]],
  removeitem: [['removeitem', itemCheck], ['count', integerCheck]],
  giveexp: [['giveexp', integerCheck]],
  takedamage: [['takedamage', integerCheck]]
}
