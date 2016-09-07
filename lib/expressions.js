var Utils = require('./utils');
var Lexer = require('./lexer');
var PrimitiveLiteral = require('./primitiveLiteral');
var TokenType = require('./tokenType')

function commonExpr(value, index) {
  var token = PrimitiveLiteral.primitiveLiteral(value, index) ||
    methodCallExpr(value, index) ||
    parameterExpression(value, index) ||
    negateExpr(value, index) ||
    parenExpr(value, index);
  if (!token)
    return;
  if (token)
    return Lexer.tokenize(value, token.position, token.next, token, TokenType.CommonExpression);
}
exports.commonExpr = commonExpr;
function boolCommonExpr(value, index) {
  var token = boolMethodCallExpr(value, index) ||
    notExpr(value, index) ||
    commonExpr(value, index) ||
    boolParenExpr(value, index);
  if (!token)
    return;
  var commonMoreExpr = undefined;
  if (token.type == TokenType.CommonExpression) {
    commonMoreExpr = eqExpr(value, token.next) ||
      neExpr(value, token.next) ||
      ltExpr(value, token.next) ||
      leExpr(value, token.next) ||
      gtExpr(value, token.next) ||
      geExpr(value, token.next);
    if (commonMoreExpr) {
      token.value = {
        left: token.value,
        right: commonMoreExpr.value
      };
      token.next = commonMoreExpr.value.next;
      token.type = commonMoreExpr.type;
      token.raw = Utils.stringify(value, token.position, token.next);
    }
  }
  var expr = andExpr(value, token.next) ||
    orExpr(value, token.next);
  if (expr) {
    token.next = expr.value.next;
    token.value = {
      left: Lexer.clone(token),
      right: expr.value
    };
    token.type = expr.type;
    token.raw = Utils.stringify(value, token.position, token.next);
  }
  return token;
}
exports.boolCommonExpr = boolCommonExpr;
function andExpr(value, index) {
  var rws = Lexer.RWS(value, index);
  if (rws == index || !Utils.equals(value, rws, 'and'))
    return;
  var start = index;
  index = rws + 3;
  rws = Lexer.RWS(value, index);
  if (rws == index)
    return;
  index = rws;
  var token = boolCommonExpr(value, index);
  if (!token)
    return;
  return Lexer.tokenize(value, start, index, token, TokenType.AndExpression);
}
exports.andExpr = andExpr;
function orExpr(value, index) {
  var rws = Lexer.RWS(value, index);
  if (rws == index || !Utils.equals(value, rws, 'or'))
    return;
  var start = index;
  index = rws + 2;
  rws = Lexer.RWS(value, index);
  if (rws == index)
    return;
  index = rws;
  var token = boolCommonExpr(value, index);
  if (!token)
    return;
  return Lexer.tokenize(value, start, index, token, TokenType.OrExpression);
}
exports.orExpr = orExpr;
function binaryExpression(value, index, expr, tokenType) {
  var rws = Lexer.RWS(value, index);
  if (rws == index)
    return;
  var start = index;
  index = rws;
  if (!Utils.equals(value, index, expr))
    return;
  index += expr.length;
  rws = Lexer.RWS(value, index);
  if (rws == index)
    return;
  index = rws;
  var token = commonExpr(value, index);
  if (!token)
    return;
  return Lexer.tokenize(value, start, index, token.value, tokenType);
}
exports.binaryExpression = binaryExpression;
function eqExpr(value, index) { return binaryExpression(value, index, 'eq', TokenType.EqualsExpression); }
exports.eqExpr = eqExpr;
function neExpr(value, index) { return binaryExpression(value, index, 'ne', TokenType.NotEqualsExpression); }
exports.neExpr = neExpr;
function ltExpr(value, index) { return binaryExpression(value, index, 'lt', TokenType.LesserThanExpression); }
exports.ltExpr = ltExpr;
function leExpr(value, index) { return binaryExpression(value, index, 'le', TokenType.LesserOrEqualsExpression); }
exports.leExpr = leExpr;
function gtExpr(value, index) { return binaryExpression(value, index, 'gt', TokenType.GreaterThanExpression); }
exports.gtExpr = gtExpr;
function geExpr(value, index) { return binaryExpression(value, index, 'ge', TokenType.GreaterOrEqualsExpression); }
exports.geExpr = geExpr;
function notExpr(value, index) {
  if (!Utils.equals(value, index, 'not'))
    return;
  var start = index;
  index += 3;
  var rws = Lexer.RWS(value, index);
  if (rws == index)
    return;
  index = rws;
  var token = boolCommonExpr(value, index);
  if (!token)
    return;
  return Lexer.tokenize(value, start, token.next, token, TokenType.NotExpression);
}
exports.notExpr = notExpr;
function boolParenExpr(value, index) {
  var open = Lexer.OPEN(value, index);
  if (!open)
    return;
  var start = index;
  index = open;
  index = Lexer.BWS(value, index);
  var token = boolCommonExpr(value, index);
  if (!token)
    return;
  index = Lexer.BWS(value, token.next);
  var close = Lexer.CLOSE(value, index);
  if (!close)
    return;
  index = close;
  return Lexer.tokenize(value, start, index, token, TokenType.BoolParenExpression);
}
exports.boolParenExpr = boolParenExpr;
function parenExpr(value, index) {
  var open = Lexer.OPEN(value, index);
  if (!open)
    return;
  var start = index;
  index = open;
  index = Lexer.BWS(value, index);
  var token = commonExpr(value, index);
  if (!token)
    return;
  index = Lexer.BWS(value, token.next);
  var close = Lexer.CLOSE(value, index);
  if (!close)
    return;
  index = close;
  return Lexer.tokenize(value, start, index, token.value, TokenType.ParenExpression);
}
exports.parenExpr = parenExpr;
function boolMethodCallExpr(value, index) {
  return endsWithMethodCallExpr(value, index) ||
    startsWithMethodCallExpr(value, index) ||
    containsMethodCallExpr(value, index);
}
exports.boolMethodCallExpr = boolMethodCallExpr;
function methodCallExpr(value, index) {
  return indexOfMethodCallExpr(value, index) ||
    toLowerMethodCallExpr(value, index) ||
    toUpperMethodCallExpr(value, index) ||
    lengthMethodCallExpr(value, index);
}
exports.methodCallExpr = methodCallExpr;
function methodCallExprFactory(value, index, method, min, max) {
  if (typeof min == 'undefined')
    min = 0;
  if (typeof max == 'undefined')
    max = min;
  if (!Utils.equals(value, index, method))
    return;
  var start = index;
  index += method.length;
  var open = Lexer.OPEN(value, index);
  if (!open)
    return;
  index = open;
  index = Lexer.BWS(value, index);
  var parameters;
  if (min > 0) {
    parameters = [];
    while (parameters.length < max) {
      var expr = commonExpr(value, index);
      if (parameters.length < min && !expr)
        return;
      else if (expr) {
        parameters.push(expr.value);
        index = expr.next;
        index = Lexer.BWS(value, index);
        var comma = Lexer.COMMA(value, index);
        if (parameters.length < min && !comma)
          return;
        if (comma)
          index = comma;
        else
          break;
        index = Lexer.BWS(value, index);
      }
      else
        break;
    }
  }
  index = Lexer.BWS(value, index);
  var close = Lexer.CLOSE(value, index);
  if (!close)
    return;
  index = close;
  return Lexer.tokenize(value, start, index, {
    method: method,
    parameters: parameters
  }, TokenType.MethodCallExpression);
}
exports.methodCallExprFactory = methodCallExprFactory;
function containsMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'contains', 2); }
exports.containsMethodCallExpr = containsMethodCallExpr;
function startsWithMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'startswith', 2); }
exports.startsWithMethodCallExpr = startsWithMethodCallExpr;
function endsWithMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'endswith', 2); }
exports.endsWithMethodCallExpr = endsWithMethodCallExpr;
function lengthMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'length', 1); }
exports.lengthMethodCallExpr = lengthMethodCallExpr;
function indexOfMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'indexof', 2); }
exports.indexOfMethodCallExpr = indexOfMethodCallExpr;
function toLowerMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'tolower', 1); }
exports.toLowerMethodCallExpr = toLowerMethodCallExpr;
function toUpperMethodCallExpr(value, index) { return methodCallExprFactory(value, index, 'toupper', 1); }
exports.toUpperMethodCallExpr = toUpperMethodCallExpr;
function negateExpr(value, index) {
  if (value[index] != 0x2d)
    return;
  var start = index;
  index++;
  index = Lexer.BWS(value, index);
  var expr = commonExpr(value, index);
  if (!expr)
    return;
  return Lexer.tokenize(value, start, expr.next, expr, TokenType.NegateExpression);
}
exports.negateExpr = negateExpr;
function parameterExpression(value, index) {
  var token;
  var member;
  var start = index;
  member = memberExpr(value, index);
  token = member;
  if (!token)
    return;
  return Lexer.tokenize(value, start, token.next, token, TokenType.ParameterExpression);
}
exports.parameterExpression = parameterExpression;
function memberExpr(value, index) {
  var start = index;
  var token;
  var next = propertyPathExpr(value, index);
  if (!next)
    return;
  return Lexer.tokenize(value, start, next.next, token ? { name: token, value: next } : next, TokenType.MemberExpression);
}
exports.memberExpr = memberExpr;
function propertyPathExpr(value, index) {
  var token = PrimitiveLiteral.odataIdentifier(value, index);
  var start = index;
  if (token) {
    index = token.next;
  }
  if (!token)
    return;
  return Lexer.tokenize(value, start, index, token, TokenType.PropertyPathExpression);
}
exports.propertyPathExpr = propertyPathExpr;