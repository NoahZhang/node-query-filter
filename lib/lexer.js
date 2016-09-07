var Token = require('./token')
var Utils = require('./utils')

function tokenize(value, index, next, tokenValue, tokenType) {
  return new Token({
    position: index,
    next: next,
    value: tokenValue,
    type: tokenType,
    raw: Utils.stringify(value, index, next)
  });
}
exports.tokenize = tokenize;

function clone(token) {
  return new Token({
    position: token.position,
    next: token.next,
    value: token.value,
    type: token.type,
    raw: token.raw
  });
}
exports.clone = clone;

// core definitions
// Alphabet
function ALPHA(value) { return (value >= 0x41 && value <= 0x5a) || (value >= 0x61 && value <= 0x7a); }
exports.ALPHA = ALPHA;
function DIGIT(value) { return (value >= 0x30 && value <= 0x39); }
exports.DIGIT = DIGIT;
function HEXDIG(value) { return DIGIT(value) || AtoF(value); }
exports.HEXDIG = HEXDIG;
function AtoF(value) { return (value >= 0x41 && value <= 0x46) || (value >= 0x61 && value <= 0x66); }
exports.AtoF = AtoF;
// "
function DQUOTE(value) { return value == 0x22; }
exports.DQUOTE = DQUOTE;
// Space
function SP(value) { return value == 0x20; }
exports.SP = SP;
function HTAB(value) { return value == 0x09; }
exports.HTAB = HTAB;
function VCHAR(value) { return value >= 0x21 && value <= 0x7e; }
exports.VCHAR = VCHAR;
// punctuation
function whitespaceLength(value, index) {
  if (Utils.equals(value, index, '%20') || Utils.equals(value, index, '%09'))
    return 3;
  else if (SP(value[index]) || HTAB(value[index]) || value[index] == 0x20 || value[index] == 0x09)
    return 1;
}
function OWS(value, index) {
  index = index || 0;
  var inc = whitespaceLength(value, index);
  while (inc) {
    index += inc;
    inc = whitespaceLength(value, index);
  }
  return index;
}
exports.OWS = OWS;
function RWS(value, index) {
  return OWS(value, index);
}
exports.RWS = RWS;
function BWS(value, index) {
  return OWS(value, index);
}
exports.BWS = BWS;
// @
function AT(value, index) {
  if (value[index] == 0x40)
    return index + 1;
  else if (Utils.equals(value, index, '%40'))
    return index + 3;
}
exports.AT = AT;
// :
function COLON(value, index) {
  if (value[index] == 0x3a)
    return index + 1;
  else if (Utils.equals(value, index, '%3A'))
    return index + 3;
}
exports.COLON = COLON;
// ,
function COMMA(value, index) {
  if (value[index] == 0x2c)
    return index + 1;
  else if (Utils.equals(value, index, '%2C'))
    return index + 3;
}
exports.COMMA = COMMA;
// =
function EQ(value, index) {
  if (value[index] == 0x3d)
    return index + 1;
}
exports.EQ = EQ;
// +-
function SIGN(value, index) {
  if (value[index] == 0x2b || value[index] == 0x2d)
    return index + 1;
  else if (Utils.equals(value, index, '%2B'))
    return index + 3;
}
exports.SIGN = SIGN;
// ;
function SEMI(value, index) {
  if (value[index] == 0x3b)
    return index + 1;
  else if (Utils.equals(value, index, '%3B'))
    return index + 3;
}
exports.SEMI = SEMI;
// *
function STAR(value, index) {
  if (value[index] == 0x2a)
    return index + 1;
  else if (Utils.equals(value, index, '%2A'))
    return index + 3;
}
exports.STAR = STAR;
// '
function SQUOTE(value, index) {
  if (value[index] == 0x27)
    return index + 1;
  else if (Utils.equals(value, index, '%27'))
    return index + 3;
}
exports.SQUOTE = SQUOTE;
// (
function OPEN(value, index) {
  if (value[index] == 0x28)
    return index + 1;
  else if (Utils.equals(value, index, '%28'))
    return index + 3;
}
exports.OPEN = OPEN;
// )
function CLOSE(value, index) {
  if (value[index] == 0x29)
    return index + 1;
  else if (Utils.equals(value, index, '%29'))
    return index + 3;
}
exports.CLOSE = CLOSE;
// unreserved ALPHA / DIGIT / "-" / "." / "_" / "~"
function unreserved(value) { return ALPHA(value) || DIGIT(value) || value == 0x2d || value == 0x2e || value == 0x5f || value == 0x7e; }
exports.unreserved = unreserved;
// other-delims "!" /                   "(" / ")" / "*" / "+" / "," / ";"
function otherDelims(value, index) {
  if (value[index] == 0x21 || value[index] == 0x2b)
    return index + 1;
  else
    return OPEN(value, index) || CLOSE(value, index) || STAR(value, index) || COMMA(value, index) || SEMI(value, index);
}
exports.otherDelims = otherDelims;
// sub-delims     =       "$" / "&" / "'" /                                     "=" / other-delims
function subDelims(value, index) {
  if (value[index] == 0x24 || value[index] == 0x26)
    return index + 1;
  else
    return SQUOTE(value, index) || EQ(value, index) || otherDelims(value, index);
}
exports.subDelims = subDelims;
function pctEncoded(value, index) {
  if (value[index] != 0x25 || !HEXDIG(value[index + 1]) || !HEXDIG(value[index + 2]))
    return index;
  return index + 3;
}
exports.pctEncoded = pctEncoded;
// pct-encoded-no-SQUOTE = "%" ( "0" / "1" /   "3" / "4" / "5" / "6" / "8" / "9" / A-to-F ) HEXDIG
//                       / "%" "2" ( "0" / "1" / "2" / "3" / "4" / "5" / "6" /   "8" / "9" / A-to-F )
function pctEncodedNoSQUOTE(value, index) {
  if (Utils.equals(value, index, '%27'))
    return index;
  return pctEncoded(value, index);
}
exports.pctEncodedNoSQUOTE = pctEncodedNoSQUOTE;
function pctEncodedUnescaped(value, index) {
  if (Utils.equals(value, index, '%22') ||
    Utils.equals(value, index, '%3') ||
    Utils.equals(value, index, '%4') ||
    Utils.equals(value, index, '%5C'))
    return index;
  return pctEncoded(value, index);
}
exports.pctEncodedUnescaped = pctEncodedUnescaped;
function pchar(value, index) {
  if (unreserved(value[index]))
    return index + 1;
  else
    return subDelims(value, index) || COLON(value, index) || AT(value, index) || pctEncoded(value, index) || index;
}
exports.pchar = pchar;
function pcharNoSQUOTE(value, index) {
  if (unreserved(value[index]) || value[index] == 0x24 || value[index] == 0x26)
    return index + 1;
  else
    return otherDelims(value, index) || EQ(value, index) || COLON(value, index) || AT(value, index) || pctEncodedNoSQUOTE(value, index) || index;
}
exports.pcharNoSQUOTE = pcharNoSQUOTE;
function qcharNoAMP(value, index) {
  if (unreserved(value[index]) || value[index] == 0x3a || value[index] == 0x40 || value[index] == 0x2f || value[index] == 0x3f || value[index] == 0x24 || value[index] == 0x27 || value[index] == 0x3d)
    return index + 1;
  else
    return pctEncoded(value, index) || otherDelims(value, index) || index;
}
exports.qcharNoAMP = qcharNoAMP;
function qcharNoAMPDQUOTE(value, index) {
  if (unreserved(value[index]) || value[index] == 0x3a || value[index] == 0x40 || value[index] == 0x2f || value[index] == 0x3f || value[index] == 0x24 || value[index] == 0x27 || value[index] == 0x3d)
    return index + 1;
  else
    return otherDelims(value, index) || pctEncodedUnescaped(value, index);
}
exports.qcharNoAMPDQUOTE = qcharNoAMPDQUOTE;
//export function pchar(value:number):boolean { return unreserved(value) || otherDelims(value) || value == 0x24 || value == 0x26 || EQ(value) || COLON(value) || AT(value); }
function base64char(value) { return ALPHA(value) || DIGIT(value) || value == 0x2d || value == 0x5f; }
exports.base64char = base64char;
function base64b16(value, index) {
  var start = index;
  if (!base64char(value[index]) && !base64char(value[index + 1]))
    return start;
  index += 2;
  if (!Utils.is(value[index], 'AEIMQUYcgkosw048'))
    return start;
  index++;
  if (value[index] == 0x3d)
    index++;
  return index;
}
exports.base64b16 = base64b16;
function base64b8(value, index) {
  var start = index;
  if (!base64char(value[index]))
    return start;
  index++;
  if (value[index] != 0x41 || value[index] != 0x51 || value[index] != 0x67 || value[index] != 0x77)
    return start;
  index++;
  if (value[index] == 0x3d && value[index + 1] == 0x3d)
    index += 2;
  return index;
}
exports.base64b8 = base64b8;
function nanInfinity(value, index) {
  return Utils.equals(value, index, 'NaN') || Utils.equals(value, index, '-INF') || Utils.equals(value, index, 'INF');
}
exports.nanInfinity = nanInfinity;
function oneToNine(value) { return value != 0x30 && DIGIT(value); }
exports.oneToNine = oneToNine;
function zeroToFiftyNine(value, index) {
  if (value[index] >= 0x30 && value[index] <= 0x35 && DIGIT(value[index + 1]))
    return index + 2;
  return index;
}
exports.zeroToFiftyNine = zeroToFiftyNine;;
function identifierLeadingCharacter(value) {
  return ALPHA(value) || value == 0x5f;
}
exports.identifierLeadingCharacter = identifierLeadingCharacter;
function identifierCharacter(value) {
  return identifierLeadingCharacter(value) || DIGIT(value);
}
exports.identifierCharacter = identifierCharacter;
function quotationMark(value, index) {
  if (DQUOTE(value[index]))
    return index + 1;
  if (Utils.equals(value, index, '%22'))
    return index + 3;
  return index;
}
exports.quotationMark = quotationMark;
function escape(value, index) {
  if (Utils.equals(value, index, '\\'))
    return index + 1;
  if (Utils.equals(value, index, '%5C'))
    return index + 3;
  return index;
}
exports.escape = escape;