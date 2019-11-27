const Parser = require('./parser')
const DecisionTree = require('./decisionTree')

async function generate(opts, name) {
  const parser = new Parser(opts)
  const tree = await parser.parse(name)
  const decider = new DecisionTree(opts)
  return decider.collapse(tree)
}

module.exports = {
  generate,
  Parser,
  DecisionTree
}