'use strict'

const DESCRIBE = require('mocha').describe
const IT = require('mocha').it
const EXPECT = require('chai').expect
const WHORL = require('./')

// load test URLs from file
const READ = require('read-yaml').sync
const TEST_URLS = READ('./testURLs.yml')

DESCRIBE('whorl', function () {
  this.timeout(10000)

  IT('should return null if the URL is not valid', async function () {
    let md = await WHORL('the-story-of-a-new-name')
    EXPECT(md).to.be.null
  })

  for (let test of TEST_URLS) {
    let testDescription = `should return an author of “${test.author}” from ${test.site}`
    IT(testDescription, async function () {
      let author = await WHORL(test.url)
      console.log('\t⇒ %s', author)
      if (test.author) {
        let authorRE = new RegExp('^' + test.author + '$', 'i')
        EXPECT(author).to.match(authorRE)
      }
    })
  }
})
