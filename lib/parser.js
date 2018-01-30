"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var PrimitiveLiteral = require("./primitiveLiteral");
var Expressions = require("./expressions");
var Query = require("./query");
var ResourcePath = require("./resourcePath");
var ODataUri = require("./odataUri");
var parserFactory = function (fn) {
    return function (source, options) {
        options = options || {};
        var raw = new Uint16Array(source.length);
        var pos = 0;
        for (var i = 0; i < source.length; i++) {
            raw[i] = source.charCodeAt(i);
        }
        var result = fn(raw, pos, options.metadata);
        if (!result)
            throw new Error("Fail at " + pos);
        if (result.next < raw.length)
            throw new Error("Unexpected character at " + result.next);
        return result;
    };
};
var Parser = /** @class */ (function () {
    function Parser() {
    }
    Parser.prototype.odataUri = function (source, options) { return parserFactory(ODataUri.odataUri)(source, options); };
    Parser.prototype.resourcePath = function (source, options) { return parserFactory(ResourcePath.resourcePath)(source, options); };
    Parser.prototype.query = function (source, options) { return parserFactory(Query.queryOptions)(source, options); };
    Parser.prototype.filter = function (source, options) { return parserFactory(Expressions.boolCommonExpr)(source, options); };
    Parser.prototype.keys = function (source, options) { return parserFactory(Expressions.keyPredicate)(source, options); };
    Parser.prototype.literal = function (source, options) { return parserFactory(PrimitiveLiteral.primitiveLiteral)(source, options); };
    return Parser;
}());
exports.Parser = Parser;
function odataUri(source, options) { return parserFactory(ODataUri.odataUri)(source, options); }
exports.odataUri = odataUri;
function resourcePath(source, options) { return parserFactory(ResourcePath.resourcePath)(source, options); }
exports.resourcePath = resourcePath;
function query(source, options) { return parserFactory(Query.queryOptions)(source, options); }
exports.query = query;
function filter(source, options) { return parserFactory(Expressions.boolCommonExpr)(source, options); }
exports.filter = filter;
function keys(source, options) { return parserFactory(Expressions.keyPredicate)(source, options); }
exports.keys = keys;
function literal(source, options) { return parserFactory(PrimitiveLiteral.primitiveLiteral)(source, options); }
exports.literal = literal;
//# sourceMappingURL=parser.js.map