'use strict'

const FS = require('fs')
const UTIL = require('util')
const WRITE = UTIL.promisify(FS.writeFile)
const WHORL = require('../')
const MS = require('./lib/metascraper.js')
const UF = require('./lib/unfluff.js')
const MI = require('./lib/metainspector.js')
const BENCH = require('./bench-core.js')

async function runTests () {
  let results = await Promise.all([
    BENCH(WHORL, { label: 'whorl', assertQuality: true, printSummary: true }),
    BENCH(MS, { label: 'metascraper' }),
    BENCH(UF, { label: 'unfluff' }),
    BENCH(MI, { label: 'node-metainspector' })
  ])
  results = { whorl: results[0], metascraper: results[1], unfluff: results[2], 'node-metainspector': results[3] }
  await saveStats(results)
}

async function saveStats (results) {
  let totals = {}
  for (let lib in results) {
    totals[lib] = results[lib].reduce(({ totalTestCount, totalPassCount, totalFailCount, totalNullCount }, { testCount, passCount, failCount, nullCount }) => {
      return {
        totalTestCount: totalTestCount + testCount,
        totalPassCount: totalPassCount + passCount,
        totalFailCount: totalFailCount + failCount,
        totalNullCount: totalNullCount + nullCount
      }
    }, { totalTestCount: 0, totalPassCount: 0, totalFailCount: 0, totalNullCount: 0 })
  }

  const { totalTestCount, totalPassCount, totalNullCount } = totals.whorl
  const globalSuccess = (totalPassCount / totalTestCount * 100).toFixed(2)
  const globalNulls = (totalNullCount / totalTestCount * 100).toFixed(2)

  let md = `# \`whorl\` accuracy

Current tests return the correct author for around ${globalSuccess}% of URLs and no author at all for ${globalNulls}% of URLs.

URL test set | # of URLs | accurate | inaccurate | \`null\`
-------------|:---------:|----------|------------|--------
`

  results.whorl.forEach(row => {
    md += `${row.arrayName} | ${row.testCount} | `
    md += `${row.passCount} (${row.passPercent.toFixed(2)}%) | `
    md += `${row.failCount} (${row.failPercent.toFixed(2)}%) | `
    md += `${row.nullCount} (${row.nullPercent.toFixed(2)}%)
`
  })

  md += `

## Comparisons

Here are results for the same ${totalTestCount} test URLs using several different libraries:

**library**`

  for (let lib in results) {
    md += ` | \`${lib}\``
  }

  md += '\n--------'

  for (let i = 0; i < Object.keys(results).length; i++) md += '|---'

  md += '\n**accurate**'

  for (let lib in totals) {
    md += ` | ${(totals[lib].totalPassCount / totals[lib].totalTestCount * 100).toFixed(2)}%`
  }

  md += '\n**innacurate**'

  for (let lib in totals) {
    md += ` | ${(totals[lib].totalFailCount / totals[lib].totalTestCount * 100).toFixed(2)}%`
  }

  md += '\n**`null`**'

  for (let lib in totals) {
    md += ` | ${(totals[lib].totalNullCount / totals[lib].totalTestCount * 100).toFixed(2)}%`
  }

  md += '\n**vulnerabilities**'

  for (var lib in totals) {
    md += ` | [![Known Vulnerabilities](https://snyk.io/test/npm/${lib}/badge.svg)](https://snyk.io/test/npm/${lib})`
  }

  await WRITE('bench/benchmark.md', md)
}

runTests()
