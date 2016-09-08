node-query-filter
===============

[![build status][travis-image]][travis-url]

[travis-image]: https://img.shields.io/travis/koajs/bodyparser.svg?style=flat-square
[travis-url]: https://travis-ci.org/NoahZhang/node-query-filter#

A url parameter parser for oData filter standard, base on [odata-v4-parser](https://github.com/jaystack/odata-v4-parser).

## Demo
```
var filter = "name eq 'tu'";
var result = parser.filter(filter);

console.log(result)
```
result:
```
{
  position: 0,
  next: 12,
  value:
   { left:
      Token {
        position: 0,
        next: 4,
        value: [Object],
        type: 'ParameterExpression',
        raw: 'name' },
     right:
      Token {
        position: 8,
        next: 12,
        value: 'String',
        type: 'Literal',
        raw: '\'tu\'' } },
  type: 'EqualsExpression',
  raw: 'name eq \'tu\'' }
```

## Support Feature

* [x] Comparison Operators
	* [x] eq
	* [x] ne
	* [x] lt
	* [x] le
	* [x] gt
	* [x] ge
* [x] Logical Operators
	* [x] and
	* [x] or
	* [x] not
	* [x] grouping
* [x] String Functions
	* [x] indexof
	* [x] contains
	* [x] endswith
	* [x] startswith
	* [x] length
	* [x] tolower
	* [x] toupper
