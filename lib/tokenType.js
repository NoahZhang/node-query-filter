var TokenType = (function () {
	function TokenType() {
	}

	TokenType.AndExpression = 'AndExpression';
	TokenType.OrExpression = 'OrExpression';
	TokenType.EqualsExpression = 'EqualsExpression';
	TokenType.NotEqualsExpression = 'NotEqualsExpression';
	TokenType.LesserThanExpression = 'LesserThanExpression';
	TokenType.LesserOrEqualsExpression = 'LesserOrEqualsExpression';
	TokenType.GreaterThanExpression = 'GreaterThanExpression';
	TokenType.GreaterOrEqualsExpression = 'GreaterOrEqualsExpression';
	TokenType.NotExpression = 'NotExpression';
	TokenType.MethodCallExpression = 'MethodCallExpression';
	TokenType.ParameterExpression = 'ParameterExpression';
	TokenType.PropertyPathExpression = 'PropertyPathExpression';
	TokenType.ODataIdentifier = 'ODataIdentifier';
	TokenType.Literal = 'Literal';
	TokenType.BoolParenExpression = 'BoolParenExpression';
  return TokenType;
} ());

module.exports = TokenType