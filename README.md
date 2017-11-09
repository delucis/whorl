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

Current tests return the correct author for around 73% of URLs and no author at all for 22% of URLs.

URL test set                                   | # of URLs | accurate | inaccurate | `null`
-----------------------------------------------|:---------:|----------|------------|-----------
[whorl](test/test-urls.yml)                    |    48     | 36 (75%) | 4 (8.33%)  | 8 (16.66%)
[metascraper](test/metascraper-test-urls.yml)* |    30     | 21 (70%) | 0 (0%)     | 9 (30%)

<small>\* The `metascraper` package [reports a 87.5% success rate][7f1cb556] for accurate author retrieval with these URLs.</small>

  [7f1cb556]: https://github.com/ianstormtaylor/metascraper/tree/master/support/comparison#author "metascraper test results"


## API

### whorl(url)

Returns a `Promise` for an author `String`.

#### url

Type: `String`

The URL for which to retrieve an author string.
