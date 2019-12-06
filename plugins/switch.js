function parsePartial (decision) {
  const cases = decision.switch
  const [dependency] = Object.keys(cases)
  let values = Object.keys(cases[dependency])
  const optionCount = values.length
  values = values.filter(x => x !== '$default')
  const options = []
  const $ref = {}
  const matrixInputs = []
  const matrixValues = []
  for (const v of values) {
    const matrixRow = new Array(optionCount)
    matrixRow.fill(0)
    matrixRow[options.length] = 1
    matrixInputs.push({ lookup: dependency, eq: v })
    $ref['/options/' + options.length] = cases[dependency][v]
    options.push(null)
    matrixValues.push(matrixRow)
  }

  if (cases[dependency].$default) {
    const matrixRow = new Array(optionCount)
    matrixRow.fill(0)
    matrixInputs.push(0)
    $ref['/options/' + options.length] = cases[dependency].$default
    options.push(null)
    matrixValues.push(matrixRow)
  }

  return {
    distribution: {
      matrix: {
        inputs: matrixInputs,
        values: matrixValues
      }
    },
    options,
    dependsOn: [dependency],
    $ref
  }
}

module.exports = {
  canParse: p => !!p.switch,
  parsePartial
}
