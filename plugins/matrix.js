function parsePartial ({ matrix }) {
  const dependsOn = []
  const inputs = []
  const values = []
  const options = []

  for (const i of matrix.inputs) {
    if (typeof i === 'object') {
      const { lookup } = i
      if (!dependsOn.includes(lookup)) dependsOn.push(lookup)
    }
    inputs.push(i)
  }

  for (const r of matrix.rows) {
    const { coefficients, ...rest } = r
    values.push(coefficients)
    options.push(rest)
  }

  return {
    dependsOn,
    distribution: {
      matrix: {
        inputs,
        values
      }
    },
    options
  }
}

module.exports = {
  canParse: p => !!p.matrix,
  parsePartial
}
