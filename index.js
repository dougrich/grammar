const arrayify = require('./util/arrayify')

const systemPlugins = [
  require('./plugins/has'),
  {
    canGenerate: s => !!s.oneOf,
    generate: ({ oneOf }, g) => {
      const which = Math.floor(g.random() * oneOf.length)
      return oneOf[which]
    }
  },
  {
    canGenerate: s => !!s.value,
    generate: ({ value }) => value
  }
]

class GrammarGenerator {
  constructor({ storage, random }, ...plugins) {
    this.random = random || (() => Math.random())
    this.storage = new StorageAPI(storage, this.random)
    this.plugins = [...systemPlugins, ...plugins]
  }

  async generate(type) {
    let structure = type
    if (typeof structure === 'string') {
      structure = await this.storage.loadOne(type)
    }

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

    let template = structure.template

    if (template) {
      return GrammarGenerator.template(template, collection)
    } else {
      return collection
    }
  }
}

class StorageAPI {
  constructor(wrapped, random) {
    this.wrapped = wrapped
    this.random = random
  }

  async loadOne(name) {
    const names = arrayify(name)
    const count = await this.wrapped.count(names)
    const which = Math.floor(this.random() * count)
    const results = await this.wrapped.load(names, which, 1)
    return results[0]
  }
}

function matchesIs(is, type) {
  is = arrayify(is)
  type = arrayify(type)

  isLoop:
  for (let i = 0; i < is.length; i++) {
    for (let j = 0; j < type.length; j++) {
      if (type[j].indexOf(is[i]) === 0) {
        // they match
        continue isLoop
      }
    }
    return false
  }
  return true
}

GrammarGenerator.template = function(template, fields) {
  const keys = Object.keys(fields)
  for (const k of keys) {
    template = template.replace(new RegExp("\{" + k + "\}", 'gi'), fields[k])
  }
  return template
}

GrammarGenerator.matchesIs = matchesIs

GrammarGenerator.MemoryStorage = class MemoryStorage {
  constructor(defs) {
    this.defs = defs
  }

  async count(names) {
    let c = 0
    defLoop:
    for (const def of this.defs) {
      if (!matchesIs(names, def.is)) continue defLoop
      c++
    }
    return c
  }

  async load(names, offset, count) {
    let c = 0
    let set = []
    defLoop:
    for (const def of this.defs) {
      if (!matchesIs(names, def.is)) continue defLoop
      if (c >= offset) {
        set.push(def)
        if (set.length >= count) {
          break defLoop
        }
      }
      c++
    }
    return set
  }
}

module.exports = GrammarGenerator