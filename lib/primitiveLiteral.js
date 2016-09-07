var Utils = require('./utils');
var Lexer = require('./lexer');
var TokenType = require('./tokenType')

function nullValue(value, index) {
  if (Utils.equals(value, index, 'null'))
    return Lexer.tokenize(value, index, index + 4, 'null', TokenType.Literal);
}
exports.nullValue = nullValue;
function booleanValue(value, index) {
  if (Utils.equals(value, index, 'true'))
    return Lexer.tokenize(value, index, index + 4, 'Boolean', TokenType.Literal);
  if (Utils.equals(value, index, 'false'))
    return Lexer.tokenize(value, index, index + 5, 'Boolean', TokenType.Literal);
}
exports.booleanValue = booleanValue;
function guidValue(value, index) {
  if (Utils.required(value, index, Lexer.HEXDIG, 8, 8) &&
    value[index + 8] == 0x2d &&
    Utils.required(value, index + 9, Lexer.HEXDIG, 4, 4) &&
    value[index + 13] == 0x2d &&
    Utils.required(value, index + 14, Lexer.HEXDIG, 4, 4) &&
    value[index + 18] == 0x2d &&
    Utils.required(value, index + 19, Lexer.HEXDIG, 4, 4) &&
    value[index + 23] == 0x2d &&
    Utils.required(value, index + 24, Lexer.HEXDIG, 12))
    return Lexer.tokenize(value, index, index + 36, 'Guid', TokenType.Literal);
}
exports.guidValue = guidValue;
function sbyteValue(value, index) {
  var start = index;
  var sign = Lexer.SIGN(value, index);
  if (sign)
    index = sign;
  var next = Utils.required(value, index, Lexer.DIGIT, 1, 3);
  if (next) {
    if (Lexer.DIGIT(value[next]))
      return;
    var val = parseInt(Utils.stringify(value, start, next), 10);
    if (val >= -128 && val <= 127)
      return Lexer.tokenize(value, start, next, 'SByte', TokenType.Literal);
  }
}
exports.sbyteValue = sbyteValue;
function byteValue(value, index) {
  var next = Utils.required(value, index, Lexer.DIGIT, 1, 3);
  if (next) {
    if (Lexer.DIGIT(value[next]))
      return;
    var val = parseInt(Utils.stringify(value, index, next), 10);
    if (val >= 0 && val <= 255)
      return Lexer.tokenize(value, index, next, 'Byte', TokenType.Literal);
  }
}
exports.byteValue = byteValue;
function int16Value(value, index) {
  var start = index;
  var sign = Lexer.SIGN(value, index);
  if (sign)
    index = sign;
  var next = Utils.required(value, index, Lexer.DIGIT, 1, 5);
  if (next) {
    if (Lexer.DIGIT(value[next]))
      return;
    var val = parseInt(Utils.stringify(value, start, next), 10);
    if (val >= -32768 && val <= 32767)
      return Lexer.tokenize(value, start, next, 'Int16', TokenType.Literal);
  }
}
exports.int16Value = int16Value;
function int32Value(value, index) {
  var start = index;
  var sign = Lexer.SIGN(value, index);
  if (sign)
    index = sign;
  var next = Utils.required(value, index, Lexer.DIGIT, 1, 10);
  if (next) {
    if (Lexer.DIGIT(value[next]))
      return;
    var val = parseInt(Utils.stringify(value, start, next), 10);
    if (val >= -2147483648 && val <= 2147483647)
      return Lexer.tokenize(value, start, next, 'Int32', TokenType.Literal);
  }
}
exports.int32Value = int32Value;
function int64Value(value, index) {
  var start = index;
  var sign = Lexer.SIGN(value, index);
  if (sign)
    index = sign;
  var next = Utils.required(value, index, Lexer.DIGIT, 1, 19);
  if (next) {
    if (Lexer.DIGIT(value[next]))
      return;
    var val = Utils.stringify(value, index, next);
    if (val >= '0' && val <= (value[start] == 0x2d ? '9223372036854775808' : '9223372036854775807'))
      return Lexer.tokenize(value, start, next, 'Int64', TokenType.Literal);
  }
}
exports.int64Value = int64Value;
function decimalValue(value, index) {
  var start = index;
  var sign = Lexer.SIGN(value, index);
  if (sign)
    index = sign;
  var intNext = Utils.required(value, index, Lexer.DIGIT, 1);
  if (!intNext)
    return;
  var end = intNext;
  if (value[intNext] == 0x2e) {
    end = Utils.required(value, intNext + 1, Lexer.DIGIT, 1);
    if (!end || end == intNext + 1)
      return;
  }
  else
    return;
  //TODO: detect only decimal value, no double/single detection here
  if (value[end] == 0x65)
    return;
  return Lexer.tokenize(value, start, end, 'Decimal', TokenType.Literal);
}
exports.decimalValue = decimalValue;
function doubleValue(value, index) {
  var start = index;
  var end = index;
  var nanInfLen = Lexer.nanInfinity(value, index);
  if (nanInfLen) {
    end += nanInfLen;
  }
  else {
    //TODO: use decimalValue function
    //var token = decimalValue(value, index);
    var sign = Lexer.SIGN(value, index);
    if (sign)
      index = sign;
    var intNext = Utils.required(value, index, Lexer.DIGIT, 1);
    if (!intNext)
      return;
    var decimalNext = intNext;
    if (value[intNext] == 0x2e) {
      decimalNext = Utils.required(value, intNext + 1, Lexer.DIGIT, 1);
      if (decimalNext == intNext + 1)
        return;
    }
    else
      return;
    if (value[decimalNext] == 0x65) {
      var next = decimalNext + 1;
      var sign = Lexer.SIGN(value, next);
      if (sign)
        next = sign;
      var digitNext = Utils.required(value, next, Lexer.DIGIT, 1);
      if (digitNext) {
        end = digitNext;
      }
    }
    else
      end = decimalNext;
  }
  return Lexer.tokenize(value, start, end, 'Double', TokenType.Literal);
}
exports.doubleValue = doubleValue;
function singleValue(value, index) {
  var token = doubleValue(value, index);
  if (token) {
    token.value = 'Single';
  }
  return token;
}
exports.singleValue = singleValue;
function stringValue(value, index) {
  var start = index;
  var squote = Lexer.SQUOTE(value, start);
  if (squote) {
    index = squote;
    while (index < value.length) {
      squote = Lexer.SQUOTE(value, index);
      if (squote) {
        index = squote;
        squote = Lexer.SQUOTE(value, index);
        if (!squote) {
          var close = Lexer.CLOSE(value, index);
          var comma = Lexer.COMMA(value, index);
          if (Lexer.pcharNoSQUOTE(value, index) > index && !close && !comma && Lexer.RWS(value, index) == index)
            return;
          break;
        }
        else {
          index = squote;
        }
      }
      else {
        var nextIndex = Math.max(Lexer.RWS(value, index), Lexer.pcharNoSQUOTE(value, index));
        if (nextIndex == index)
          return;
        index = nextIndex;
      }
    }
    squote = Lexer.SQUOTE(value, index - 1) || Lexer.SQUOTE(value, index - 3);
    if (!squote)
      return;
    index = squote;
    return Lexer.tokenize(value, start, index, 'String', TokenType.Literal);
  }
}
exports.stringValue = stringValue;
function binaryValue(value, index) {
  var start = index;
  if (!Utils.equals(value, index, 'binary'))
    return;
  index += 6;
  var squote = Lexer.SQUOTE(value, index);
  if (!squote)
    return;
  index = squote;
  var valStart = index;
  while (index < value.length && !(squote = Lexer.SQUOTE(value, index))) {
    var end = Math.max(Lexer.base64b16(value, index), Lexer.base64b8(value, index));
    if (end > index)
      index = end;
    else if (Lexer.base64char(value[index]) &&
      Lexer.base64char(value[index + 1]) &&
      Lexer.base64char(value[index + 2]) &&
      Lexer.base64char(value[index + 3]))
      index += 4;
    else
      index++;
  }
  index = squote;
  return Lexer.tokenize(value, start, index, 'Binary' /*new Edm.Binary(stringify(value, valStart, index - 1))*/, TokenType.Literal);
}
exports.binaryValue = binaryValue;
function primitiveLiteral(value, index) {
  return nullValue(value, index) ||
    booleanValue(value, index) ||
    guidValue(value, index) ||
    decimalValue(value, index) ||
    doubleValue(value, index) ||
    singleValue(value, index) ||
    sbyteValue(value, index) ||
    byteValue(value, index) ||
    int16Value(value, index) ||
    int32Value(value, index) ||
    int64Value(value, index) ||
    stringValue(value, index) ||
    binaryValue(value, index);
}
exports.primitiveLiteral = primitiveLiteral;
function odataIdentifier(value, index, tokenType) {
  var start = index;
  if (Lexer.identifierLeadingCharacter(value[index])) {
    index++;
    while (index < value.length && (index - start < 128) && Lexer.identifierCharacter(value[index])) {
      index++;
    }
  }
  if (index > start)
    return Lexer.tokenize(value, start, index, { name: Utils.stringify(value, start, index) }, tokenType || TokenType.ODataIdentifier);
}
exports.odataIdentifier = odataIdentifier;