var Token = (function () {
  function Token(token) {
    this.position = token.position;
    this.next = token.next;
    this.value = token.value;
    this.type = token.type;
    this.raw = token.raw;
  }
  return Token;
} ());

module.exports = Token