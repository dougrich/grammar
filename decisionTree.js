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

  applyTemplate (template, value) {
    let final = ''
    for (const templatePart of template) {
      if (typeof templatePart === 'string') {
        final += templatePart
      } else if (templatePart.lookup) {
        let result = templatePart.lookup === '/'
          ? value
          : JSONPointer.get(value, templatePart.lookup)
        if (templatePart.each) {
          let partial = ''
          for (const v of result) {
            partial += this.applyTemplate(templatePart.each, v)
          }
          result = partial
        }
        final += result
      }
    }
    return final
  }

  resolve (pointer, ...parts) {
    let result = path.resolve(pointer, ...parts)
    if (!result.startsWith('/result')) {
      result = '/result' + result
    }
    return result
  }

  evaluateDistribution (entropy, decision, pointer, context) {
    const { distribution } = decision
    if (distribution.weights) {
      const weights = distribution.weights.map(x => {
        if (typeof x === 'number') {
          return x
        } else if (x.absolute != null) {
          return x.absolute
        }
        throw new Error('Unrecognized weight')
      })
      return weightedChoice(weights, entropy(pointer) / 256)
    } else if (distribution.matrix) {
      const { inputs, values } = distribution.matrix
      const weights = inputs
        .map((input) => {
          if (typeof input !== 'object') return input
          const { lookup, eq } = input
          const lookupPointer = this.resolve(pointer, lookup)
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
      return weightedChoice(weights, entropy(pointer) / 256)
    } else {
      console.log('WHY AM I HERE')
      console.log(distribution)
    }
  }

  evaluateNumber (inputs, eq, context, pointer, adjustment, entropy) {
    const inputSet = {}
    for (const arg in inputs) {
      if (inputs[arg].lookup) {
        const abspath = this.resolve(pointer, adjustment, inputs[arg].lookup)
        inputSet[arg] = JSONPointer.get(context, abspath)
      }
    }
    let count = 0
    const decider = (decision) => {
      return this.evaluateDistribution(entropy, decision, pointer + '/' + (count++), context)
    }

    return evaluate(eq, decider, inputSet)
  }

  evaluateNode (decisionContainer, context, decisionQueue, entropy) {
    const { decision, pointer } = decisionContainer

    if (decision.repeat) {
      const { count, instance } = decision.repeat
      const finalCount = this.evaluateNumber(count.inputs, count.eq, context, pointer + '/count', '..', entropy)
      const value = new Array(finalCount)
      for (let i = 0; i < finalCount; i++) {
        decisionQueue.push({
          decision: instance,
          pointer: pointer + '/' + i
        })
      }
      return value
    } else if (decision.children) {
      const value = {}
      const keys = Object.keys(decision.children)
      keys.sort()
      for (const c of keys) {
        decisionQueue.push({
          decision: decision.children[c],
          pointer: pointer + '/' + c
        })
      }
      return value
    } else if (decision.options) {
      const choice = this.evaluateDistribution(entropy, decision, pointer, context)
      const next = decision.options[choice]
      decisionQueue.push({ decision: next, pointer })
      return undefined
    } else if (decision.number) {
      const { inputs, eq } = decision.number
      return this.evaluateNumber(inputs, eq, context, pointer, '', entropy)
    } else if (decision.value) {
      return decision.value
    }
  }

  evaluateTree (tree, entropy, decisionVector = []) {
    const context = {
      decisionVector,
      result: {}
    }
    const loggedEntropy = (pointer) => {
      let result = entropy(pointer)
      decisionVector.push(result)
      return result
    }
    const decisionQueue = [{ decision: tree, pointer: '/result' }]
    const postOps = []
    // list of visited paths
    const visited = {}
    // list of dependencies that need to be resolved
    const dependencies = {}

    let steps = 0

    while (decisionQueue.length) {
      steps++
      const decisionContainer = decisionQueue.shift()
      const { decision, pointer } = decisionContainer
      if (decision.dependsOn) {
        const unfufilled = []
        for (const relative of decision.dependsOn) {
          const abspath = this.resolve(pointer, relative)
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
      const value = this.evaluateNode(decisionContainer, context, decisionQueue, loggedEntropy)
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
        postOps.push([decision.$template, value, pointer, context])
      }
    }

    // this is important so that operations deeper in the tree are executed before operations earlier in the tree
    postOps.reverse()

    for (const [template, value, pointer, context] of postOps) {
      const finalized = this.applyTemplate(template, value)
      JSONPointer.set(context, pointer, finalized)
    }

    context.steps = steps

    return context
  }

  collapse (tree) {
    return this.evaluateTree(tree, () => Math.floor(this.random() * 256))
  }

  hydrate (tree, decisionVector) {
    let index = 0
    const decide = () => decisionVector[index++]
    return this.evaluateTree(tree, decide).result
  }

  reroll (tree, decisionVector, rerollPointer) {
    let index = 0
    const pathtree = {}
    const initialScan = (pointer) => {
      pathtree[pointer] = decisionVector[index++]
      return pathtree[pointer]
    }
    // note that we don't care about the result - we're scanning the decisionVector onto the paths so we don't reroll adjacent rolls
    this.evaluateTree(tree, initialScan)
    index = 0
    const rerollDecider = (pointer) => {
      if (pointer.indexOf('/result' + rerollPointer) === 0) {
        return  Math.floor(this.random() * 256)
      } else {
        return pathtree[pointer]
      }
    }
    return this.evaluateTree(tree, rerollDecider)
  }
}

module.exports = DecisionTree
