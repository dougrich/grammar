// in ascending order of precedence
const operators = [
  {
    match: (lookahead) => /^\+/.exec(lookahead)
  },
  {
    match: (lookahead) => /^\-/.exec(lookahead)
  },
  {
    match: (lookahead) => /^d/.exec(lookahead)
  },
  {
    match: (lookahead) => /^c/.exec(lookahead)
  }
]

const tokenMatchers = [
  {
    match: (lookahead) => /^\d+(\.\d+)?/.exec(lookahead),
    arrange: (match) => parseFloat(match[0])
  },
  {
    match: (lookahead) => /^{([a-z]+)}/.exec(lookahead),
    arrange: (match) => ({ arg: match[1] })
  }
]

function parse(phrase) {
  const output = []
  const operatorStack = []
  let i = 0
  while (i < phrase.length) {
    const lookahead = phrase.slice(i)

    // skip whitespace
    if (lookahead[0] === ' ') {
      i++
      continue
    }

    let operatorFound = false

    for (let j = 0; j < operators.length; j++) {
      const operator = operators[j]
      let match = null
      if (match = operator.match(lookahead)) {
        while (operatorStack.length) {
          let { precedence } = operatorStack[operatorStack.length - 1]
          if (precedence >= j) {
            const { token } = operatorStack.pop()
            const right = output.pop()
            const left = output.pop()
            output.push({
              args: [left, right],
              op: token
            })
          } else {
            break
          }
        }
        operatorFound = true
        i += match[0].length
        operatorStack.push({ token: match[0], precedence: j })
        break
      }
    }

    if (operatorFound) continue

    let tokenFound = false

    for (const token of tokenMatchers) {
      let match = null
      if (match = token.match(lookahead)) {
        output.push(token.arrange(match))
        i += match[0].length
        tokenFound = true
        break
      }
    }

    if (tokenFound) continue

    throw new Error('Unrecognized token at ' + i + ', lookahead: ' + lookahead + ', ' + tokenMatchers[0].match(lookahead))
  }

  operatorStack.reverse()
  for (const { token } of operatorStack) {
    const right = output.pop()
    const left = output.pop()
    output.push({
      args: [left, right],
      op: token
    })
  }
  return output[0]
}

const ops = {
  '+': ([a, b]) => a + b,
  '-': ([a, b]) => a - b,
  'd': ([a, b], random) => {
    let sum = 0
    for (let i = 0; i < a; i++) {
      sum += Math.round(random(1, b))
    }
    return sum
  },
  'c': ([a, b], random) => {
    let sum = 0
    for (let i = 0; i < a; i++) {
      sum += random(1, b)
    }
    return sum
  }
}

function evaluate(sequence, random, rootargs) {
  if (typeof sequence !== 'object') {
    return sequence
  } else if (sequence.arg) {
    return rootargs[sequence.arg]
  } else if (sequence.op) {
    const args = sequence.args.map(term => evaluate(term, random, rootargs))
    return ops[sequence.op](args, random)
  } else {
    throw new Error('wtf')
  }
}

module.exports = {
  parse,
  evaluate
}