function parsePartial(decision) {
  const cases = decision.switch
  const [dependency] = Object.keys(cases)
  let values = Object.keys(cases[dependency])
  const optionCount = values.length
  values = values.filter(x => x !== '$default')
  const options = []
  const matrixInputs = []
  const matrixValues = []
  for (const v of values) {
    const matrixRow = new Array(optionCount)
    matrixRow.fill(0)
    matrixRow[options.length] = 1
    matrixInputs.push({ lookup: dependency, eq: v })
    options.push(cases[dependency][v])
    matrixValues.push(matrixRow)
  }

  if (cases[dependency].$default) {
    const matrixRow = new Array(optionCount)
    matrixRow.fill(0)
    matrixInputs.push(0)
    options.push(cases[dependency].$default)
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
    dependsOn: [dependency]
  }
}

module.exports = {
  canParse: p => !!p.switch,
  parsePartial
}