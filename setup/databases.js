const fs = require('fs')
const sqlite3 = require('sqlite3')

module.exports.setup = bot =>
  new Promise((resolve, reject) => {
    fs.mkdirSync(bot.config.scenario_directory, { recursive: true })

    const db = new sqlite3.Database(bot.config.database_location, err => {
      if (err) console.error(err)
      else console.log('Connected to the players database.')
    })

    module.exports.db = db

    Promise.all([
      new Promise((resolve, reject) => {
        db.run(
          `CREATE TABLE IF NOT EXISTS scenarios (
          name TEXT PRIMARY KEY,
          attempts INTEGER NOT NULL DEFAULT 0,
          wins INTEGER NOT NULL DEFAULT 0,
          enabled BOOLEAN NOT NULL DEFAULT true
        )`,
          err => {
            if (err) reject(err)
            resolve()
          }
        )
      }),
      new Promise((resolve, reject) => {
        db.run(
          `CREATE TABLE IF NOT EXISTS players (
          snowflake TEXT NOT NULL,
          scenario_name TEXT,
          node_name TEXT,
          health INTEGER NOT NULL DEFAULT 100,
          xp INTEGER NOT NULL DEFAULT 0,
          items TEXT NOT NULL DEFAULT "[]",
          flags TEXT NOT NULL DEFAULT "[]",
          enemy TEXT NOT NULL DEFAULT "{}",
          lives INTEGER NOT NULL DEFAULT 2,
          death_count INTEGER NOT NULL DEFAULT 0,
          used_invite BOOLEAN NOT NULL DEFAULT 0,
          scenarios_completed INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY(snowflake),
          FOREIGN KEY(scenario_name) REFERENCES scenarios(name)
        )`,
          err => {
            if (err) reject(err)
            resolve()
          }
        )
      })
    ])
      .then(results => resolve(db))
      .catch(err => reject(err))
  })
