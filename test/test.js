'use strict'

const DESCRIBE = require('mocha').describe
const IT = require('mocha').it
const EXPECT = require('chai').expect
const WHORL = require('../')

DESCRIBE('whorl', function () {
  this.timeout(10000)

  IT('should return null if the URL is not valid', async function () {
    let author = await WHORL('the-story-of-a-new-name')
    EXPECT(author).to.be.null
  })

  IT('should return null if the URL does not return data', async () => {
    let a = await WHORL('http://www.fake-url.net/')
    EXPECT(a).to.be.null
  })

  IT('should return an article author from schema.org markup', async () => {
    let a = await WHORL('https://www.nytimes.com/2016/02/05/t-magazine/entertainment/my-10-favorite-books-alison-bechdel.html?searchResultPosition=1')
    EXPECT(a).to.equal('Alison Bechdel')
  })

  IT('should return an article author from JSON-LD markup', async () => {
    let a = await WHORL('http://www.newyorker.com/tech/elements/why-your-name-matters')
    EXPECT(a).to.equal('Maria Konnikova')
  })

  IT('should return an article author from <meta> tags', async () => {
    let a = await WHORL('http://www.nytimes.com/1994/08/19/nyregion/a-matter-of-identity-what-s-in-a-name-change-everything-you-can-imagine.html')
    EXPECT(a).to.equal('Jennifer Steinhauer')
  })

  IT('should return a clean author name if the data includes “by,” “von” etc.', async () => {
    let a = await WHORL('https://www.nzz.ch/feuilleton/elena-ferrantes-neapel-saga-in-der-schuld-des-ungluecks-ld.141596')
    EXPECT(a).to.equal('Franz Haas')
  })

  IT('should handle multiple authors', async () => {
    let a = await WHORL('http://www.lefigaro.fr/livres/2016/12/02/03005-20161202ARTFIG00156--le-nouveau-nom-d-elena-ferrante-sacre-meilleur-livre-de-l-annee.php')
    EXPECT(a).to.equal('AFP agence and Elena Scappaticci')
  })

  IT('should prefer authors with an articleBody over authors without', async () => {
    let a = await WHORL('https://www.theatlantic.com/technology/archive/2011/08/why-facebook-and-googles-concept-of-real-names-is-revolutionary/243171/')
    EXPECT(a).to.equal('Alexis C. Madrigal')
  })
})
