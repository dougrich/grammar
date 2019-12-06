const { evaluate } = require('./number')

function countStep (tree) {
  const decisionQueue = [tree]
  let step = 0

  while (decisionQueue.length) {
    const decision = decisionQueue.shift()
    step++
    if (decision.children) {
      for (const d in decision.children) {
        decisionQueue.push(decision.children[d])
      }
    }
    if (decision.options) {
      for (const child of decision.options) {
        decisionQueue.push(child)
      }
    }
    if (decision.repeat) {
      const inputSet = {}
      const count = evaluate(decision.repeat.count.eq, ({ distribution: { weights } }) => weights.length - 1, inputSet)
      for (let i = 0; i < count; i++) {
        decisionQueue.push(decision.repeat.instance)
      }
    }
    if (decision.$template) {
      step++
    }
  }

  return step
}

module.exports = countStep
