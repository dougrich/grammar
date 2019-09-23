function arrayify(objectOrArray) {
  if (Array.isArray(objectOrArray)) {
    return objectOrArray
  } else {
    return [objectOrArray]
  }
}

class GrammarGenerator {
  constructor({ storage, random }) {
    this.random = random || (() => Math.random())
    this.storage = new StorageAPI(storage, this.random)
  }

  async generate(type) {
    const s = await this.generateDry(type)
    return await this.hydrate(s)
  }

  async generateDry(type) {
    const structure = await this.storage.loadOne(type)
    if (structure.has) {
      const result = { is: structure.is }
      for (const { field, is } of structure.has) {
        result[field] = { is }
      }
      return result
    }

    if (structure.oneOf) {
      const which = Math.floor(this.random() * structure.oneOf.length)
      return structure.oneOf[which]
    }

    if (structure.value) {
      return structure.value
    }
  }

  async hydrate(collection) {
    let template = null
    if (collection.is) {
      // we have type hinting: add any missing fields
      const structure = await this.storage.loadOne(collection.is)
      if (structure.has) {
        for (const { field, is } of structure.has) {
          collection[field] = collection[field] || { is }
        }
      }
      template = structure.template
      delete collection.is
    }

    const fields = Object.keys(collection)
    for (const f of fields) {
      if (collection[f] && collection[f].is != null) {
        // expand this
        collection[f] = await this.generate(collection[f].is)
      }
    }
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