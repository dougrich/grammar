const JSONPointer = require('json-pointer')

const systemPlugins = [
  require('./plugins/has'),
  require('./plugins/oneOf'),
  require('./plugins/value'),
  require('./plugins/switch'),
  require('./plugins/matrix'),
  require('./plugins/number'),
  require('./plugins/someOf')
]

class Parser {
  constructor ({ storage, random }, ...plugins) {
    this.random = random || (() => Math.random())
    this.storage = storage
    this.plugins = [...systemPlugins, ...plugins]
  }

  parseLeaf (leaf) {
    for (const p of this.plugins) {
      if (p.canParse && p.canParse(leaf)) {
        return p.parsePartial(leaf)
      }
    }
    throw new Error('Unrecognized definition')
  }

  async parsePartial (typename) {
    const count = await this.storage.countDefs(typename)
    if (count > 1) {
      const weights = new Array(count)
      const options = new Array(count).fill(null)
      const $ref = {}
      for (let i = 0; i < count; i++) {
        const [id] = await this.storage.loadDefIds(typename, i, 1)
        $ref['/options/' + i] = id
        weights[i] = 1
      }
      return {
        distribution: {
          weights
        },
        options,
        $ref
      }
    } else if (count === 1) {
      const [id] = await this.storage.loadDefIds(typename, 0, 1)
      const def = await this.storage.loadDef(id)
      return this.parseLeaf(def)
    } else if (count === 0) {
      throw new Error('Missing "is" reference: ' + typename)
    }
  }

  async parse (typename) {
    const root = await this.parsePartial(typename)
    const cache = { [typename]: root }
    const stepQueue = [root]
    while (stepQueue.length) {
      const next = stepQueue.shift()
      if (next.$ref) {
        for (const key in next.$ref) {
          let reference = next.$ref[key]
          if (typeof reference === 'string') {
            const def = await this.storage.loadDef(reference)
            reference = this.parseLeaf(def)
          } else if (reference.is && cache[reference.is]) {
            reference = cache[reference.is]
          } else if (reference.is) {
            reference = await this.parsePartial(reference.is)
            cache[reference.is] = reference
          } else {
            reference = this.parseLeaf(reference)
          }
          stepQueue.push(reference)
          JSONPointer.set(next, key, reference)
        }
        delete next.$ref
      }
    }

    try {
      JSON.stringify(root)
    } catch (err) {
      throw new Error('Types include self-references, which aren\'t valid')
    }

    return root
  }
}

module.exports = Parser
