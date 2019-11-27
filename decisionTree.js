const JSONPointer = require('json-pointer')

/**
 * Supported Types:
 * - oneOf (expands into options + distribution)
 * - has (expands into children)
 * - multiple types (expands into options + distribution)
 * - value (expands into value)
 * 
 * Unsupported Types:
 * - someOf (needs count and option count)
 * - optional children (no representation or count)
 * - switch (needs contextual weighting)
 * - matrix (needs contextual weighting)
 * 
 * Supported Operations:
 * - collapse tree and generate a new decision vector
 * - hydrate tree with a given decision vector
 * - reroll a branch of a tree with a given decision vector deciding the rest
 * 
 * Unsupported Operations
 * - partial execution (maximum depth)
 */

class DecisionTree {
  constructor(opts = {}) {
    this.random = opts.random || (() => Math.random())
    this.debug = opts.debug || (msg => console.debug(msg))
  }

  applyTemplate(template, value, pointer, context) {
    return () => {
      let final = ''
      for (const templatePart of template) {
        if (typeof templatePart === 'string') {
          final += templatePart
        } else if (templatePart.lookup) {
          const result = JSONPointer.get(value, templatePart.lookup)
          final += result
        }
      }
      JSONPointer.set(context, pointer, final)
    }
  }

  evaluateDistribution(distribution) {
    if (!distribution) {
      this.debug('MISSING DISTRIBUTION')
      return 0
    }
    const weights = distribution.weights
    let evaluated = new Array(weights.length)
    let sum = 0
    for (let i = 0; i < weights.length; i++) {
      evaluated[i] = weights[i].absolute
      sum += evaluated[i]
    }
    let which = Math.floor(this.random() * sum)
    return which
  }

  evaluateTree(tree, makeDecision, decisionVector = []) {
    let context = {
      decisionVector
    }
    let decisionQueue = [{ decision: tree, pointer: '/result' }]
    let postOps = []

    while (decisionQueue.length) {
      const { decision, pointer } = decisionQueue.shift()
      let value = null
      if (decision.children) {
        value = {}
        const keys = Object.keys(decision.children)
        keys.sort()
        for (const c of keys) {
          decisionQueue.push({
            decision: decision.children[c],
            pointer: pointer + '/' + c
          })
        }
      } else if (decision.options) {
        const choice = makeDecision(decision, pointer)
        decisionVector.push(choice)
        const next = decision.options[choice]
        decisionQueue.push({ decision: next, pointer })
      } else if (decision.value) {
        value = decision.value
      }
      JSONPointer.set(context, pointer, value)
      if (decision.$template) {
        // note that this is deferred as we haven't made child decisions yet
        postOps.push(this.applyTemplate(decision.$template, value, pointer, context))
      }
    }
    
    // this is important so that operations deeper in the tree are executed before operations earlier in the tree
    postOps.reverse()

    for (const op of postOps) {
      op()
    }

    return context
  }

  collapse (tree) {
    return this.evaluateTree(tree, d => this.evaluateDistribution(d.distribution))
  }

  hydrate (tree, decisionVector) {
    let index = 0
    let decide = () => decisionVector[index++]
    return this.evaluateTree(tree, decide).result
  }

  reroll (tree, decisionVector, rerollPointer) {
    let index = 0
    let pathtree = {}
    let initialScan = (decision, pointer) => {
      pathtree[pointer] = decisionVector[index++]
      return pathtree[pointer]
    }
    // note that we don't care about the result - we're scanning the decisionVector onto the paths so we don't reroll adjacent rolls
    this.evaluateTree(tree, initialScan)
    index = 0
    let rerollDecider = (decision, pointer) => {
      if (pointer.indexOf('/result' + rerollPointer) === 0) {
        return this.evaluateDistribution(decision.distribution)
      } else {
        return pathtree[pointer]
      }
    }
    return this.evaluateTree(tree, rerollDecider)
  }
}

module.exports = DecisionTree