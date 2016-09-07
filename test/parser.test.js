var parser = require('../lib/parser');
var should = require('should');

describe('Operator test', function () {
	it('eq test', function (done) {
    var filter = "name eq 'Duck'";
		var result = parser.filter(filter);

		result.should.Object();
		result.should.have.property('type');
		result.should.have.value('type', 'EqualsExpression');
		result.value.should.have.properties(['left', 'right'])
		done();
	});

	it('ne test', function (done) {
    var filter = "price ne 1000";
		var result = parser.filter(filter);

		result.should.Object();
		result.should.have.property('type');
		result.should.have.value('type', 'NotEqualsExpression');
		result.value.should.have.properties(['left', 'right'])
		done();
	});

	it('lt test', function (done) {
    var filter = "age lt 10";
		var result = parser.filter(filter);

		result.should.Object();
		result.should.have.property('type');
		result.should.have.value('type', 'LesserThanExpression');
		result.value.should.have.properties(['left', 'right'])
		done();
	});

	it('le test', function (done) {
    var filter = "age le 10";
		var result = parser.filter(filter);

		result.should.Object();
		result.should.have.property('type');
		result.should.have.value('type', 'LesserOrEqualsExpression');
		result.value.should.have.properties(['left', 'right'])
		done();
	});

	it('gt test', function (done) {
    var filter = "age gt 10";
		var result = parser.filter(filter);

		result.should.Object();
		result.should.have.property('type');
		result.should.have.value('type', 'GreaterThanExpression');
		result.value.should.have.properties(['left', 'right'])
		done();
	});

	it('ge test', function (done) {
    var filter = "age ge 10";
		var result = parser.filter(filter);

		result.should.Object();
		result.should.have.property('type');
		result.should.have.value('type', 'GreaterOrEqualsExpression');
		result.value.should.have.properties(['left', 'right'])
		done();
	});

	it('not test', function (done) {
    var filter = "not endswith(name, 'cc')";
		var result = parser.filter(filter);

		result.should.Object();
		result.should.have.property('type');
		result.should.have.value('type', 'NotExpression');
		done();
	});
});

describe('String function call test', function () {
	it('contains test', function (done) {
    var filter = "contains(CompanyName,'Alfreds')";
		var result = parser.filter(filter);

		result.should.Object();
		result.should.have.property('type');
		result.should.have.value('type', 'MethodCallExpression');
		result.value.should.have.value('method', 'contains');
		done();
	});

	it('endswith test', function (done) {
    var filter = "endswith(CompanyName,'Alfreds')";
		var result = parser.filter(filter);

		result.should.Object();
		result.should.have.property('type');
		result.should.have.value('type', 'MethodCallExpression');
		result.value.should.have.value('method', 'endswith');
		done();
	});

	it('startswith test', function (done) {
    var filter = "startswith(CompanyName,'Alfreds')";
		var result = parser.filter(filter);

		result.should.Object();
		result.should.have.property('type');
		result.should.have.value('type', 'MethodCallExpression');
		result.value.should.have.value('method', 'startswith');
		done();
	});

	it('indexof test', function (done) {
    var filter = "indexof(CompanyName,'lfreds') eq 1";
		var result = parser.filter(filter);
  
		result.should.Object();
		result.should.have.property('type');
		result.should.have.value('type', 'EqualsExpression');
		result.value.left.should.have.value('type', 'MethodCallExpression');
		result.value.left.value.should.have.value('method', 'indexof');
		done();
	});

	it('length test', function (done) {
    var filter = "length(CompanyName) eq 19";
		var result = parser.filter(filter);
  
		result.should.Object();
		result.should.have.property('type');
		result.should.have.value('type', 'EqualsExpression');
		result.value.left.should.have.value('type', 'MethodCallExpression');
		result.value.left.value.should.have.value('method', 'length');
		done();
	});

	it('tolower test', function (done) {
    var filter = "tolower(CompanyName) eq 'alfreds futterkiste'";
		var result = parser.filter(filter);
  
		result.should.Object();
		result.should.have.property('type');
		result.should.have.value('type', 'EqualsExpression');
		result.value.left.should.have.value('type', 'MethodCallExpression');
		result.value.left.value.should.have.value('method', 'tolower');
		done();
	});

	it('toupper test', function (done) {
    var filter = "toupper(CompanyName) eq 'ALFREDS FUTTERKISTE'";
		var result = parser.filter(filter);
  
		result.should.Object();
		result.should.have.property('type');
		result.should.have.value('type', 'EqualsExpression');
		result.value.left.should.have.value('type', 'MethodCallExpression');
		result.value.left.value.should.have.value('method', 'toupper');
		done();
	});
});

describe('And test', function () {
	it('And test', function (done) {
    var filter = "name eq 'Duck' and age gt 10";
		var result = parser.filter(filter);

		result.should.Object();
		result.should.have.property('type');
		result.should.have.value('type', 'AndExpression');
		result.value.should.have.properties(['left', 'right'])
		done();
	});
});

describe('Or test', function () {
	it('Or test', function (done) {
    var filter = "name eq 'Duck' or age gt 10";
		var result = parser.filter(filter);

		result.should.Object();
		result.should.have.property('type');
		result.should.have.value('type', 'OrExpression');
		result.value.should.have.properties(['left', 'right'])
		done();
	});
});

describe('Group test', function () {
	it("One group test:(name eq 'Duck' or age gt 10)", function (done) {
    var filter = "(name eq 'Duck' or age gt 10)";
		var result = parser.filter(filter);

		result.should.Object();
		result.should.have.property('type');
		result.should.have.value('type', 'BoolParenExpression');
		done();
	});

	it("Left one group and OrExpression test:(name eq 'Duck' or age gt 10) or country eq 'USA'", function (done) {
    var filter = "(name eq 'Duck' or age gt 10) or country eq 'USA'";
		var result = parser.filter(filter);

		result.should.Object();
		result.should.have.property('type');
		result.should.have.value('type', 'OrExpression');
		result.value.left.should.have.value('type', 'BoolParenExpression');
		done();
	});

	it("Right one group and AndExpression test:name eq 'Duck' and (age gt 10 or country eq 'USA')", function (done) {
    var filter = "name eq 'Duck' and (age gt 10 or country eq 'USA')";
		var result = parser.filter(filter);

		result.should.Object();
		result.should.have.property('type');
		result.should.have.value('type', 'AndExpression');
		result.value.right.should.have.value('type', 'BoolParenExpression');
		done();
	});

  it("Two group and test:(name eq 'Duck') and (age gt 10 or country eq 'USA')", function (done) {
    var filter = "(name eq 'Duck') and (age gt 10 or country eq 'USA')";
		var result = parser.filter(filter);

		result.should.Object();
		result.should.have.property('type');
		result.should.have.value('type', 'AndExpression');
		result.value.left.should.have.value('type', 'BoolParenExpression');
		result.value.right.should.have.value('type', 'BoolParenExpression');
		done();
	});
});