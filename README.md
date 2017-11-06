# whorl ✏️❔

IPA: /huˌɑɹˈɛl/

**⚠️ WORK IN PROGRESS ⚠️**

Find out who the author(s) is/are from an input URL.


## Installation

```sh
npm install --save whorl
```


## Usage

```js
const WHORL = require('whorl')
WHORL('http://www.nytimes.com/2007/05/13/us/13names.html')
  .then((name) => {
    console.log(name) // ⇒ 'The Associated Press'
  })
```

If no author(s) can be deduced or the input URL is not valid, `whorl` will return `null`.


## Accuracy

Current tests return the correct author for around ⅔ of URLs and no author at all for ¼ of URLs.

URL test set                                   | # of URLs | accurate    | inaccurate | `null`
-----------------------------------------------|:---------:|-------------|------------|------------
[whorl](test/test-urls.yml)                    | 47        | 30 (63.83%) | 8 (17.02%) | 9 (19.15%)
[metascraper](test/metascraper-test-urls.yml)* | 30        | 19 (63.33%) | 1 (3.33%)  | 10 (33.33%)

<small>\* The `metascraper` package [reports a 87.5% success rate][7f1cb556] for accurate author retrieval with these URLs.</small>

  [7f1cb556]: https://github.com/ianstormtaylor/metascraper/tree/master/support/comparison#author "metascraper test results"


## API

### whorl(url)

Returns a `Promise` for an author `String`.

#### url

Type: `String`

The URL for which to retrieve an author string.
