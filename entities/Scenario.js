const fs = require('fs')
const chalk = require('chalk')
const JSON5 = require('json5')

const Node = require('./Node')
const Item = require('./Item')
const ParseError = require('./ParseError')

const textRegex = /\t?"text"\s*:\s*"([^"]+\r?\n)*.+"\s*,?/gi

module.exports = class Scenario {
  constructor(path) {
    // TODO: Verify file paths
    this.paths = {
      dir: path,
      scenario: `${path}/_scenario.txt`,
      items: `${path}/_items.txt`,
      credits: `${path}/_credits.txt`
    }
    this.dirName = this.paths.dir.substr(path.lastIndexOf('\\') + 1)
    this.name = null
    this.nodes = {}
    this.items = []
  }

  parseScenario(bot) {
    return new Promise((resolve, reject) => {
      const errors = []
      // Get items if exist
      if (fs.existsSync(this.paths.items)) {
        try {
          const lines = fs
            .readFileSync(this.paths.items, { encoding: 'utf-8' })
            .trim()
            .split('#')
            .filter(t => !/^\s*$/.test(t))
          for (const itemStr of lines) {
            const separate = split(itemStr, '\n', 2).map(
              Function.prototype.call,
              String.prototype.trim
            )
            this.items.push(new Item(separate[0], JSON.parse(separate[1])))
          }
        } catch (err) {
          errors.push(new ParseError(`Error parsing ITEMS!: ${err.message}`, this.name))
          this.items = []
        }
      }

      fs.readFile(this.paths.scenario, { encoding: 'utf-8' }, (err, lines) => {
        if (err) return errors.push(new ParseError(null, this.dirName, err))
        const text = lines.split(/\r?\n/)
        if (text[0].indexOf('#') === -1)
          return errors.push(
            new ParseError(
              `Error parsing ${this.dirPath}. Could not find adventure name!`,
              this.dirName
            )
          )
        this.name = text[0].slice(text[0].indexOf('#') + 1)
        const nodes = text
          .slice(1)
          .join('\n')
          .split('#')
          .filter(t => !/^\s*$/.test(t))
        const promises = []
        for (const node of nodes) {
          // This part SUCKED
          const separate = split(node, '\n', 2).map(Function.prototype.call, String.prototype.trim)
          let jsonString = separate[1].trim()
          try {
            const exec = textRegex.exec(jsonString)
            if (exec) jsonString = jsonString.replace(textRegex, '')
            const json = JSON5.parse(jsonString)
            json.text = /[^"]{5,}/gi.exec(exec[0])[0]
            const node = new Node(this, separate[0].trim().toLowerCase(), json)
            promises.push(node.parseNode())
          } catch (err) {
            errors.push(
              new ParseError(`Error parsing ${separate[0].trim()}: ${err.message}`, this.name)
            )
          }
        }

        Promise.allSettled(promises).then(results => {
          results.forEach(res => {
            if (res.status === 'fulfilled') {
              if (this.nodes[res.value.name])
                errors.push(res.value.getError('There is already a node with the name %name%!'))
              else this.nodes[res.value.name] = res.value
            } else errors.push(res.reason)
          })
          Object.values(this.nodes).forEach(n => {
            if (n.links) {
              n.links
                .filter(l => !l.endscenario)
                .forEach(l => {
                  if (!this.nodes[l.link.toLowerCase()]) {
                    errors.push(n.getError('Cannot find link location %1% for %name%!', l.link))
                  }
                })
            }
          })
          if (this.nodes.start) this.startNode = this.nodes.start
          else
            errors.push(
              new ParseError(
                `Could not find Start node for ${chalk.bgRed.white(this.name)}`,
                this.name
              ),
              this.name
            )
          if (errors.length) return reject(errors)
          bot.db.run('INSERT OR IGNORE INTO scenarios(name) VALUES (?)', [this.name], err => {
            if (err) console.error(err)
          })
          resolve(this)
        })
      })
    })
  }
}

function split(string, delimiter, n) {
  const parts = string.split(delimiter)
  return parts.slice(0, n - 1).concat([parts.slice(n - 1).join(delimiter)])
}
