const JSONPointer = require('json-pointer')
const path = require('path')

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

  weightedChoice(weights) {
    let sum = 0
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i]
    }
    let which = this.random() * sum
    let i = 0
    while (i < weights.length) {
      if (which < weights[i]) {
        break
      } else {
        which -= weights[i]
      }
      i++
    }
    return Math.min(weights.length - 1, i)
  }

  evaluateDistribution(distribution, pointer, context) {
    if (!distribution) {
      this.debug('MISSING DISTRIBUTION')
      return 0
    }
    if (distribution.weights) {
      const weights = distribution.weights.map(x => x.absolute)
      return this.weightedChoice(weights)
    } else if (distribution.matrix) {
      const { inputs, values } = distribution.matrix
      const weights = inputs
        .map((input) => {
          if (typeof input !== 'object') return input
          const { lookup, eq } = input
          const lookupPointer = path.resolve(pointer, lookup)
          const lookupValue = JSONPointer.get(context, lookupPointer)
          if (lookupValue === eq) {
            return 1
          } else {
            return 0
          }
        })
        .map((_, index, array) => {
          let sum = 0
          for (let i = 0; i < array.length; i++) {
            sum += values[index][i] * array[i]
          }
          return sum
        })
      return this.weightedChoice(weights)
    }
  }

  evaluateTree(tree, makeDecision, decisionVector = []) {
    let context = {
      decisionVector
    }
    let decisionQueue = [{ decision: tree, pointer: '/result' }]
    let postOps = []
    // list of visited paths
    const visited = {}
    // list of dependencies that need to be resolved
    const dependencies = {}

    while (decisionQueue.length) {
      const decisionContainer = decisionQueue.shift()
      const { decision, pointer } = decisionContainer
      let value = null
      if (decision.dependsOn) {
        const unfufilled = []
        for (const relative of decision.dependsOn) {
          const abspath = path.resolve(pointer, relative)
          if (dependencies[abspath] && dependencies[abspath].includes(decisionContainer)) {
            const index = dependencies[abspath].indexOf(decisionContainer)
            dependencies[abspath].splice(index, 1)
          }
          if (!visited[abspath]) {
            unfufilled.push(abspath)
            dependencies[abspath] = dependencies[abspath] || []
            dependencies[abspath].push(decisionContainer)
          }
        }
        // we still have unfufilled dependencies
        if (unfufilled.length)
          continue
      }
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
        const choice = makeDecision(decision, pointer, context)
        decisionVector.push(choice)
        const next = decision.options[choice]
        decisionQueue.push({ decision: next, pointer })
      } else if (decision.value) {
        value = decision.value
      }
      
      JSONPointer.set(context, pointer, value)
      visited[pointer] = true
      
      if (dependencies[pointer]) {
        for (const decisionContainer of dependencies[pointer]) {
          decisionQueue.push(decisionContainer)
        }
        delete dependencies[pointer]
      }

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
    const collapseDecider = (decision, pointer, context) => {
      return this.evaluateDistribution(decision.distribution, pointer, context)
    }
    return this.evaluateTree(tree, collapseDecider)
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
    const rerollDecider = (decision, pointer, context) => {
      if (pointer.indexOf('/result' + rerollPointer) === 0) {
        return this.evaluateDistribution(decision.distribution, pointer, context)
      } else {
        return pathtree[pointer]
      }
    }
    return this.evaluateTree(tree, rerollDecider)
  }
}

module.exports = DecisionTree