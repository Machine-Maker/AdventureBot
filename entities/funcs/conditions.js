module.exports = {
  hasitem: (item, count) => player => {
    const curItem = player.items.find(i => i.name === item.name)
    return curItem && curItem.count >= count
  },
  flagset: flag => player => player.flags.includes(flag),
  flagsset: flags => player => flags.every(player.flags.includes),
  flagnotset: flag => player => !player.flags.includes(flag),
  flagsnotset: flags => player => !flags.some(player.flags.includes)
}

/*
    Possible condition props
    HasItem: Item, Count: Int
    FlagSet: String
    FlagsSet: Array[String]
    FlagNotSet: String
    FlagsNotSet: Array[String]

    And: Array[Flag]
    Or: Array[Flag]
    Not: Flag

  */
