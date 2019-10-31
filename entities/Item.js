module.exports = class Item {
  constructor(name, data) {
    this.name = name
    for (const key in data) {
      this[key.toLowerCase()] = data[key]
    }
  }
}
