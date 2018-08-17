'use strict'

const ASSERT = require('assert')
const TABLE = require('tty-table')
const CHALK = require('chalk')
const WHORL = require('../')

// load test URLs from file
const READ = require('read-yaml').sync
const TEST_URLS = READ('./benchmarking/test-urls.yml')
const METASCRAPER_URLS = READ('./benchmarking/metascraper-test-urls.yml')

let accuracyTable = []

async function runTests () {
  await Promise.all([
    testUrlArray(TEST_URLS, 'whorl'),
    testUrlArray(METASCRAPER_URLS, 'metascraper')
  ])
  printSummary()
}

/**
 * Run tests for an array of objects containing url, author and (optionally)
 * site properties.
 * @param  {Object[]} urlArray          The array of objects to run tests with
 * @param  {String}   urlArray[].author The expected author for the url
 * @param  {String}   urlArray[].url    The url to fetch author metadata for
 * @param  {String=}  urlArray[].site  The name of the site being tested (printed in the test description)
 */
async function testUrlArray (urlArray, arrayName) {
  let rows = []
  let testCount = 0
  let passedCount = 0
  let nullCount = 0
  let failCount = 0

  await Promise.all(urlArray.map(async test => {
    testCount++
    let author = await WHORL(test.url)
    if (test.author) {
      let authorRE = new RegExp('^' + test.author + '$', 'i')
      let passes = authorRE.test(author)
      if (passes) {
        passedCount++
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
      passedCount++
    }
  }))
  accuracyTable.push([arrayName, testCount, passedCount, failCount, nullCount])

  ASSERT(passedCount / testCount >= 0.5, 'whorl should correctly identify at least 50% of URLs')

  ASSERT(failCount / testCount <= 0.1, 'whorl should not misidentify more than 10% of URLs')

  let header = [
    {
      value: 'expected',
      width: 35
    },
    {
      value: 'returned',
      width: 35
    }
  ]
  let percentPassed = passedCount / testCount * 100
  let footerString = `${passedCount}/${testCount} (${percentPassed.toFixed(2)}%), ${nullCount} null, ${failCount} misidentified`
  if (percentPassed < 50) {
    footerString = CHALK.bgRed(footerString)
  } else if (percentPassed < 75) {
    footerString = CHALK.bgYellow(footerString)
  } else {
    footerString = CHALK.bgGreen(footerString)
  }
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
  console.log('\n\n', CHALK.blue('▶︎'), CHALK.bold(`Unsuccessful results with ${CHALK.underline(arrayName)} test set`))
  console.log(table.render())
}

function printSummary () {
  let header = [
    {
      value: 'URL test set'
    },
    {
      value: '# of URLs'
    }, {
      value: 'accurate'
    },
    {
      value: 'inaccurate'
    },
    {
      value: 'null'
    }
  ]
  let rows = accuracyTable.map(r => {
    return [
      r[0],
      r[1],
      `${r[2]} (${Math.round(r[2] / r[1] * 100)}%)`,
      `${r[3]} (${Math.round(r[3] / r[1] * 100)}%)`,
      `${r[4]} (${Math.round(r[4] / r[1] * 100)}%)`
    ]
  })
  let table = new TABLE(header, rows, {
    color: 'grey',
    borderStyle: 0,
    footerColor: 'white',
    headerColor: 'white'
  })
  console.log('\n\n', CHALK.blue('▶︎'), CHALK.bold('Tests Summary'))
  console.log(table.render())
}

runTests()
