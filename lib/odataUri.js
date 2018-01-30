"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Lexer = require("./lexer");
var Query = require("./query");
var ResourcePath = require("./resourcePath");
function odataUri(value, index, metadataContext) {
    var resource = ResourcePath.resourcePath(value, index, metadataContext);
    while (!resource && index < value.length) {
        while (value[++index] !== 0x2f && index < value.length)
            ;
        resource = ResourcePath.resourcePath(value, index, metadataContext);
    }
    if (!resource)
        return;
    var start = index;
    index = resource.next;
    metadataContext = resource.metadata;
    var query;
    if (value[index] === 0x3f) {
        query = Query.queryOptions(value, index + 1, metadataContext);
        if (!query)
            return;
        index = query.next;
        delete resource.metadata;
    }
    return Lexer.tokenize(value, start, index, { resource: resource, query: query }, Lexer.TokenType.ODataUri, { metadata: metadataContext });
}
exports.odataUri = odataUri;
//# sourceMappingURL=odataUri.js.map