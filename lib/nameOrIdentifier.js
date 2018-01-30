"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utils = require("./utils");
var Lexer = require("./lexer");
var PrimitiveLiteral = require("./primitiveLiteral");
function enumeration(value, index) {
    var type = qualifiedEnumTypeName(value, index);
    if (!type)
        return;
    var start = index;
    index = type.next;
    var squote = Lexer.SQUOTE(value, index);
    if (!squote)
        return;
    index = squote;
    var enumVal = enumValue(value, index);
    if (!enumVal)
        return;
    index = enumVal.next;
    squote = Lexer.SQUOTE(value, index);
    if (!squote)
        return;
    index = squote;
    return Lexer.tokenize(value, start, index, {
        name: type,
        value: enumVal
    }, Lexer.TokenType.Enum);
}
exports.enumeration = enumeration;
function enumValue(value, index) {
    var val = singleEnumValue(value, index);
    if (!val)
        return;
    var start = index;
    var arr = [];
    while (val) {
        arr.push(val);
        index = val.next;
        var comma = Lexer.COMMA(value, val.next);
        if (comma) {
            index = comma;
            val = singleEnumValue(value, index);
        }
        else
            break;
    }
    return Lexer.tokenize(value, start, index, { values: arr }, Lexer.TokenType.EnumValue);
}
exports.enumValue = enumValue;
function singleEnumValue(value, index) {
    return enumerationMember(value, index) ||
        enumMemberValue(value, index);
}
exports.singleEnumValue = singleEnumValue;
function enumMemberValue(value, index) {
    var token = PrimitiveLiteral.int64Value(value, index);
    if (token) {
        token.type = Lexer.TokenType.EnumMemberValue;
        return token;
    }
}
exports.enumMemberValue = enumMemberValue;
function singleQualifiedTypeName(value, index) {
    return qualifiedEntityTypeName(value, index) ||
        qualifiedComplexTypeName(value, index) ||
        qualifiedTypeDefinitionName(value, index) ||
        qualifiedEnumTypeName(value, index) ||
        primitiveTypeName(value, index);
}
exports.singleQualifiedTypeName = singleQualifiedTypeName;
function qualifiedTypeName(value, index) {
    if (Utils.equals(value, index, "Collection")) {
        var start = index;
        index += 10;
        var squote = Lexer.SQUOTE(value, index);
        if (!squote)
            return;
        index = squote;
        var token = singleQualifiedTypeName(value, index);
        if (!token)
            return;
        else
            index = token.next;
        squote = Lexer.SQUOTE(value, index);
        if (!squote)
            return;
        index = squote;
        token.position = start;
        token.next = index;
        token.raw = Utils.stringify(value, token.position, token.next);
        token.type = Lexer.TokenType.Collection;
    }
    else
        return singleQualifiedTypeName(value, index);
}
exports.qualifiedTypeName = qualifiedTypeName;
function qualifiedEntityTypeName(value, index, metadataContext) {
    var start = index;
    var namespaceNext = namespace(value, index);
    if (namespaceNext === index || value[namespaceNext] !== 0x2e)
        return;
    var schema;
    if (typeof metadataContext === "object") {
        schema = getMetadataRoot(metadataContext).schemas.filter(function (it) { return it.namespace === Utils.stringify(value, start, namespaceNext); })[0];
    }
    var name = entityTypeName(value, namespaceNext + 1, schema);
    if (!name)
        return;
    name.value.namespace = Utils.stringify(value, start, namespaceNext);
    return Lexer.tokenize(value, start, name.next, name, Lexer.TokenType.QualifiedEntityTypeName);
}
exports.qualifiedEntityTypeName = qualifiedEntityTypeName;
function qualifiedComplexTypeName(value, index, metadataContext) {
    var start = index;
    var namespaceNext = namespace(value, index);
    if (namespaceNext === index || value[namespaceNext] !== 0x2e)
        return;
    var schema;
    if (typeof metadataContext === "object") {
        schema = getMetadataRoot(metadataContext).schemas.filter(function (it) { return it.namespace === Utils.stringify(value, start, namespaceNext); })[0];
    }
    var name = complexTypeName(value, namespaceNext + 1, schema);
    if (!name)
        return;
    name.value.namespace = Utils.stringify(value, start, namespaceNext);
    return Lexer.tokenize(value, start, name.next, name, Lexer.TokenType.QualifiedComplexTypeName);
}
exports.qualifiedComplexTypeName = qualifiedComplexTypeName;
function qualifiedTypeDefinitionName(value, index) {
    var start = index;
    var namespaceNext = namespace(value, index);
    if (namespaceNext === index || value[namespaceNext] !== 0x2e)
        return;
    var nameNext = typeDefinitionName(value, namespaceNext + 1);
    if (nameNext && nameNext.next === namespaceNext + 1)
        return;
    return Lexer.tokenize(value, start, nameNext.next, "TypeDefinitionName", Lexer.TokenType.Identifier);
}
exports.qualifiedTypeDefinitionName = qualifiedTypeDefinitionName;
function qualifiedEnumTypeName(value, index) {
    var start = index;
    var namespaceNext = namespace(value, index);
    if (namespaceNext === index || value[namespaceNext] !== 0x2e)
        return;
    var nameNext = enumerationTypeName(value, namespaceNext + 1);
    if (nameNext && nameNext.next === namespaceNext + 1)
        return;
    return Lexer.tokenize(value, start, nameNext.next, "EnumTypeName", Lexer.TokenType.Identifier);
}
exports.qualifiedEnumTypeName = qualifiedEnumTypeName;
function namespace(value, index) {
    var part = namespacePart(value, index);
    while (part && part.next > index) {
        index = part.next;
        if (value[part.next] === 0x2e) {
            index++;
            part = namespacePart(value, index);
            if (part && value[part.next] !== 0x2e)
                return index - 1;
        }
    }
    return index - 1;
}
exports.namespace = namespace;
function odataIdentifier(value, index, tokenType) {
    var start = index;
    if (Lexer.identifierLeadingCharacter(value[index])) {
        index++;
        while (index < value.length && (index - start < 128) && Lexer.identifierCharacter(value[index])) {
            index++;
        }
    }
    if (index > start)
        return Lexer.tokenize(value, start, index, { name: Utils.stringify(value, start, index) }, tokenType || Lexer.TokenType.ODataIdentifier);
}
exports.odataIdentifier = odataIdentifier;
function namespacePart(value, index) { return odataIdentifier(value, index, Lexer.TokenType.NamespacePart); }
exports.namespacePart = namespacePart;
function entitySetName(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.EntitySetName);
    if (!token)
        return;
    if (typeof metadataContext === "object") {
        var entitySet_1;
        metadataContext.dataServices.schemas.forEach(function (schema) { return schema.entityContainer.forEach(function (container) { return container.entitySets.filter(function (set) {
            var eq = set.name === token.raw;
            if (eq)
                entitySet_1 = set;
            return eq;
        }); }); });
        if (!entitySet_1)
            return;
        var entityType_1;
        metadataContext.dataServices.schemas.forEach(function (schema) { return entitySet_1.entityType.indexOf(schema.namespace + ".") === 0 && schema.entityTypes.filter(function (type) {
            var eq = type.name === entitySet_1.entityType.replace(schema.namespace + ".", "");
            if (eq)
                entityType_1 = type;
            return eq;
        }); });
        if (!entityType_1)
            return;
        token.metadata = entityType_1;
    }
    return token;
}
exports.entitySetName = entitySetName;
function singletonEntity(value, index) { return odataIdentifier(value, index, Lexer.TokenType.SingletonEntity); }
exports.singletonEntity = singletonEntity;
function entityTypeName(value, index, schema) {
    var token = odataIdentifier(value, index, Lexer.TokenType.EntityTypeName);
    if (!token)
        return;
    if (typeof schema === "object") {
        var type = schema.entityTypes.filter(function (it) { return it.name === token.raw; })[0];
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.entityTypeName = entityTypeName;
function complexTypeName(value, index, schema) {
    var token = odataIdentifier(value, index, Lexer.TokenType.ComplexTypeName);
    if (!token)
        return;
    if (typeof schema === "object") {
        var type = schema.complexTypes.filter(function (it) { return it.name === token.raw; })[0];
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.complexTypeName = complexTypeName;
function typeDefinitionName(value, index) { return odataIdentifier(value, index, Lexer.TokenType.TypeDefinitionName); }
exports.typeDefinitionName = typeDefinitionName;
function enumerationTypeName(value, index) { return odataIdentifier(value, index, Lexer.TokenType.EnumerationTypeName); }
exports.enumerationTypeName = enumerationTypeName;
function enumerationMember(value, index) { return odataIdentifier(value, index, Lexer.TokenType.EnumerationMember); }
exports.enumerationMember = enumerationMember;
function termName(value, index) { return odataIdentifier(value, index, Lexer.TokenType.TermName); }
exports.termName = termName;
function primitiveTypeName(value, index) {
    if (!Utils.equals(value, index, "Edm."))
        return;
    var start = index;
    index += 4;
    var end = index + (Utils.equals(value, index, "Binary") ||
        Utils.equals(value, index, "Boolean") ||
        Utils.equals(value, index, "Byte") ||
        Utils.equals(value, index, "Date") ||
        Utils.equals(value, index, "DateTimeOffset") ||
        Utils.equals(value, index, "Decimal") ||
        Utils.equals(value, index, "Double") ||
        Utils.equals(value, index, "Duration") ||
        Utils.equals(value, index, "Guid") ||
        Utils.equals(value, index, "Int16") ||
        Utils.equals(value, index, "Int32") ||
        Utils.equals(value, index, "Int64") ||
        Utils.equals(value, index, "SByte") ||
        Utils.equals(value, index, "Single") ||
        Utils.equals(value, index, "Stream") ||
        Utils.equals(value, index, "String") ||
        Utils.equals(value, index, "TimeOfDay") ||
        Utils.equals(value, index, "GeographyCollection") ||
        Utils.equals(value, index, "GeographyLineString") ||
        Utils.equals(value, index, "GeographyMultiLineString") ||
        Utils.equals(value, index, "GeographyMultiPoint") ||
        Utils.equals(value, index, "GeographyMultiPolygon") ||
        Utils.equals(value, index, "GeographyPoint") ||
        Utils.equals(value, index, "GeographyPolygon") ||
        Utils.equals(value, index, "GeometryCollection") ||
        Utils.equals(value, index, "GeometryLineString") ||
        Utils.equals(value, index, "GeometryMultiLineString") ||
        Utils.equals(value, index, "GeometryMultiPoint") ||
        Utils.equals(value, index, "GeometryMultiPolygon") ||
        Utils.equals(value, index, "GeometryPoint") ||
        Utils.equals(value, index, "GeometryPolygon"));
    if (end > index)
        return Lexer.tokenize(value, start, end, "PrimitiveTypeName", Lexer.TokenType.Identifier);
}
exports.primitiveTypeName = primitiveTypeName;
var primitiveTypes = [
    "Edm.Binary", "Edm.Boolean", "Edm.Byte", "Edm.Date", "Edm.DateTimeOffset", "Edm.Decimal", "Edm.Double", "Edm.Duration", "Edm.Guid",
    "Edm.Int16", "Edm.Int32", "Edm.Int64", "Edm.SByte", "Edm.Single", "Edm.Stream", "Edm.String", "Edm.TimeOfDay",
    "Edm.GeographyCollection", "Edm.GeographyLineString", "Edm.GeographyMultiLineString", "Edm.GeographyMultiPoint", "Edm.GeographyMultiPolygon", "Edm.GeographyPoint", "Edm.GeographyPolygon",
    "Edm.GeometryCollection", "Edm.GeometryLineString", "Edm.GeometryMultiLineString", "Edm.GeometryMultiPoint", "Edm.GeometryMultiPolygon", "Edm.GeometryPoint", "Edm.GeometryPolygon"
];
function isPrimitiveTypeName(type, metadataContext) {
    var root = getMetadataRoot(metadataContext);
    var schemas = root.schemas || (root.dataServices && root.dataServices.schemas) || [];
    var schema = schemas.filter(function (it) { return type.indexOf(it.namespace + ".") === 0; })[0];
    if (schema) {
        return ((schema.enumTypes && schema.enumTypes.filter(function (it) { return it.name === type.split(".").pop(); })[0]) ||
            (schema.typeDefinitions && schema.typeDefinitions.filter(function (it) { return it.name === type.split(".").pop(); })[0])) &&
            !((schema.entityTypes && schema.entityTypes.filter(function (it) { return it.name === type.split(".").pop(); })[0]) ||
                (schema.complexTypes && schema.complexTypes.filter(function (it) { return it.name === type.split(".").pop(); })[0]));
    }
    return primitiveTypes.indexOf(type) >= 0;
}
function getMetadataRoot(metadataContext) {
    var root = metadataContext;
    while (root.parent) {
        root = root.parent;
    }
    return root.dataServices || root;
}
function primitiveProperty(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.PrimitiveProperty);
    if (!token)
        return;
    if (typeof metadataContext === "object") {
        var _loop_1 = function (i) {
            var prop = metadataContext.properties[i];
            if (prop.name === token.raw) {
                if (prop.type.indexOf("Collection") === 0 || !isPrimitiveTypeName(prop.type, metadataContext))
                    return { value: void 0 };
                token.metadata = prop;
                if (metadataContext.key && metadataContext.key.propertyRefs.filter(function (it) { return it.name === prop.name; }).length > 0) {
                    token.type = Lexer.TokenType.PrimitiveKeyProperty;
                }
                return "break";
            }
        };
        for (var i = 0; i < metadataContext.properties.length; i++) {
            var state_1 = _loop_1(i);
            if (typeof state_1 === "object")
                return state_1.value;
            if (state_1 === "break")
                break;
        }
        if (!token.metadata)
            return;
    }
    return token;
}
exports.primitiveProperty = primitiveProperty;
function primitiveKeyProperty(value, index, metadataContext) {
    var token = primitiveProperty(value, index, metadataContext);
    if (token && token.type === Lexer.TokenType.PrimitiveKeyProperty)
        return token;
}
exports.primitiveKeyProperty = primitiveKeyProperty;
function primitiveNonKeyProperty(value, index, metadataContext) {
    var token = primitiveProperty(value, index, metadataContext);
    if (token && token.type === Lexer.TokenType.PrimitiveProperty)
        return token;
}
exports.primitiveNonKeyProperty = primitiveNonKeyProperty;
function primitiveColProperty(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.PrimitiveCollectionProperty);
    if (!token)
        return;
    if (typeof metadataContext === "object") {
        var _loop_2 = function (i) {
            var prop = metadataContext.properties[i];
            if (prop.name === token.raw) {
                if (prop.type.indexOf("Collection") === -1 || !isPrimitiveTypeName(prop.type.slice(11, -1), metadataContext))
                    return { value: void 0 };
                token.metadata = prop;
                if (metadataContext.key.propertyRefs.filter(function (it) { return it.name === prop.name; }).length > 0) {
                    token.type = Lexer.TokenType.PrimitiveKeyProperty;
                }
                return "break";
            }
        };
        for (var i = 0; i < metadataContext.properties.length; i++) {
            var state_2 = _loop_2(i);
            if (typeof state_2 === "object")
                return state_2.value;
            if (state_2 === "break")
                break;
        }
        if (!token.metadata)
            return;
    }
    return token;
}
exports.primitiveColProperty = primitiveColProperty;
function complexProperty(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.ComplexProperty);
    if (!token)
        return;
    if (typeof metadataContext === "object") {
        var _loop_3 = function (i) {
            var prop = metadataContext.properties[i];
            if (prop.name === token.raw) {
                if (prop.type.indexOf("Collection") === 0 || isPrimitiveTypeName(prop.type, metadataContext))
                    return { value: void 0 };
                var root = getMetadataRoot(metadataContext);
                var schema = root.schemas.filter(function (it) { return prop.type.indexOf(it.namespace + ".") === 0; })[0];
                if (!schema)
                    return { value: void 0 };
                var complexType = schema.complexTypes.filter(function (it) { return it.name === prop.type.split(".").pop(); })[0];
                if (!complexType)
                    return { value: void 0 };
                token.metadata = complexType;
                return "break";
            }
        };
        for (var i = 0; i < metadataContext.properties.length; i++) {
            var state_3 = _loop_3(i);
            if (typeof state_3 === "object")
                return state_3.value;
            if (state_3 === "break")
                break;
        }
        if (!token.metadata)
            return;
    }
    return token;
}
exports.complexProperty = complexProperty;
function complexColProperty(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.ComplexCollectionProperty);
    if (!token)
        return;
    if (typeof metadataContext === "object") {
        var _loop_4 = function (i) {
            var prop = metadataContext.properties[i];
            if (prop.name === token.raw) {
                if (prop.type.indexOf("Collection") === -1 || isPrimitiveTypeName(prop.type.slice(11, -1), metadataContext))
                    return { value: void 0 };
                var root = getMetadataRoot(metadataContext);
                var schema = root.schemas.filter(function (it) { return prop.type.slice(11, -1).indexOf(it.namespace + ".") === 0; })[0];
                if (!schema)
                    return { value: void 0 };
                var complexType = schema.complexTypes.filter(function (it) { return it.name === prop.type.slice(11, -1).split(".").pop(); })[0];
                if (!complexType)
                    return { value: void 0 };
                token.metadata = complexType;
                return "break";
            }
        };
        for (var i = 0; i < metadataContext.properties.length; i++) {
            var state_4 = _loop_4(i);
            if (typeof state_4 === "object")
                return state_4.value;
            if (state_4 === "break")
                break;
        }
        if (!token.metadata)
            return;
    }
    return token;
}
exports.complexColProperty = complexColProperty;
function streamProperty(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.StreamProperty);
    if (!token)
        return;
    if (typeof metadataContext === "object") {
        for (var i = 0; i < metadataContext.properties.length; i++) {
            var prop = metadataContext.properties[i];
            if (prop.name === token.raw) {
                if (prop.type !== "Edm.Stream")
                    return;
                token.metadata = prop;
                break;
            }
        }
        if (!token.metadata)
            return;
    }
    return token;
}
exports.streamProperty = streamProperty;
function navigationProperty(value, index, metadataContext) {
    return entityNavigationProperty(value, index, metadataContext) ||
        entityColNavigationProperty(value, index, metadataContext);
}
exports.navigationProperty = navigationProperty;
function entityNavigationProperty(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.EntityNavigationProperty);
    if (!token)
        return;
    if (typeof metadataContext === "object") {
        var _loop_5 = function (i) {
            var prop = metadataContext.navigationProperties[i];
            if (prop.name === token.raw && prop.type.indexOf("Collection") === -1 && !isPrimitiveTypeName(prop.type.slice(11, -1), metadataContext)) {
                var root = getMetadataRoot(metadataContext);
                var schema = root.schemas.filter(function (it) { return prop.type.indexOf(it.namespace + ".") === 0; })[0];
                if (!schema)
                    return { value: void 0 };
                var entityType = schema.entityTypes.filter(function (it) { return it.name === prop.type.split(".").pop(); })[0];
                if (!entityType)
                    return { value: void 0 };
                token.metadata = entityType;
            }
        };
        for (var i = 0; i < metadataContext.navigationProperties.length; i++) {
            var state_5 = _loop_5(i);
            if (typeof state_5 === "object")
                return state_5.value;
        }
        if (!token.metadata)
            return;
    }
    return token;
}
exports.entityNavigationProperty = entityNavigationProperty;
function entityColNavigationProperty(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.EntityCollectionNavigationProperty);
    if (!token)
        return;
    if (typeof metadataContext === "object") {
        var _loop_6 = function (i) {
            var prop = metadataContext.navigationProperties[i];
            if (prop.name === token.raw && prop.type.indexOf("Collection") === 0 && !isPrimitiveTypeName(prop.type.slice(11, -1), metadataContext)) {
                var root = getMetadataRoot(metadataContext);
                var schema = root.schemas.filter(function (it) { return prop.type.slice(11, -1).indexOf(it.namespace + ".") === 0; })[0];
                if (!schema)
                    return { value: void 0 };
                var entityType = schema.entityTypes.filter(function (it) { return it.name === prop.type.slice(11, -1).split(".").pop(); })[0];
                if (!entityType)
                    return { value: void 0 };
                token.metadata = entityType;
            }
        };
        for (var i = 0; i < metadataContext.navigationProperties.length; i++) {
            var state_6 = _loop_6(i);
            if (typeof state_6 === "object")
                return state_6.value;
        }
        if (!token.metadata)
            return;
    }
    return token;
}
exports.entityColNavigationProperty = entityColNavigationProperty;
function action(value, index, isCollection, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.Action);
    if (!token)
        return;
    if (typeof metadataContext === "object") {
        var type = getOperationType("action", metadataContext, token, isCollection, false, false, "entityTypes");
        if (!type)
            return;
    }
    return token;
}
exports.action = action;
function actionImport(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.ActionImport);
    if (!token)
        return;
    if (typeof metadataContext === "object") {
        var type = getOperationImportType("action", metadataContext, token);
        if (!type)
            return;
    }
    return token;
}
exports.actionImport = actionImport;
function odataFunction(value, index) {
    return entityFunction(value, index) ||
        entityColFunction(value, index) ||
        complexFunction(value, index) ||
        complexColFunction(value, index) ||
        primitiveFunction(value, index) ||
        primitiveColFunction(value, index);
}
exports.odataFunction = odataFunction;
function getOperationType(operation, metadataContext, token, isBoundCollection, isCollection, isPrimitive, types) {
    var bindingParameterType = metadataContext.parent.namespace + "." + metadataContext.name;
    if (isBoundCollection)
        bindingParameterType = "Collection(" + bindingParameterType + ")";
    var fnDef;
    var root = getMetadataRoot(metadataContext);
    for (var i = 0; i < root.schemas.length; i++) {
        var schema = root.schemas[i];
        for (var j = 0; j < schema[operation + "s"].length; j++) {
            var fn = schema[operation + "s"][j];
            if (fn.name === token.raw && fn.isBound) {
                for (var k = 0; k < fn.parameters.length; k++) {
                    var param = fn.parameters[k];
                    if (param.name === "bindingParameter" && param.type === bindingParameterType) {
                        fnDef = fn;
                        break;
                    }
                }
            }
            if (fnDef)
                break;
        }
        if (fnDef)
            break;
    }
    if (!fnDef)
        return;
    if (operation === "action")
        return fnDef;
    if (fnDef.returnType.type.indexOf("Collection") === isCollection ? -1 : 0)
        return;
    var elementType = isCollection ? fnDef.returnType.type.slice(11, -1) : fnDef.returnType.type;
    if (isPrimitiveTypeName(elementType, metadataContext) && !isPrimitive)
        return;
    if (!isPrimitiveTypeName(elementType, metadataContext) && isPrimitive)
        return;
    if (isPrimitive)
        return elementType;
    var type;
    for (var i = 0; i < root.schemas.length; i++) {
        var schema = root.schemas[i];
        if (elementType.indexOf(schema.namespace + ".") === 0) {
            for (var j = 0; j < schema[types].length; j++) {
                var it = schema[types][j];
                if (schema.namespace + "." + it.name === elementType) {
                    type = it;
                    break;
                }
            }
        }
        if (type)
            break;
    }
    return type;
}
function entityFunction(value, index, isCollection, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.EntityFunction);
    if (!token)
        return;
    if (typeof metadataContext === "object") {
        var type = getOperationType("function", metadataContext, token, isCollection, false, false, "entityTypes");
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.entityFunction = entityFunction;
function entityColFunction(value, index, isCollection, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.EntityCollectionFunction);
    if (!token)
        return;
    if (typeof metadataContext === "object") {
        var type = getOperationType("function", metadataContext, token, isCollection, true, false, "entityTypes");
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.entityColFunction = entityColFunction;
function complexFunction(value, index, isCollection, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.ComplexFunction);
    if (!token)
        return;
    if (typeof metadataContext === "object") {
        var type = getOperationType("function", metadataContext, token, isCollection, false, false, "complexTypes");
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.complexFunction = complexFunction;
function complexColFunction(value, index, isCollection, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.ComplexCollectionFunction);
    if (!token)
        return;
    if (typeof metadataContext === "object") {
        var type = getOperationType("function", metadataContext, token, isCollection, true, false, "complexTypes");
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.complexColFunction = complexColFunction;
function primitiveFunction(value, index, isCollection, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.PrimitiveFunction);
    if (!token)
        return;
    if (typeof metadataContext === "object") {
        var type = getOperationType("function", metadataContext, token, isCollection, false, true);
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.primitiveFunction = primitiveFunction;
function primitiveColFunction(value, index, isCollection, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.PrimitiveCollectionFunction);
    if (!token)
        return;
    if (typeof metadataContext === "object") {
        var type = getOperationType("function", metadataContext, token, isCollection, true, true);
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.primitiveColFunction = primitiveColFunction;
function getOperationImportType(operation, metadataContext, token, isCollection, isPrimitive, types) {
    var fnImport;
    for (var i = 0; i < metadataContext.dataServices.schemas.length; i++) {
        var schema = metadataContext.dataServices.schemas[i];
        for (var j = 0; j < schema.entityContainer.length; j++) {
            var container = schema.entityContainer[j];
            for (var k = 0; k < container[operation + "Imports"].length; k++) {
                var it = container[operation + "Imports"][k];
                if (it.name === token.raw) {
                    fnImport = it;
                    break;
                }
            }
            if (fnImport)
                break;
        }
        if (fnImport)
            break;
    }
    if (!fnImport)
        return;
    var fn;
    for (var i = 0; i < metadataContext.dataServices.schemas.length; i++) {
        var schema = metadataContext.dataServices.schemas[i];
        if (fnImport[operation].indexOf(schema.namespace + ".") === 0) {
            for (var j = 0; j < schema[operation + "s"].length; j++) {
                var it = schema[operation + "s"][j];
                if (it.name === fnImport.name) {
                    fn = it;
                    break;
                }
            }
        }
        if (fn)
            break;
    }
    if (!fn)
        return;
    if (operation === "action")
        return fn;
    if (fn.returnType.type.indexOf("Collection") === isCollection ? -1 : 0)
        return;
    var elementType = isCollection ? fn.returnType.type.slice(11, -1) : fn.returnType.type;
    if (isPrimitiveTypeName(elementType, metadataContext) && !isPrimitive)
        return;
    if (!isPrimitiveTypeName(elementType, metadataContext) && isPrimitive)
        return;
    if (isPrimitive)
        return elementType;
    var type;
    for (var i = 0; i < metadataContext.dataServices.schemas.length; i++) {
        var schema = metadataContext.dataServices.schemas[i];
        if (elementType.indexOf(schema.namespace + ".") === 0) {
            for (var j = 0; j < schema[types].length; j++) {
                var it = schema[types][j];
                if (schema.namespace + "." + it.name === elementType) {
                    type = it;
                    break;
                }
            }
        }
        if (type)
            break;
    }
    return type;
}
function entityFunctionImport(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.EntityFunctionImport);
    if (!token)
        return;
    if (typeof metadataContext === "object") {
        var type = getOperationImportType("function", metadataContext, token, false, false, "entityTypes");
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.entityFunctionImport = entityFunctionImport;
function entityColFunctionImport(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.EntityCollectionFunctionImport);
    if (!token)
        return;
    if (typeof metadataContext === "object") {
        var type = getOperationImportType("function", metadataContext, token, true, false, "entityTypes");
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.entityColFunctionImport = entityColFunctionImport;
function complexFunctionImport(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.ComplexFunctionImport);
    if (!token)
        return;
    if (typeof metadataContext === "object") {
        var type = getOperationImportType("function", metadataContext, token, false, false, "complexTypes");
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.complexFunctionImport = complexFunctionImport;
function complexColFunctionImport(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.ComplexCollectionFunctionImport);
    if (!token)
        return;
    if (typeof metadataContext === "object") {
        var type = getOperationImportType("function", metadataContext, token, true, false, "complexTypes");
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.complexColFunctionImport = complexColFunctionImport;
function primitiveFunctionImport(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.PrimitiveFunctionImport);
    if (!token)
        return;
    if (typeof metadataContext === "object") {
        var type = getOperationImportType("function", metadataContext, token, false, true);
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.primitiveFunctionImport = primitiveFunctionImport;
function primitiveColFunctionImport(value, index, metadataContext) {
    var token = odataIdentifier(value, index, Lexer.TokenType.PrimitiveCollectionFunctionImport);
    if (!token)
        return;
    if (typeof metadataContext === "object") {
        var type = getOperationImportType("function", metadataContext, token, true, true);
        if (!type)
            return;
        token.metadata = type;
    }
    return token;
}
exports.primitiveColFunctionImport = primitiveColFunctionImport;
//# sourceMappingURL=nameOrIdentifier.js.map