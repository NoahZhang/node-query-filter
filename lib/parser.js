var Expressions = require('./expressions');
var parserFactory = function (fn) {
  return function (source, options) {
    options = options || {};
    var raw = new Uint8Array(source.length);
    var pos = 0;
    for (var i = 0; i < source.length; i++) {
      raw[i] = source.charCodeAt(i);
    }
    var result = fn(raw, pos, options.metadata);
    if (!result)
      throw new Error('Fail at ' + pos);
    if (result.next < raw.length)
      throw new Error('Unexpected character at ' + result.next);
    return result;
  };
};

function filter(source, options) { return parserFactory(Expressions.boolCommonExpr)(source, options); }
exports.filter = filter;