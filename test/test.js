'use strict'

const DESCRIBE = require('mocha').describe
const AFTER = require('mocha').after
const IT = require('mocha').it
const EXPECT = require('chai').expect
const TABLE = require('tty-table')
const CHALK = require('chalk')
const WHORL = require('../')

// load test URLs from file
const READ = require('read-yaml').sync
const TEST_URLS = READ('./test/test-urls.yml')
const METASCRAPER_URLS = READ('./test/metascraper-test-urls.yml')

/**
 * Run tests for an array of objects containing url, author and (optionally)
 * site properties.
 * @param  {Object[]} urlArray          The array of objects to run tests with
 * @param  {String}   urlArray[].author The expected author for the url
 * @param  {String}   urlArray[].url    The url to fetch author metadata for
 * @param  {String=}  urlArray[].site  The name of the site being tested (printed in the test description)
 */
function testUrlArray (urlArray) {
  DESCRIBE('whorl', function () {
    this.timeout(10000)

    let rows = []
    let testCount = 0
    let passedCount = 0
    let nullCount = 0
    let failCount = 0

    for (let test of urlArray) {
      testCount++
      let testDescription = `should return an author of “${test.author}” from ${test.site}`
      IT(testDescription, async function () {
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
          EXPECT(author).to.match(authorRE)
        } else {
          passedCount++
        }
      })
    }

    AFTER(function () {
      let header = [
        {
          value: 'expected',
          width: 30
        },
        {
          value: 'returned',
          width: 30
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

      console.log(table.render())
    })
  })
}

DESCRIBE('whorl', function () {
  this.timeout(10000)

  IT('should return null if the URL is not valid', async function () {
    let author = await WHORL('the-story-of-a-new-name')
    EXPECT(author).to.be.null
  })
})

testUrlArray(TEST_URLS)

testUrlArray(METASCRAPER_URLS)
