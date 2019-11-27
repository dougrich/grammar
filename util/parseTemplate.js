function parseTemplate(raw) {
  let commands = []
  let index = 0
  while ((index = raw.indexOf('{', index)) >= 0) {
    commands.push(raw.slice(0, index))
    raw = raw.slice(index)
    index = 0
    const endIndex = raw.indexOf('}')
    const field = raw.slice(1, endIndex)
    commands.push({
      lookup: '/' + field
    })
    raw = raw.slice(endIndex + 1)
  }
  commands.push(raw)
  return commands
}

module.exports = parseTemplate