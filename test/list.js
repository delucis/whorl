'use strict'

const DESCRIBE = require('mocha').describe
const IT = require('mocha').it
const EXPECT = require('chai').expect
const LIST = require('../lib/list')

DESCRIBE('lib/list', function () {
  this.timeout(10000)

  IT('should throw an error if passed a non-array', () => {
    EXPECT(() => LIST('i am already a string')).to.throw(TypeError)
  })

  IT('should return an empty string from an empty array', () => {
    EXPECT(LIST([])).to.equal('')
  })

  IT('should return the only item from a 1-item array', () => {
    const a = ['item']
    EXPECT(LIST(a)).to.equal(a[0])
  })

  IT('should join a 2-item array with “and”', () => {
    const a = ['Elena', 'Lila']
    EXPECT(LIST(a)).to.equal(`${a[0]} and ${a[1]}`)
  })

  IT('should join a multi-item array with commas and “and”', () => {
    const a = ['Elena', 'Lila', 'Pasqualino']
    EXPECT(LIST(a)).to.equal(`${a[0]}, ${a[1]} and ${a[2]}`)
  })

  IT('should accept options for the list seperators', () => {
    const a = ['First', 'Second', 'Third']
    const o = { sep: '. ', and: '. And finally: ' }
    EXPECT(LIST(a, o)).to.equal(a[0] + o.sep + a[1] + o.and + a[2])
  })
})
