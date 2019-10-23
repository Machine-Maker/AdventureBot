const fs = require('fs')
const chalk = require('chalk')
const JSON5 = require('json5')

const Node = require('./Node')
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
  }

  parseScenario() {
    return new Promise((resolve, reject) => {
      fs.readFile(this.paths.scenario, { encoding: 'utf-8' }, (err, lines) => {
        if (err) {
          reject(new ParseError(null, this.dirName, err))
        } else {
          const text = lines.split(/\r?\n/)
          if (text[0].indexOf('#') === -1)
            reject(
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
            const separate = split(node, '\n', 2)
            let jsonString = separate[1].trim()
            try {
              const exec = textRegex.exec(jsonString)
              if (exec) jsonString = jsonString.replace(textRegex, '')
              const json = JSON5.parse(jsonString)
              json.text = /[^"]{5,}/gi.exec(exec[0])[0]
              const node = new Node(this, separate[0].trim().toLowerCase(), json)
              promises.push(node.parseNode())
            } catch (err) {
              if (separate[0].trim() === 'RepairHydrationDeath')
                console.debug(textRegex.exec(separate[1].trim()))
              reject(
                new ParseError(`Error parsing ${separate[0].trim()}: ${err.message}`, this.name)
              )
            }
          }
          Promise.allSettled(promises).then(results => {
            results.forEach(res => {
              if (res.status === 'fulfilled') {
                if (this.nodes[res.value.name])
                  reject(res.value.getError('There is already a node with the name %name%!'))
                else this.nodes[res.value.name] = res.value
              } else reject(res.reason)
            })
            Object.values(this.nodes).forEach(n => {
              if (n.links) {
                n.links
                  .filter(l => !l.endscenario)
                  .forEach(l => {
                    if (!this.nodes[l.link.toLowerCase()]) {
                      reject(n.getError('Cannot find link location %1% for %name%!', l.link))
                    }
                  })
              }
            })
            if (this.nodes.start) this.startNode = this.nodes.start
            else
              reject(
                new ParseError(
                  `Could not find Start node for ${chalk.bgRed.white(this.name)}`,
                  this.name
                ),
                this.name
              )
            resolve(this)
          })
        }
      })
    })
  }
}

function split(string, delimiter, n) {
  const parts = string.split(delimiter)
  return parts.slice(0, n - 1).concat([parts.slice(n - 1).join(delimiter)])
}
