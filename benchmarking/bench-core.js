'use strict'

const ASSERT = require('assert')
const TABLE = require('tty-table')
const CHALK = require('chalk')

// load test URLs from file
const READ = require('read-yaml').sync
const TEST_URLS = READ('./benchmarking/test-urls.yml')
const METASCRAPER_URLS = READ('./benchmarking/metascraper-test-urls.yml')

/**
 * Test URLs against a given function that should return an author given a URL.
 * @param  {Function} fn                        Function to retrieve URL author
 * @param  {Object}   opts
 * @param  {String}  [opts.label]               A label for this benchmark
 * @param  {Boolean} [opts.printTables=false]   Should we log errors?
 * @param  {Boolean} [opts.printSummary=false]  Should we log a summary?
 * @param  {Boolean} [opts.assertQuality=false] Should we assert result quality?
 * @return {Promise}
 */
module.exports = async (fn, { label, printTables = false, printSummary = false, assertQuality = false } = {}) => {
  const results = await Promise.all([
    testUrlArray(TEST_URLS, fn, { arrayName: 'whorl' }),
    testUrlArray(METASCRAPER_URLS, fn, { arrayName: 'metascraper' })
  ])
  results.forEach((results) => {
    if (printTables) printResultsTable(results, { label })
    if (assertQuality) assertResultsQuality(results)
  })
  if (printSummary) {
    printSummaryTable(results, { label })
  }
  return results
}

/**
 * Run tests for an array of objects containing url, author and (optionally)
 * site properties.
 * @param  {Object[]} urlArray           The array of objects to run tests with
 * @param  {String}   urlArray[].author  The expected author for the url
 * @param  {String}   urlArray[].url     The url to fetch author metadata for
 * @param  {String}   urlArray[].site    The name of the site being tested (printed in the test description)
 * @param  {Function} fn                 Function that returns a URL’s author
 * @param  {Object}   opts
 * @param  {String}  [opts.arrayName=''] Name of the URL array being tested
 */
async function testUrlArray (urlArray, fn, { arrayName = '' } = {}) {
  let rows = []
  let testCount = 0
  let passCount = 0
  let nullCount = 0
  let failCount = 0

  await Promise.all(urlArray.map(async test => {
    testCount++
    let author = await fn(test.url)
    if (test.author) {
      let authorRE = new RegExp('^' + test.author + '$', 'i')
      let passes = authorRE.test(author)
      if (passes) {
        passCount++
      } else {
        rows.push([
          test.author,
          CHALK.red(author || 'null')
        ])
        if (author === null) {
          nullCount++
        } else {
          failCount++
        }
      }
    } else {
      passCount++
    }
  }))

  return {
    arrayName,
    testCount,
    passCount,
    passPercent: passCount / testCount * 100,
    failCount,
    failPercent: failCount / testCount * 100,
    nullCount,
    nullPercent: nullCount / testCount * 100,
    rows
  }
}

/**
 * Assert that test results are >= 50% correct and misidentify <= 10%
 * @param  {Object} results     Test results as returned by `testUrlArray()`
 * @param  {Number} results.passPercent  Percentage of tests that passed
 * @param  {Number} results.failPercent  Percentage of tests that failed
 */
function assertResultsQuality ({ passPercent, failPercent }) {
  ASSERT(passPercent >= 50, 'whorl should correctly identify at least 50% of URLs')
  ASSERT(failPercent <= 10, 'whorl should not misidentify more than 10% of URLs')
}

/**
 * Print a table of misidentified or null results to the terminal
 * @param  {String} arrayName
 * @param  {Number} passCount
 * @param  {Number} passPercent
 * @param  {Number} testCount
 * @param  {Number} nullCount
 * @param  {Number} failCount
 * @param  {Array}  rows
 */
function printResultsTable ({ arrayName, passCount, passPercent, testCount, nullCount, failCount, rows }, { label }) {
  let header = [
    { value: 'expected', width: 35 },
    { value: 'returned', width: 35 }
  ]

  let footerString = `${passCount}/${testCount} (${passPercent.toFixed(2)}%), ${nullCount} null, ${failCount} misidentified`

  footerString = passPercent < 50 ? CHALK.bgRed(footerString) : passPercent < 75 ? CHALK.bgYellow(footerString) : CHALK.bgGreen(footerString)

  footerString = CHALK.bold.black(footerString)

  let footer = [
    CHALK.bold('PASSED:'),
    footerString
  ]

  let table = new TABLE(header, rows, footer, {
    color: 'grey',
    borderStyle: 0,
    footerColor: 'white',
    headerColor: 'white'
  })

  console.log(heading(`${label ? label + ' – ' : ''}Unsuccessful results with ${CHALK.underline(arrayName)} test set`))
  console.log(table.render())
}

/**
 * Print a table summarising test results
 * @param  {Array} results Array of test results
 */
function printSummaryTable (results, { label }) {
  let header = [
    { value: 'URL test set' },
    { value: '# of URLs' },
    { value: 'accurate' },
    { value: 'inaccurate' },
    { value: 'null' }
  ]

  let rows = results.map(({ arrayName, testCount, passCount, passPercent, failCount, failPercent, nullCount, nullPercent }) => {
    return [
      arrayName,
      testCount,
      `${passCount} (${passPercent.toFixed(2)}%)`,
      `${failCount} (${failPercent.toFixed(2)}%)`,
      `${nullCount} (${nullPercent.toFixed(2)}%)`
    ]
  })

  let table = new TABLE(header, rows, {
    color: 'grey',
    borderStyle: 0,
    footerColor: 'white',
    headerColor: 'white'
  })

  console.log(heading(`${label ? label + ' – ' : ''}Tests Summary`))
  console.log(table.render())
}

/**
 * Format a string to display as a heading in the terminal
 * @param  {String} s String to format
 * @return {String}   Formatted string
 */
const heading = s => `\n\n${CHALK.blue('▶︎')} ${CHALK.bold(s)}`
