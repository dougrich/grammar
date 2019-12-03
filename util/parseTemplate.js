
function tokenize (raw) {
  const tokens = []
  let current = ''
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === '{') {
      // check if the last one was an escape
      if (i > 0 && raw[i - 1] === '\\') {
        current = current.slice(0, -1)
      } else if (current) {
        tokens.push(current)
        current = ''
      }
    }
    current += raw[i]
    if (raw[i] === '}') {
      // check if the last one was an escape
      if (i > 0 && raw[i - 1] === '\\') {
        current = current.slice(0, -2) + '}'
      } else if (current) {
        tokens.push(current)
        current = ''
      }
    }
  }

  if (current) {
    tokens.push(current)
  }

  return tokens
}

function findTerminatingTokenIndex (tokens, start, command) {
  let depth = 0
  const endtoken = '{/' + command + '}'
  const starttoken = '{#' + command + '}'
  for (let i = start + 1; i < tokens.length; i++) {
    if (tokens[i] === endtoken) {
      if (depth === 0) return i
      else depth--
    } else if (tokens[i] === starttoken) {
      depth++
    }
  }
  throw new Error('Unterminated opening tag')
}

function parseTemplateFromTokens (tokens) {
  const commands = []
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token[0] !== '{') commands.push(token)
    else if (token === '{.}') commands.push({ lookup: '/' })
    else if (token[1] === '#') {
      const trailingSpace = token.indexOf(' ')
      const command = token.slice(2, trailingSpace)
      const lookup = '/' + token.slice(trailingSpace + 1, -1)
      const termination = findTerminatingTokenIndex(tokens, i, command)
      commands.push({
        lookup,
        [command]: parseTemplateFromTokens(tokens.slice(i + 1, termination + 1))
      })
      i = termination
    } else if (token[1] === '/') {
      continue
    } else commands.push({ lookup: '/' + token.slice(1, -1) })
  }
  return commands
}

function parseTemplate (raw) {
  const tokens = tokenize(raw)
  return parseTemplateFromTokens(tokens)
}

parseTemplate.tokenize = tokenize

module.exports = parseTemplate
