"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utils = require("./utils");
var Lexer = require("./lexer");
var PrimitiveLiteral = require("./primitiveLiteral");
var NameOrIdentifier = require("./nameOrIdentifier");
var Expressions = require("./expressions");
function resourcePath(value, index, metadataContext) {
    if (value[index] === 0x2f)
        index++;
    var token = batch(value, index) ||
        entity(value, index, metadataContext) ||
        metadata(value, index);
    if (token)
        return token;
    var resource = NameOrIdentifier.entitySetName(value, index, metadataContext) ||
        functionImportCall(value, index, metadataContext) ||
        crossjoin(value, index) ||
        all(value, index) ||
        actionImportCall(value, index, metadataContext) ||
        NameOrIdentifier.singletonEntity(value, index);
    if (!resource)
        return;
    var start = index;
    index = resource.next;
    var navigation;
    switch (resource.type) {
        case Lexer.TokenType.EntitySetName:
            navigation = collectionNavigation(value, resource.next, resource.metadata);
            metadataContext = resource.metadata;
            delete resource.metadata;
            break;
        case Lexer.TokenType.EntityCollectionFunctionImportCall:
            navigation = collectionNavigation(value, resource.next, resource.value.import.metadata);
            metadataContext = resource.value.import.metadata;
            delete resource.value.import.metadata;
            break;
        case Lexer.TokenType.SingletonEntity:
            navigation = singleNavigation(value, resource.next, resource.metadata);
            metadataContext = resource.metadata;
            delete resource.metadata;
            break;
        case Lexer.TokenType.EntityFunctionImportCall:
            navigation = singleNavigation(value, resource.next, resource.value.import.metadata);
            metadataContext = resource.value.import.metadata;
            delete resource.value.import.metadata;
            break;
        case Lexer.TokenType.ComplexCollectionFunctionImportCall:
        case Lexer.TokenType.PrimitiveCollectionFunctionImportCall:
            navigation = collectionPath(value, resource.next, resource.value.import.metadata);
            metadataContext = resource.value.import.metadata;
            delete resource.value.import.metadata;
            break;
        case Lexer.TokenType.ComplexFunctionImportCall:
            navigation = complexPath(value, resource.next, resource.value.import.metadata);
            metadataContext = resource.value.import.metadata;
            delete resource.value.import.metadata;
            break;
        case Lexer.TokenType.PrimitiveFunctionImportCall:
            navigation = singlePath(value, resource.next, resource.value.import.metadata);
            metadataContext = resource.value.import.metadata;
            delete resource.value.import.metadata;
            break;
    }
    if (navigation)
        index = navigation.next;
    if (value[index] === 0x2f)
        index++;
    if (resource)
        return Lexer.tokenize(value, start, index, { resource: resource, navigation: navigation }, Lexer.TokenType.ResourcePath, navigation || { metadata: metadataContext });
}
exports.resourcePath = resourcePath;
function batch(value, index) {
    if (Utils.equals(value, index, "$batch"))
        return Lexer.tokenize(value, index, index + 6, "$batch", Lexer.TokenType.Batch);
}
exports.batch = batch;
function entity(value, index, metadataContext) {
    if (Utils.equals(value, index, "$entity")) {
        var start = index;
        index += 7;
        var name_1;
        if (value[index] === 0x2f) {
            name_1 = NameOrIdentifier.qualifiedEntityTypeName(value, index + 1, metadataContext);
            if (!name_1)
                return;
            index = name_1.next;
        }
        return Lexer.tokenize(value, start, index, name_1 || "$entity", Lexer.TokenType.Entity);
    }
}
exports.entity = entity;
function metadata(value, index) {
    if (Utils.equals(value, index, "$metadata"))
        return Lexer.tokenize(value, index, index + 9, "$metadata", Lexer.TokenType.Metadata);
}
exports.metadata = metadata;
function collectionNavigation(value, index, metadataContext) {
    var start = index;
    var name;
    if (value[index] === 0x2f) {
        name = NameOrIdentifier.qualifiedEntityTypeName(value, index + 1, metadataContext);
        if (name) {
            index = name.next;
            metadataContext = name.value.metadata;
            delete name.value.metadata;
        }
    }
    var path = collectionNavigationPath(value, index, metadataContext);
    if (path)
        index = path.next;
    if (!name && !path)
        return;
    return Lexer.tokenize(value, start, index, { name: name, path: path }, Lexer.TokenType.CollectionNavigation, path || name);
}
exports.collectionNavigation = collectionNavigation;
function collectionNavigationPath(value, index, metadataContext) {
    var start = index;
    var token = collectionPath(value, index, metadataContext) ||
        Expressions.refExpr(value, index);
    if (token)
        return token;
    var predicate = Expressions.keyPredicate(value, index, metadataContext);
    if (predicate) {
        var tokenValue = { predicate: predicate };
        index = predicate.next;
        var navigation = singleNavigation(value, index, metadataContext);
        if (navigation) {
            tokenValue = { predicate: predicate, navigation: navigation };
            index = navigation.next;
        }
        return Lexer.tokenize(value, start, index, tokenValue, Lexer.TokenType.CollectionNavigationPath, navigation || { metadata: metadataContext });
    }
}
exports.collectionNavigationPath = collectionNavigationPath;
function singleNavigation(value, index, metadataContext) {
    var token = boundOperation(value, index, false, metadataContext) ||
        Expressions.refExpr(value, index) ||
        Expressions.valueExpr(value, index);
    if (token)
        return token;
    var start = index;
    var name;
    if (value[index] === 0x2f) {
        name = NameOrIdentifier.qualifiedEntityTypeName(value, index + 1, metadataContext);
        if (name) {
            index = name.next;
            metadataContext = name.value.metadata;
            delete name.value.metadata;
        }
    }
    if (value[index] === 0x2f) {
        token = propertyPath(value, index + 1, metadataContext);
        if (token)
            index = token.next;
    }
    if (!name && !token)
        return;
    return Lexer.tokenize(value, start, index, { name: name, path: token }, Lexer.TokenType.SingleNavigation, token);
}
exports.singleNavigation = singleNavigation;
function propertyPath(value, index, metadataContext) {
    var token = NameOrIdentifier.entityColNavigationProperty(value, index, metadataContext) ||
        NameOrIdentifier.entityNavigationProperty(value, index, metadataContext) ||
        NameOrIdentifier.complexColProperty(value, index, metadataContext) ||
        NameOrIdentifier.complexProperty(value, index, metadataContext) ||
        NameOrIdentifier.primitiveColProperty(value, index, metadataContext) ||
        NameOrIdentifier.primitiveProperty(value, index, metadataContext) ||
        NameOrIdentifier.streamProperty(value, index, metadataContext);
    if (!token)
        return;
    var start = index;
    index = token.next;
    var navigation;
    switch (token.type) {
        case Lexer.TokenType.EntityCollectionNavigationProperty:
            navigation = collectionNavigation(value, index, token.metadata);
            delete token.metadata;
            break;
        case Lexer.TokenType.EntityNavigationProperty:
            navigation = singleNavigation(value, index, token.metadata);
            delete token.metadata;
            break;
        case Lexer.TokenType.ComplexCollectionProperty:
            navigation = collectionPath(value, index, token.metadata);
            delete token.metadata;
            break;
        case Lexer.TokenType.ComplexProperty:
            navigation = complexPath(value, index, token.metadata);
            delete token.metadata;
            break;
        case Lexer.TokenType.PrimitiveCollectionProperty:
            navigation = collectionPath(value, index, token.metadata);
            delete token.metadata;
            break;
        case Lexer.TokenType.PrimitiveKeyProperty:
        case Lexer.TokenType.PrimitiveProperty:
            navigation = singlePath(value, index, token.metadata);
            delete token.metadata;
            break;
        case Lexer.TokenType.StreamProperty:
            navigation = boundOperation(value, index, token.metadata);
            delete token.metadata;
            break;
    }
    if (navigation)
        index = navigation.next;
    return Lexer.tokenize(value, start, index, { path: token, navigation: navigation }, Lexer.TokenType.PropertyPath, navigation);
}
exports.propertyPath = propertyPath;
function collectionPath(value, index, metadataContext) {
    return Expressions.countExpr(value, index) ||
        boundOperation(value, index, true, metadataContext);
}
exports.collectionPath = collectionPath;
function singlePath(value, index, metadataContext) {
    return Expressions.valueExpr(value, index) ||
        boundOperation(value, index, false, metadataContext);
}
exports.singlePath = singlePath;
function complexPath(value, index, metadataContext) {
    var start = index;
    var name, token;
    if (value[index] === 0x2f) {
        name = NameOrIdentifier.qualifiedComplexTypeName(value, index + 1, metadataContext);
        if (name)
            index = name.next;
    }
    if (value[index] === 0x2f) {
        token = propertyPath(value, index + 1, metadataContext);
        if (!token)
            return;
        index = token.next;
    }
    else
        token = boundOperation(value, index, false, metadataContext);
    if (!name && !token)
        return;
    return Lexer.tokenize(value, start, index, { name: name, path: token }, Lexer.TokenType.ComplexPath, token);
}
exports.complexPath = complexPath;
function boundOperation(value, index, isCollection, metadataContext) {
    if (value[index] !== 0x2f)
        return;
    var start = index;
    index++;
    var operation = boundEntityColFuncCall(value, index, isCollection, metadataContext) ||
        boundEntityFuncCall(value, index, isCollection, metadataContext) ||
        boundComplexColFuncCall(value, index, isCollection, metadataContext) ||
        boundComplexFuncCall(value, index, isCollection, metadataContext) ||
        boundPrimitiveColFuncCall(value, index, isCollection, metadataContext) ||
        boundPrimitiveFuncCall(value, index, isCollection, metadataContext) ||
        boundActionCall(value, index, isCollection, metadataContext);
    if (!operation)
        return;
    index = operation.next;
    var name, navigation;
    switch (operation.type) {
        case Lexer.TokenType.BoundActionCall:
            break;
        case Lexer.TokenType.BoundEntityCollectionFunctionCall:
            navigation = collectionNavigation(value, index, operation.value.call.metadata);
            delete operation.metadata;
            break;
        case Lexer.TokenType.BoundEntityFunctionCall:
            navigation = singleNavigation(value, index, operation.value.call.metadata);
            delete operation.metadata;
            break;
        case Lexer.TokenType.BoundComplexCollectionFunctionCall:
            if (value[index] === 0x2f) {
                name = NameOrIdentifier.qualifiedComplexTypeName(value, index + 1, operation.value.call.metadata);
                if (name)
                    index = name.next;
            }
            navigation = collectionPath(value, index, operation.value.call.metadata);
            delete operation.metadata;
            break;
        case Lexer.TokenType.BoundComplexFunctionCall:
            navigation = complexPath(value, index, operation.value.call.metadata);
            delete operation.metadata;
            break;
        case Lexer.TokenType.BoundPrimitiveCollectionFunctionCall:
            navigation = collectionPath(value, index, operation.value.call.metadata);
            delete operation.metadata;
            break;
        case Lexer.TokenType.BoundPrimitiveFunctionCall:
            navigation = singlePath(value, index, operation.value.call.metadata);
            delete operation.metadata;
            break;
    }
    if (navigation)
        index = navigation.next;
    return Lexer.tokenize(value, start, index, { operation: operation, name: name, navigation: navigation }, Lexer.TokenType.BoundOperation, navigation);
}
exports.boundOperation = boundOperation;
function boundActionCall(value, index, isCollection, metadataContext) {
    var namespaceNext = NameOrIdentifier.namespace(value, index);
    if (namespaceNext === index)
        return;
    var start = index;
    index = namespaceNext;
    if (value[index] !== 0x2e)
        return;
    index++;
    var action = NameOrIdentifier.action(value, index, isCollection, metadataContext);
    if (!action)
        return;
    action.value.namespace = Utils.stringify(value, start, namespaceNext);
    return Lexer.tokenize(value, start, action.next, action, Lexer.TokenType.BoundActionCall, action);
}
exports.boundActionCall = boundActionCall;
function boundFunctionCall(value, index, odataFunction, tokenType, isCollection, metadataContext) {
    var namespaceNext = NameOrIdentifier.namespace(value, index);
    if (namespaceNext === index)
        return;
    var start = index;
    index = namespaceNext;
    if (value[index] !== 0x2e)
        return;
    index++;
    var call = odataFunction(value, index, isCollection, metadataContext);
    if (!call)
        return;
    call.value.namespace = Utils.stringify(value, start, namespaceNext);
    index = call.next;
    var params = functionParameters(value, index);
    if (!params)
        return;
    index = params.next;
    return Lexer.tokenize(value, start, index, { call: call, params: params }, tokenType, call);
}
function boundEntityFuncCall(value, index, isCollection, metadataContext) {
    return boundFunctionCall(value, index, NameOrIdentifier.entityFunction, Lexer.TokenType.BoundEntityFunctionCall, isCollection, metadataContext);
}
exports.boundEntityFuncCall = boundEntityFuncCall;
function boundEntityColFuncCall(value, index, isCollection, metadataContext) {
    return boundFunctionCall(value, index, NameOrIdentifier.entityColFunction, Lexer.TokenType.BoundEntityCollectionFunctionCall, isCollection, metadataContext);
}
exports.boundEntityColFuncCall = boundEntityColFuncCall;
function boundComplexFuncCall(value, index, isCollection, metadataContext) {
    return boundFunctionCall(value, index, NameOrIdentifier.complexFunction, Lexer.TokenType.BoundComplexFunctionCall, isCollection, metadataContext);
}
exports.boundComplexFuncCall = boundComplexFuncCall;
function boundComplexColFuncCall(value, index, isCollection, metadataContext) {
    return boundFunctionCall(value, index, NameOrIdentifier.complexColFunction, Lexer.TokenType.BoundComplexCollectionFunctionCall, isCollection, metadataContext);
}
exports.boundComplexColFuncCall = boundComplexColFuncCall;
function boundPrimitiveFuncCall(value, index, isCollection, metadataContext) {
    return boundFunctionCall(value, index, NameOrIdentifier.primitiveFunction, Lexer.TokenType.BoundPrimitiveFunctionCall, isCollection, metadataContext);
}
exports.boundPrimitiveFuncCall = boundPrimitiveFuncCall;
function boundPrimitiveColFuncCall(value, index, isCollection, metadataContext) {
    return boundFunctionCall(value, index, NameOrIdentifier.primitiveColFunction, Lexer.TokenType.BoundPrimitiveCollectionFunctionCall, isCollection, metadataContext);
}
exports.boundPrimitiveColFuncCall = boundPrimitiveColFuncCall;
function actionImportCall(value, index, metadataContext) {
    var action = NameOrIdentifier.actionImport(value, index, metadataContext);
    if (action)
        return Lexer.tokenize(value, index, action.next, action, Lexer.TokenType.ActionImportCall, action);
}
exports.actionImportCall = actionImportCall;
function functionImportCall(value, index, metadataContext) {
    var fnImport = NameOrIdentifier.entityFunctionImport(value, index, metadataContext) ||
        NameOrIdentifier.entityColFunctionImport(value, index, metadataContext) ||
        NameOrIdentifier.complexFunctionImport(value, index, metadataContext) ||
        NameOrIdentifier.complexColFunctionImport(value, index, metadataContext) ||
        NameOrIdentifier.primitiveFunctionImport(value, index, metadataContext) ||
        NameOrIdentifier.primitiveColFunctionImport(value, index, metadataContext);
    if (!fnImport)
        return;
    var start = index;
    index = fnImport.next;
    var params = functionParameters(value, index);
    if (!params)
        return;
    index = params.next;
    return Lexer.tokenize(value, start, index, { import: fnImport, params: params.value }, (fnImport.type + "Call"), fnImport);
}
exports.functionImportCall = functionImportCall;
function functionParameters(value, index, metadataContext) {
    var open = Lexer.OPEN(value, index);
    if (!open)
        return;
    var start = index;
    index = open;
    var params = [];
    var token = functionParameter(value, index);
    while (token) {
        params.push(token);
        index = token.next;
        var comma = Lexer.COMMA(value, index);
        if (comma) {
            index = comma;
            token = functionParameter(value, index);
            if (!token)
                return;
        }
        else
            break;
    }
    var close = Lexer.CLOSE(value, index);
    if (!close)
        return;
    index = close;
    return Lexer.tokenize(value, start, index, params, Lexer.TokenType.FunctionParameters);
}
exports.functionParameters = functionParameters;
function functionParameter(value, index, metadataContext) {
    var name = Expressions.parameterName(value, index);
    if (!name)
        return;
    var start = index;
    index = name.next;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
    var token = Expressions.parameterAlias(value, index) ||
        PrimitiveLiteral.primitiveLiteral(value, index);
    if (!token)
        return;
    index = token.next;
    return Lexer.tokenize(value, start, index, { name: name, value: token }, Lexer.TokenType.FunctionParameter);
}
exports.functionParameter = functionParameter;
function crossjoin(value, index, metadataContext) {
    if (!Utils.equals(value, index, "$crossjoin"))
        return;
    var start = index;
    index += 10;
    var open = Lexer.OPEN(value, index);
    if (!open)
        return;
    index = open;
    var names = [];
    var token = NameOrIdentifier.entitySetName(value, index, metadataContext);
    if (!token)
        return;
    while (token) {
        names.push(token);
        index = token.next;
        var comma = Lexer.COMMA(value, index);
        if (comma) {
            index = comma;
            token = NameOrIdentifier.entitySetName(value, index, metadataContext);
            if (!token)
                return;
        }
        else
            break;
    }
    var close = Lexer.CLOSE(value, index);
    if (!close)
        return;
    return Lexer.tokenize(value, start, index, { names: names }, Lexer.TokenType.Crossjoin);
}
exports.crossjoin = crossjoin;
function all(value, index) {
    if (Utils.equals(value, index, "$all"))
        return Lexer.tokenize(value, index, index + 4, "$all", Lexer.TokenType.AllResource);
}
exports.all = all;
//# sourceMappingURL=resourcePath.js.map