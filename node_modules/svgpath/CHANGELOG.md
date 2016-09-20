2.2.0 / 2016-09-11
------------------

- Added `.skewX()` & `.skewY()` shortcuts.
- Added typescript definitions.
- Dropped `Makefile`, use npm instead.
- Deps bump & cleanup.


2.1.6 / 2016-03-09
------------------

- Fixed arc transforms for edge cases (precision + sweep flag), #23.


2.1.5 / 2016-01-03
------------------

- Improved parser error messages.


2.1.4 / 2016-01-03
------------------

- More strict params count and exponent parse.
- Properly correct round error on contour end.
- Never drop empty arcs. Replace with lines to avoid collisions on `S A S`.


2.1.3 / 2015-12-30
------------------

- Fixed `.unarc()` - expand zero-radius arcs to lines.


2.1.2 / 2015-12-22
------------------

- Fixed arc transforms, #13. Thanks to @kpym.


2.1.1 / 2015-12-07
------------------

- Don't collapse `M` & `m` commands on output.


2.1.0 / 2015-10-27
------------------

- First `m` in path should be processed as absolute (`M`).
- Don't force first `M` -> `m` on `.rel()`.


2.0.0 / 2015-04-16
------------------

- Unified transformations math.
- Added `.matrix` and `.rotate()`.
- Added `.unarc()` - convert arcs to curves.
- Evaluate curried transforms lazily.
- Fixed `.unshort()` - now relative commands processed too.
- Fixed `.round()` - no more precision loss on relative coordinated.
- 100% tests coverage.
- Minor optimisations & code refactoring.


1.0.7 / 2014-12-05
------------------

- Parser rewrite (1.5x speedup).
- Exposed `.err` property with text of error (empty on success).


1.0.6 / 2014-06-15
------------------

- Maintenance release - docs & build scripts update.


1.0.5 / 2014-04-09
------------------

- Fixed line terminators handle in parser.


1.0.4 / 2014-03-14
------------------

- Added .transform() support.


1.0.3 / 2014-02-23
------------------

- Parser rewrite (2x speed gain).
- toString(): skip command name on repeaded sequences.
- Added tests & benchmarks.


1.0.2 / 2013-12-03
------------------

- Fixed arcs roundung (missed type cast), by @kolya-ay.


1.0.1 / 2013-10-02
------------------

- Fixed params parse: 29.5.5 -> 29.5, 0.5.


1.0.0 / 2013-09-26
------------------

- First release.
