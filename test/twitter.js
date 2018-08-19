'use strict'

const DESCRIBE = require('mocha').describe
const IT = require('mocha').it
const EXPECT = require('chai').expect
const WHORL = require('../')

DESCRIBE('lib/twitter (Twitter handling)', function () {
  this.timeout(10000)

  IT('should return a handle from a status', async () => {
    let a = await WHORL('https://twitter.com/npmjs/status/590307732042973184')
    EXPECT(a).to.equal('@npmjs')
  })

  IT('should return a handle from a profile', async () => {
    let a = await WHORL('https://twitter.com/npmjs')
    EXPECT(a).to.equal('@npmjs')
  })

  IT('should return null if not a status or profile', async () => {
    let a = await WHORL('https://twitter.com/search')
    EXPECT(a).to.be.null
  })
})
