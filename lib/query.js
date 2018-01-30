"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utils = require("./utils");
var Lexer = require("./lexer");
var PrimitiveLiteral = require("./primitiveLiteral");
var NameOrIdentifier = require("./nameOrIdentifier");
var Expressions = require("./expressions");
function queryOptions(value, index, metadataContext) {
    var token = queryOption(value, index, metadataContext);
    if (!token)
        return;
    var start = index;
    index = token.next;
    var options = [];
    while (token) {
        options.push(token);
        // &
        if (value[index] !== 0x26)
            break;
        index++;
        token = queryOption(value, index, metadataContext);
        if (!token)
            return;
        index = token.next;
    }
    return Lexer.tokenize(value, start, index, { options: options }, Lexer.TokenType.QueryOptions);
}
exports.queryOptions = queryOptions;
function queryOption(value, index, metadataContext) {
    return systemQueryOption(value, index, metadataContext) ||
        aliasAndValue(value, index);
}
exports.queryOption = queryOption;
function systemQueryOption(value, index, metadataContext) {
    return expand(value, index, metadataContext) ||
        filter(value, index) ||
        format(value, index) ||
        id(value, index) ||
        inlinecount(value, index) ||
        orderby(value, index) ||
        search(value, index) ||
        select(value, index) ||
        skip(value, index) ||
        skiptoken(value, index) ||
        top(value, index);
}
exports.systemQueryOption = systemQueryOption;
function id(value, index) {
    var start = index;
    if (Utils.equals(value, index, "%24id")) {
        index += 5;
    }
    else if (Utils.equals(value, index, "$id")) {
        index += 3;
    }
    else
        return;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
    while (value[index] !== 0x26 && index < value.length)
        index++;
    if (index === eq)
        return;
    return Lexer.tokenize(value, start, index, Utils.stringify(value, eq, index), Lexer.TokenType.Id);
}
exports.id = id;
function expand(value, index, metadataContext) {
    var start = index;
    if (Utils.equals(value, index, "%24expand")) {
        index += 9;
    }
    else if (Utils.equals(value, index, "$expand")) {
        index += 7;
    }
    else
        return;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
    var items = [];
    var token = expandItem(value, index, metadataContext);
    if (!token)
        return;
    index = token.next;
    while (token) {
        items.push(token);
        var comma = Lexer.COMMA(value, index);
        if (comma) {
            index = comma;
            token = expandItem(value, index, metadataContext);
            if (!token)
                return;
            index = token.next;
        }
        else
            break;
    }
    return Lexer.tokenize(value, start, index, { items: items }, Lexer.TokenType.Expand);
}
exports.expand = expand;
function expandItem(value, index, metadataContext) {
    var start = index;
    var star = Lexer.STAR(value, index);
    if (star) {
        index = star;
        var ref_1 = Expressions.refExpr(value, index);
        if (ref_1) {
            index = ref_1.next;
            return Lexer.tokenize(value, start, index, { path: "*", ref: ref_1 }, Lexer.TokenType.ExpandItem);
        }
        else {
            var open_1 = Lexer.OPEN(value, index);
            if (open_1) {
                index = open_1;
                var token = levels(value, index);
                if (!token)
                    return;
                index = token.next;
                var close_1 = Lexer.CLOSE(value, index);
                if (!close_1)
                    return;
                index = close_1;
                return Lexer.tokenize(value, start, index, { path: "*", levels: token }, Lexer.TokenType.ExpandItem);
            }
        }
    }
    var path = expandPath(value, index, metadataContext);
    if (!path)
        return;
    index = path.next;
    var tokenValue = { path: path };
    var ref = Expressions.refExpr(value, index);
    if (ref) {
        index = ref.next;
        tokenValue.ref = ref;
        var open_2 = Lexer.OPEN(value, index);
        if (open_2) {
            index = open_2;
            var option = expandRefOption(value, index);
            if (!option)
                return;
            var refOptions = [];
            while (option) {
                refOptions.push(option);
                index = option.next;
                var semi = Lexer.SEMI(value, index);
                if (semi) {
                    index = semi;
                    option = expandRefOption(value, index);
                    if (!option)
                        return;
                }
                else
                    break;
            }
            var close_2 = Lexer.CLOSE(value, index);
            if (!close_2)
                return;
            index = close_2;
            tokenValue.options = refOptions;
        }
    }
    else {
        var count = Expressions.countExpr(value, index);
        if (count) {
            index = count.next;
            tokenValue.count = count;
            var open_3 = Lexer.OPEN(value, index);
            if (open_3) {
                index = open_3;
                var option = expandCountOption(value, index);
                if (!option)
                    return;
                var countOptions = [];
                while (option) {
                    countOptions.push(option);
                    index = option.next;
                    var semi = Lexer.SEMI(value, index);
                    if (semi) {
                        index = semi;
                        option = expandCountOption(value, index);
                        if (!option)
                            return;
                    }
                    else
                        break;
                }
                var close_3 = Lexer.CLOSE(value, index);
                if (!close_3)
                    return;
                index = close_3;
                tokenValue.options = countOptions;
            }
        }
        else {
            var open_4 = Lexer.OPEN(value, index);
            if (open_4) {
                index = open_4;
                var option = expandOption(value, index);
                if (!option)
                    return;
                var options = [];
                while (option) {
                    options.push(option);
                    index = option.next;
                    var semi = Lexer.SEMI(value, index);
                    if (semi) {
                        index = semi;
                        option = expandOption(value, index);
                        if (!option)
                            return;
                    }
                    else
                        break;
                }
                var close_4 = Lexer.CLOSE(value, index);
                if (!close_4)
                    return;
                index = close_4;
                tokenValue.options = options;
            }
        }
    }
    return Lexer.tokenize(value, start, index, tokenValue, Lexer.TokenType.ExpandItem);
}
exports.expandItem = expandItem;
function expandCountOption(value, index) {
    return filter(value, index) ||
        search(value, index);
}
exports.expandCountOption = expandCountOption;
function expandRefOption(value, index) {
    return expandCountOption(value, index) ||
        orderby(value, index) ||
        skip(value, index) ||
        top(value, index) ||
        inlinecount(value, index);
}
exports.expandRefOption = expandRefOption;
function expandOption(value, index) {
    return expandRefOption(value, index) ||
        select(value, index) ||
        expand(value, index) ||
        levels(value, index);
}
exports.expandOption = expandOption;
function expandPath(value, index, metadataContext) {
    var start = index;
    var path = [];
    var token = NameOrIdentifier.qualifiedEntityTypeName(value, index, metadataContext) ||
        NameOrIdentifier.qualifiedComplexTypeName(value, index, metadataContext);
    if (token) {
        index = token.next;
        path.push(token);
        if (value[index] !== 0x2f)
            return;
        index++;
        metadataContext = token.value.metadata;
        delete token.value.metadata;
    }
    var complex = NameOrIdentifier.complexProperty(value, index, metadataContext) ||
        NameOrIdentifier.complexColProperty(value, index, metadataContext);
    while (complex) {
        if (value[complex.next] === 0x2f) {
            index = complex.next + 1;
            path.push(complex);
            var complexTypeName = NameOrIdentifier.qualifiedComplexTypeName(value, index, metadataContext);
            if (complexTypeName) {
                if (value[complexTypeName.next] === 0x2f) {
                    index = complexTypeName.next + 1;
                    path.push(complexTypeName);
                }
                metadataContext = complexTypeName.value.metadata;
                delete complexTypeName.value.metadata;
            }
            complex = NameOrIdentifier.complexProperty(value, index, metadataContext) ||
                NameOrIdentifier.complexColProperty(value, index, metadataContext);
        }
        else
            break;
    }
    var nav = NameOrIdentifier.navigationProperty(value, index, metadataContext);
    if (!nav)
        return;
    index = nav.next;
    path.push(nav);
    metadataContext = nav.metadata;
    delete nav.metadata;
    if (value[index] === 0x2f) {
        var typeName = NameOrIdentifier.qualifiedEntityTypeName(value, index + 1, metadataContext);
        if (typeName) {
            index = typeName.next;
            path.push(typeName);
            metadataContext = typeName.value.metadata;
            delete typeName.value.metadata;
        }
    }
    return Lexer.tokenize(value, start, index, path, Lexer.TokenType.ExpandPath);
}
exports.expandPath = expandPath;
function search(value, index) {
    var start = index;
    if (Utils.equals(value, index, "%24search")) {
        index += 9;
    }
    else if (Utils.equals(value, index, "$search")) {
        index += 7;
    }
    else
        return;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
    var expr = searchExpr(value, index);
    if (!expr)
        return;
    index = expr.next;
    return Lexer.tokenize(value, start, index, expr, Lexer.TokenType.Search);
}
exports.search = search;
function searchExpr(value, index) {
    var token = searchParenExpr(value, index) ||
        searchTerm(value, index);
    if (!token)
        return;
    var start = index;
    index = token.next;
    var expr = searchAndExpr(value, index) ||
        searchOrExpr(value, index);
    if (expr) {
        var left = Lexer.clone(token);
        token.next = expr.value.next;
        token.value = {
            left: left,
            right: expr.value
        };
        token.type = expr.type;
        token.raw = Utils.stringify(value, token.position, token.next);
        if (token.type === Lexer.TokenType.SearchAndExpression && token.value.right.type === Lexer.TokenType.SearchOrExpression) {
            token.value.left = Lexer.tokenize(value, token.value.left.position, token.value.right.value.left.next, {
                left: token.value.left,
                right: token.value.right.value.left
            }, token.type);
            token.type = token.value.right.type;
            token.value.right = token.value.right.value.right;
        }
    }
    return token;
}
exports.searchExpr = searchExpr;
function searchTerm(value, index) {
    return searchNotExpr(value, index) ||
        searchPhrase(value, index) ||
        searchWord(value, index);
}
exports.searchTerm = searchTerm;
function searchNotExpr(value, index) {
    var rws = Lexer.RWS(value, index);
    if (!Utils.equals(value, rws, "NOT"))
        return;
    var start = index;
    index = rws + 3;
    rws = Lexer.RWS(value, index);
    if (rws === index)
        return;
    index = rws;
    var expr = searchPhrase(value, index) ||
        searchWord(value, index);
    if (!expr)
        return;
    index = expr.next;
    return Lexer.tokenize(value, start, index, expr, Lexer.TokenType.SearchNotExpression);
}
exports.searchNotExpr = searchNotExpr;
function searchOrExpr(value, index) {
    var rws = Lexer.RWS(value, index);
    if (rws === index || !Utils.equals(value, rws, "OR"))
        return;
    var start = index;
    index = rws + 2;
    rws = Lexer.RWS(value, index);
    if (rws === index)
        return;
    index = rws;
    var token = searchExpr(value, index);
    if (!token)
        return;
    index = token.next;
    return Lexer.tokenize(value, start, index, token, Lexer.TokenType.SearchOrExpression);
}
exports.searchOrExpr = searchOrExpr;
function searchAndExpr(value, index) {
    var rws = Lexer.RWS(value, index);
    if (rws === index || !Utils.equals(value, rws, "AND"))
        return;
    var start = index;
    index = rws + 3;
    rws = Lexer.RWS(value, index);
    if (rws === index)
        return;
    index = rws;
    var token = searchExpr(value, index);
    if (!token)
        return;
    index = token.next;
    return Lexer.tokenize(value, start, index, token, Lexer.TokenType.SearchAndExpression);
}
exports.searchAndExpr = searchAndExpr;
function searchPhrase(value, index) {
    var mark = Lexer.quotationMark(value, index);
    if (mark === index)
        return;
    var start = index;
    index = mark;
    var valueStart = index;
    var ch = Lexer.qcharNoAMPDQUOTE(value, index);
    while (ch > index && !Lexer.OPEN(value, index) && !Lexer.CLOSE(value, index)) {
        index = ch;
        ch = Lexer.qcharNoAMPDQUOTE(value, index);
    }
    var valueEnd = index;
    mark = Lexer.quotationMark(value, index);
    if (!mark)
        return;
    index = mark;
    return Lexer.tokenize(value, start, index, Utils.stringify(value, valueStart, valueEnd), Lexer.TokenType.SearchPhrase);
}
exports.searchPhrase = searchPhrase;
function searchWord(value, index) {
    var next = Utils.required(value, index, Lexer.ALPHA, 1);
    if (!next)
        return;
    var start = index;
    index = next;
    var token = Lexer.tokenize(value, start, index, null, Lexer.TokenType.SearchWord);
    token.value = token.raw;
    return token;
}
exports.searchWord = searchWord;
function searchParenExpr(value, index) {
    var open = Lexer.OPEN(value, index);
    if (!open)
        return;
    var start = index;
    index = open;
    index = Lexer.BWS(value, index);
    var expr = searchExpr(value, index);
    if (!expr)
        return;
    index = expr.next;
    index = Lexer.BWS(value, index);
    var close = Lexer.CLOSE(value, index);
    if (!close)
        return;
    index = close;
    return Lexer.tokenize(value, start, index, expr, Lexer.TokenType.SearchParenExpression);
}
exports.searchParenExpr = searchParenExpr;
function levels(value, index) {
    var start = index;
    if (Utils.equals(value, index, "%24levels")) {
        index += 9;
    }
    else if (Utils.equals(value, index, "$levels")) {
        index += 7;
    }
    else
        return;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
    var level;
    if (Utils.equals(value, index, "max")) {
        level = "max";
        index += 3;
    }
    else {
        var token = PrimitiveLiteral.int32Value(value, index);
        if (!token)
            return;
        level = token.raw;
        index = token.next;
    }
    return Lexer.tokenize(value, start, index, level, Lexer.TokenType.Levels);
}
exports.levels = levels;
function filter(value, index) {
    var start = index;
    if (Utils.equals(value, index, "%24filter")) {
        index += 9;
    }
    else if (Utils.equals(value, index, "$filter")) {
        index += 7;
    }
    else
        return;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
    var expr = Expressions.boolCommonExpr(value, index);
    if (!expr)
        return;
    index = expr.next;
    return Lexer.tokenize(value, start, index, expr, Lexer.TokenType.Filter);
}
exports.filter = filter;
function orderby(value, index) {
    var start = index;
    if (Utils.equals(value, index, "%24orderby")) {
        index += 10;
    }
    else if (Utils.equals(value, index, "$orderby")) {
        index += 8;
    }
    else
        return;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
    var items = [];
    var token = orderbyItem(value, index);
    if (!token)
        return;
    index = token.next;
    while (token) {
        items.push(token);
        var comma = Lexer.COMMA(value, index);
        if (comma) {
            index = comma;
            var token_1 = orderbyItem(value, index);
            if (!token_1)
                return;
            index = token_1.next;
        }
        else
            break;
    }
    return Lexer.tokenize(value, start, index, { items: items }, Lexer.TokenType.OrderBy);
}
exports.orderby = orderby;
function orderbyItem(value, index) {
    var expr = Expressions.commonExpr(value, index);
    if (!expr)
        return;
    var start = index;
    index = expr.next;
    var direction = 1;
    var rws = Lexer.RWS(value, index);
    if (rws > index) {
        index = rws;
        if (Utils.equals(value, index, "asc"))
            index += 3;
        else if (Utils.equals(value, index, "desc")) {
            index += 4;
            direction = -1;
        }
        else
            return;
    }
    return Lexer.tokenize(value, start, index, { expr: expr, direction: direction }, Lexer.TokenType.OrderByItem);
}
exports.orderbyItem = orderbyItem;
function skip(value, index) {
    var start = index;
    if (Utils.equals(value, index, "%24skip")) {
        index += 7;
    }
    else if (Utils.equals(value, index, "$skip")) {
        index += 5;
    }
    else
        return;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
    var token = PrimitiveLiteral.int32Value(value, index);
    if (!token)
        return;
    index = token.next;
    return Lexer.tokenize(value, start, index, token, Lexer.TokenType.Skip);
}
exports.skip = skip;
function top(value, index) {
    var start = index;
    if (Utils.equals(value, index, "%24top")) {
        index += 6;
    }
    else if (Utils.equals(value, index, "$top")) {
        index += 4;
    }
    else
        return;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
    var token = PrimitiveLiteral.int32Value(value, index);
    if (!token)
        return;
    index = token.next;
    return Lexer.tokenize(value, start, index, token, Lexer.TokenType.Top);
}
exports.top = top;
function format(value, index) {
    var start = index;
    if (Utils.equals(value, index, "%24format")) {
        index += 9;
    }
    else if (Utils.equals(value, index, "$format")) {
        index += 7;
    }
    else
        return;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
    var format;
    if (Utils.equals(value, index, "atom")) {
        format = "atom";
        index += 4;
    }
    else if (Utils.equals(value, index, "json")) {
        format = "json";
        index += 4;
    }
    else if (Utils.equals(value, index, "xml")) {
        format = "xml";
        index += 3;
    }
    if (format)
        return Lexer.tokenize(value, start, index, { format: format }, Lexer.TokenType.Format);
}
exports.format = format;
function inlinecount(value, index) {
    var start = index;
    if (Utils.equals(value, index, "%24count")) {
        index += 8;
    }
    else if (Utils.equals(value, index, "$count")) {
        index += 6;
    }
    else
        return;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
    var token = PrimitiveLiteral.booleanValue(value, index);
    if (!token)
        return;
    index = token.next;
    return Lexer.tokenize(value, start, index, token, Lexer.TokenType.InlineCount);
}
exports.inlinecount = inlinecount;
function select(value, index) {
    var start = index;
    if (Utils.equals(value, index, "%24select")) {
        index += 9;
    }
    else if (Utils.equals(value, index, "$select")) {
        index += 7;
    }
    else
        return;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
    var items = [];
    var token = selectItem(value, index);
    if (!token)
        return;
    while (token) {
        items.push(token);
        index = token.next;
        var comma = Lexer.COMMA(value, index);
        if (comma) {
            index = comma;
            token = selectItem(value, index);
            if (!token)
                return;
        }
        else
            break;
    }
    return Lexer.tokenize(value, start, index, { items: items }, Lexer.TokenType.Select);
}
exports.select = select;
function selectItem(value, index) {
    var start = index;
    var item;
    var op = allOperationsInSchema(value, index);
    var star = Lexer.STAR(value, index);
    if (op > index) {
        item = { namespace: Utils.stringify(value, index, op - 2), value: "*" };
        index = op;
    }
    else if (star) {
        item = { value: "*" };
        index = star;
    }
    else {
        item = {};
        var name_1 = NameOrIdentifier.qualifiedEntityTypeName(value, index) ||
            NameOrIdentifier.qualifiedComplexTypeName(value, index);
        if (name_1 && value[name_1.next] !== 0x2f)
            return;
        else if (name_1 && value[name_1.next] === 0x2f) {
            index++;
            item.name = name_1;
        }
        var select_1 = selectProperty(value, index) ||
            qualifiedActionName(value, index) ||
            qualifiedFunctionName(value, index);
        if (!select_1)
            return;
        index = select_1.next;
        item = name_1 ? { name: name_1, select: select_1 } : select_1;
    }
    if (index > start)
        return Lexer.tokenize(value, start, index, item, Lexer.TokenType.SelectItem);
}
exports.selectItem = selectItem;
function allOperationsInSchema(value, index) {
    var namespaceNext = NameOrIdentifier.namespace(value, index);
    var star = Lexer.STAR(value, namespaceNext + 1);
    if (namespaceNext > index && value[namespaceNext] === 0x2e && star)
        return star;
    return index;
}
exports.allOperationsInSchema = allOperationsInSchema;
function selectProperty(value, index) {
    var token = selectPath(value, index) ||
        NameOrIdentifier.primitiveProperty(value, index) ||
        NameOrIdentifier.primitiveColProperty(value, index) ||
        NameOrIdentifier.navigationProperty(value, index);
    if (!token)
        return;
    var start = index;
    index = token.next;
    if (token.type === Lexer.TokenType.SelectPath) {
        if (value[index] === 0x2f) {
            index++;
            var prop = selectProperty(value, index);
            if (!prop)
                return;
            var path = Lexer.clone(token);
            token.next = prop.next;
            token.raw = Utils.stringify(value, start, token.next);
            token.value = { path: path, next: prop };
        }
    }
    return token;
}
exports.selectProperty = selectProperty;
function selectPath(value, index) {
    var token = NameOrIdentifier.complexProperty(value, index) ||
        NameOrIdentifier.complexColProperty(value, index);
    if (!token)
        return;
    var start = index;
    index = token.next;
    var tokenValue = token;
    if (value[index] === 0x2f) {
        var name_2 = NameOrIdentifier.qualifiedComplexTypeName(value, index + 1);
        if (name_2) {
            index = name_2.next;
            tokenValue = { prop: token, name: name_2 };
        }
    }
    return Lexer.tokenize(value, start, index, tokenValue, Lexer.TokenType.SelectPath);
}
exports.selectPath = selectPath;
function qualifiedActionName(value, index) {
    var namespaceNext = NameOrIdentifier.namespace(value, index);
    if (namespaceNext === index || value[namespaceNext] !== 0x2e)
        return;
    var start = index;
    index = namespaceNext + 1;
    var action = NameOrIdentifier.action(value, index);
    if (!action)
        return;
    action.value.namespace = Utils.stringify(value, start, namespaceNext);
    return Lexer.tokenize(value, start, action.next, action, Lexer.TokenType.Action);
}
exports.qualifiedActionName = qualifiedActionName;
function qualifiedFunctionName(value, index) {
    var namespaceNext = NameOrIdentifier.namespace(value, index);
    if (namespaceNext === index || value[namespaceNext] !== 0x2e)
        return;
    var start = index;
    index = namespaceNext + 1;
    var fn = NameOrIdentifier.odataFunction(value, index);
    if (!fn)
        return;
    fn.value.namespace = Utils.stringify(value, start, namespaceNext);
    index = fn.next;
    var tokenValue = { name: fn };
    var open = Lexer.OPEN(value, index);
    if (open) {
        index = open;
        tokenValue.parameters = [];
        var param = Expressions.parameterName(value, index);
        if (!param)
            return;
        while (param) {
            index = param.next;
            tokenValue.parameters.push(param);
            var comma = Lexer.COMMA(value, index);
            if (comma) {
                index = comma;
                var param_1 = Expressions.parameterName(value, index);
                if (!param_1)
                    return;
            }
            else
                break;
        }
        var close_5 = Lexer.CLOSE(value, index);
        if (!close_5)
            return;
        index = close_5;
    }
    return Lexer.tokenize(value, start, index, tokenValue, Lexer.TokenType.Function);
}
exports.qualifiedFunctionName = qualifiedFunctionName;
function skiptoken(value, index) {
    var start = index;
    if (Utils.equals(value, index, "%24skiptoken")) {
        index += 12;
    }
    else if (Utils.equals(value, index, "$skiptoken")) {
        index += 10;
    }
    else
        return;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
    var ch = Lexer.qcharNoAMP(value, index);
    if (!ch)
        return;
    var valueStart = index;
    while (ch > index) {
        index = ch;
        ch = Lexer.qcharNoAMP(value, index);
    }
    return Lexer.tokenize(value, start, index, Utils.stringify(value, valueStart, index), Lexer.TokenType.SkipToken);
}
exports.skiptoken = skiptoken;
function aliasAndValue(value, index) {
    var alias = Expressions.parameterAlias(value, index);
    if (!alias)
        return;
    var start = index;
    index = alias.next;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index = eq;
    var paramValue = Expressions.parameterValue(value, index);
    if (!paramValue)
        return;
    index = paramValue.next;
    return Lexer.tokenize(value, start, index, {
        alias: alias,
        value: paramValue
    }, Lexer.TokenType.AliasAndValue);
}
exports.aliasAndValue = aliasAndValue;
//# sourceMappingURL=query.js.map