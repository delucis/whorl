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
accurate | **67.50%** | **65.00%** | **35.00%** | **27.50%**
innacurate | 7.50% | 17.50% | 62.50% | 68.75%
`null` | 25.00% | 17.50% | 2.50% | 3.75%