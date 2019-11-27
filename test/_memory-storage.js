const uuid = require('uuid/v4')
const matchesIs = require('../util/matchesIs')

class Storage {
  constructor(grammar) {
    this.defs = grammar
    for (const def of grammar) {
      def.id = uuid()
    }
  }

  async countDefs (names) {
    let c = 0
    for (const def of this.defs) {
      if (matchesIs(names, def.is)) c++
    }
    return c
  }

  async loadDefIds (names, offset = 0, count = Infinity) {
    let c = 0
    const set = []
    for (const def of this.defs) {
      if (!matchesIs(names, def.is)) continue
      if (c >= offset) {
        set.push(def.id)
        if (set.length >= count) {
          return set
        }
      }
      c++
    }
    return set
  }

  async loadDef (id) {
    for (const d of this.defs) {
      if (d.id === id) {
        return d
      }
    }
  }
}

module.exports = Storage