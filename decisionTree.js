const JSONPointer = require('json-pointer')
const path = require('path')
const weightedChoice = require('./weightedChoice')
const { evaluate } = require('./number')

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
  constructor (opts = {}) {
    this.random = opts.random || (() => Math.random())
    this.debug = opts.debug || (msg => console.debug(msg))
  }

  applyTemplate (template, value, pointer, context) {
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

  evaluateDistribution (distribution, pointer, context) {
    if (distribution.weights) {
      const weights = distribution.weights.map(x => {
        if (typeof x === 'number') {
          return x
        } else if (x.absolute != null) {
          return x.absolute
        }
        throw new Error('Unrecognized weight')
      })
      return weightedChoice(weights, this.random())
    } else if (distribution.matrix) {
      const { inputs, values } = distribution.matrix
      const weights = inputs
        .map((input) => {
          if (typeof input !== 'object') return input
          const { lookup, eq } = input
          const lookupPointer = path.resolve(pointer, lookup)
          const lookupValue = JSONPointer.get(context, lookupPointer)
          if (eq) {
            if (lookupValue === eq) {
              return 1
            } else {
              return 0
            }
          } else {
            return lookupValue
          }
        })
        .map((_, index, array) => {
          let sum = 0
          for (let i = 0; i < array.length; i++) {
            sum += values[index][i] * array[i]
          }
          return sum
        })
      return weightedChoice(weights, this.random())
    }
  }

  evaluateTree (tree, makeDecision, decisionVector = []) {
    const context = {
      decisionVector
    }
    const decisionQueue = [{ decision: tree, pointer: '/result' }]
    const postOps = []
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
        if (unfufilled.length) { continue }
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
      } else if (decision.number) {
        const { inputs, eq } = decision.number
        const inputSet = {}
        for (const arg in inputs) {
          if (inputs[arg].lookup) {
            const abspath = path.resolve(pointer, inputs[arg].lookup)
            inputSet[arg] = JSONPointer.get(context, abspath)
          }
        }
        const decider = (decision) => {
          const choice = makeDecision(decision, pointer, context)
          decisionVector.push(choice)
          return choice
        }

        value = evaluate(eq, decider, inputSet)
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
    const decide = () => decisionVector[index++]
    return this.evaluateTree(tree, decide).result
  }

  reroll (tree, decisionVector, rerollPointer) {
    let index = 0
    const pathtree = {}
    const initialScan = (decision, pointer) => {
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
