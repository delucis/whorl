# `whorl` accuracy

Current tests return the correct author for around 67.50% of URLs and no author at all for 25.00% of URLs.

URL test set | # of URLs | accurate | inaccurate | `null`
-------------|:---------:|----------|------------|--------
whorl | 50 | 37 (74.00%) | 5 (10.00%) | 8 (16.00%)
metascraper | 30 | 17 (56.67%) | 1 (3.33%) | 12 (40.00%)


## Comparisons

Here are results for the same 80 test URLs using several different libraries:

library | `whorl` | `metascraper` | `unfluff` | `node-metainspector`
--------|---|---|---|---
accurate | **67.50%** | **63.75%** | **33.75%** | **21.25%**
innacurate | 7.50% | 17.50% | 63.75% | 63.75%
`null` | 25.00% | 18.75% | 2.50% | 15.00%