const arrayify = require('./util/arrayify')

const systemPlugins = [
  require('./plugins/has'),
  require('./plugins/oneOf'),
  require('./plugins/value')
]

class GrammarGenerator {
  constructor ({ storage, random }, ...plugins) {
    this.random = random || (() => Math.random())
    this.storage = new StorageAPI(storage, this.random)
    this.plugins = [...systemPlugins, ...plugins]
  }

  static matchesIs (is, type) {
    is = arrayify(is)
    type = arrayify(type)

    for (let i = 0; i < is.length; i++) {
      let matches = false
      for (let j = 0; j < type.length; j++) {
        if (type[j].indexOf(is[i]) === 0) {
          // they match
          matches = true
          break
        }
      }
      if (!matches) return false
    }
    return true
  }

  expand (definition) {
    const result = {}

    for (const f in definition) {
      if (f === 'is') {
        result[f] = arrayify(definition[f])
      } else {
        result[f] = definition[f]
      }
    }

    for (const p of this.plugins) {
      if (p.canGenerate(definition) && p.expand) {
        Object.assign(result, p.expand(definition))
        continue
      }
    }

    return result
  }

  static template (template, fields) {
    const keys = Object.keys(fields)
    for (const k of keys) {
      template = template.replace(new RegExp('{' + k + '}', 'gi'), fields[k])
    }
    return template
  }

  async generate (type) {
    let structure = type
    if (typeof structure === 'string') {
      structure = await this.storage.loadOne(type)
    } else if (structure.is) {
      structure = await this.storage.loadOne(structure.is)
    }
    structure = this.expand(structure)

    let collection = null
    for (const p of this.plugins) {
      if (p.canGenerate(structure, this)) {
        collection = await p.generate(structure, this)
        break
      }
    }

    if (collection == null) {
      throw new Error('Expected s to have been generated')
    }

    const template = structure.template

    if (template) {
      return GrammarGenerator.template(template, collection)
    } else {
      return collection
    }
  }
}

class StorageAPI {
  constructor (wrapped, random) {
    this.wrapped = wrapped
    this.random = random
  }

  async loadOne (name) {
    const names = arrayify(name)
    const count = await this.wrapped.count(names)
    const which = Math.floor(this.random() * count)
    const results = await this.wrapped.load(names, which, 1)
    return results[0]
  }
}

GrammarGenerator.MemoryStorage = class MemoryStorage {
  constructor (defs) {
    this.defs = defs
  }

  async count (names) {
    let c = 0
    for (const def of this.defs) {
      if (GrammarGenerator.matchesIs(names, def.is)) c++
    }
    return c
  }

  async load (names, offset, count) {
    let c = 0
    const set = []
    for (const def of this.defs) {
      if (!GrammarGenerator.matchesIs(names, def.is)) continue
      if (c >= offset) {
        set.push(def)
        if (set.length >= count) {
          return set
        }
      }
      c++
    }
    return set
  }
}

module.exports = GrammarGenerator
