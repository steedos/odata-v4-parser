"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utils = require("./utils");
var Lexer = require("./lexer");
var NameOrIdentifier = require("./nameOrIdentifier");
function nullValue(value, index) {
    if (Utils.equals(value, index, "null"))
        return Lexer.tokenize(value, index, index + 4, "null", Lexer.TokenType.Literal);
}
exports.nullValue = nullValue;
function booleanValue(value, index) {
    if (Utils.equals(value, index, "true"))
        return Lexer.tokenize(value, index, index + 4, "Edm.Boolean", Lexer.TokenType.Literal);
    if (Utils.equals(value, index, "false"))
        return Lexer.tokenize(value, index, index + 5, "Edm.Boolean", Lexer.TokenType.Literal);
}
exports.booleanValue = booleanValue;
function guidValue(value, index) {
    if (Utils.required(value, index, Lexer.HEXDIG, 8, 8) &&
        value[index + 8] === 0x2d &&
        Utils.required(value, index + 9, Lexer.HEXDIG, 4, 4) &&
        value[index + 13] === 0x2d &&
        Utils.required(value, index + 14, Lexer.HEXDIG, 4, 4) &&
        value[index + 18] === 0x2d &&
        Utils.required(value, index + 19, Lexer.HEXDIG, 4, 4) &&
        value[index + 23] === 0x2d &&
        Utils.required(value, index + 24, Lexer.HEXDIG, 12))
        return Lexer.tokenize(value, index, index + 36, "Edm.Guid", Lexer.TokenType.Literal);
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
            return Lexer.tokenize(value, start, next, "Edm.SByte", Lexer.TokenType.Literal);
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
            return Lexer.tokenize(value, index, next, "Edm.Byte", Lexer.TokenType.Literal);
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
            return Lexer.tokenize(value, start, next, "Edm.Int16", Lexer.TokenType.Literal);
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
            return Lexer.tokenize(value, start, next, "Edm.Int32", Lexer.TokenType.Literal);
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
        if (val >= "0" && val <= (value[start] === 0x2d ? "9223372036854775808" : "9223372036854775807"))
            return Lexer.tokenize(value, start, next, "Edm.Int64", Lexer.TokenType.Literal);
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
    if (value[intNext] === 0x2e) {
        end = Utils.required(value, intNext + 1, Lexer.DIGIT, 1);
        if (!end || end === intNext + 1)
            return;
    }
    else
        return;
    // TODO: detect only decimal value, no double/single detection here
    if (value[end] === 0x65)
        return;
    return Lexer.tokenize(value, start, end, "Edm.Decimal", Lexer.TokenType.Literal);
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
        // TODO: use decimalValue function
        // var token = decimalValue(value, index);
        var sign = Lexer.SIGN(value, index);
        if (sign)
            index = sign;
        var intNext = Utils.required(value, index, Lexer.DIGIT, 1);
        if (!intNext)
            return;
        var decimalNext = intNext;
        if (value[intNext] === 0x2e) {
            decimalNext = Utils.required(value, intNext + 1, Lexer.DIGIT, 1);
            if (decimalNext === intNext + 1)
                return;
        }
        else
            return;
        if (value[decimalNext] === 0x65) {
            var next = decimalNext + 1;
            var sign_1 = Lexer.SIGN(value, next);
            if (sign_1)
                next = sign_1;
            var digitNext = Utils.required(value, next, Lexer.DIGIT, 1);
            if (digitNext) {
                end = digitNext;
            }
        }
        else
            end = decimalNext;
    }
    return Lexer.tokenize(value, start, end, "Edm.Double", Lexer.TokenType.Literal);
}
exports.doubleValue = doubleValue;
function singleValue(value, index) {
    var token = doubleValue(value, index);
    if (token) {
        token.value = "Edm.Single";
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
                    var close_1 = Lexer.CLOSE(value, index);
                    var comma = Lexer.COMMA(value, index);
                    var amp = value[index] === 0x26;
                    if (Lexer.pcharNoSQUOTE(value, index) > index && !amp && !close_1 && !comma && Lexer.RWS(value, index) === index)
                        return;
                    break;
                }
                else {
                    index = squote;
                }
            }
            else {
                var nextIndex = Math.max(Lexer.RWS(value, index), Lexer.pcharNoSQUOTE(value, index));
                if (nextIndex === index)
                    return;
                index = nextIndex;
            }
        }
        squote = Lexer.SQUOTE(value, index - 1) || Lexer.SQUOTE(value, index - 3);
        if (!squote)
            return;
        index = squote;
        return Lexer.tokenize(value, start, index, "Edm.String", Lexer.TokenType.Literal);
    }
}
exports.stringValue = stringValue;
function durationValue(value, index) {
    if (!Utils.equals(value, index, "duration"))
        return;
    var start = index;
    index += 8;
    var squote = Lexer.SQUOTE(value, index);
    if (!squote)
        return;
    index = squote;
    var sign = Lexer.SIGN(value, index);
    if (sign)
        index = sign;
    if (value[index] !== 0x50)
        return;
    index++;
    var dayNext = Utils.required(value, index, Lexer.DIGIT, 1);
    if (dayNext === index && value[index + 1] !== 0x54)
        return;
    index = dayNext;
    if (value[index] === 0x44)
        index++;
    var end = index;
    if (value[index] === 0x54) {
        index++;
        var parseTimeFn_1 = function () {
            var squote = Lexer.SQUOTE(value, index);
            if (squote)
                return index;
            var digitNext = Utils.required(value, index, Lexer.DIGIT, 1);
            if (digitNext === index)
                return;
            index = digitNext;
            if (value[index] === 0x53) {
                end = index + 1;
                return end;
            }
            else if (value[index] === 0x2e) {
                index++;
                var fractionalSecondsNext = Utils.required(value, index, Lexer.DIGIT, 1);
                if (fractionalSecondsNext === index || value[fractionalSecondsNext] !== 0x53)
                    return;
                end = fractionalSecondsNext + 1;
                return end;
            }
            else if (value[index] === 0x48) {
                index++;
                end = index;
                return parseTimeFn_1();
            }
            else if (value[index] === 0x4d) {
                index++;
                end = index;
                return parseTimeFn_1();
            }
        };
        var next = parseTimeFn_1();
        if (!next)
            return;
    }
    squote = Lexer.SQUOTE(value, end);
    if (!squote)
        return;
    end = squote;
    return Lexer.tokenize(value, start, end, "Edm.Duration", Lexer.TokenType.Literal);
}
exports.durationValue = durationValue;
function binaryValue(value, index) {
    var start = index;
    if (!Utils.equals(value, index, "binary"))
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
    return Lexer.tokenize(value, start, index, "Edm.Binary" /*new Edm.Binary(stringify(value, valStart, index - 1))*/, Lexer.TokenType.Literal);
}
exports.binaryValue = binaryValue;
function dateValue(value, index) {
    var yearNext = Lexer.year(value, index);
    if (yearNext === index || value[yearNext] !== 0x2d)
        return;
    var monthNext = Lexer.month(value, yearNext + 1);
    if ((monthNext === yearNext + 1) || value[monthNext] !== 0x2d)
        return;
    var dayNext = Lexer.day(value, monthNext + 1);
    // TODO: join dateValue and dateTimeOffsetValue for optimalization
    if (dayNext === monthNext + 1 || value[dayNext] === 0x54)
        return;
    return Lexer.tokenize(value, index, dayNext, "Edm.Date", Lexer.TokenType.Literal);
}
exports.dateValue = dateValue;
function dateTimeOffsetValue(value, index) {
    var yearNext = Lexer.year(value, index);
    if (yearNext === index || value[yearNext] !== 0x2d)
        return;
    var monthNext = Lexer.month(value, yearNext + 1);
    if ((monthNext === yearNext + 1) || value[monthNext] !== 0x2d)
        return;
    var dayNext = Lexer.day(value, monthNext + 1);
    if (dayNext === monthNext + 1 || value[dayNext] !== 0x54)
        return;
    var hourNext = Lexer.hour(value, dayNext + 1);
    var colon = Lexer.COLON(value, hourNext);
    if (hourNext === colon || !colon)
        return;
    var minuteNext = Lexer.minute(value, hourNext + 1);
    if (minuteNext === hourNext + 1)
        return;
    var end = minuteNext;
    colon = Lexer.COLON(value, minuteNext);
    if (colon) {
        var secondNext = Lexer.second(value, colon);
        if (secondNext === colon)
            return;
        if (value[secondNext] === 0x2e) {
            var fractionalSecondsNext = Lexer.fractionalSeconds(value, secondNext + 1);
            if (fractionalSecondsNext === secondNext + 1)
                return;
            end = fractionalSecondsNext;
        }
        else
            end = secondNext;
    }
    var sign = Lexer.SIGN(value, end);
    if (value[end] === 0x5a) {
        end++;
    }
    else if (sign) {
        var zHourNext = Lexer.hour(value, sign);
        var colon_1 = Lexer.COLON(value, zHourNext);
        if (zHourNext === sign || !colon_1)
            return;
        var zMinuteNext = Lexer.minute(value, colon_1);
        if (zMinuteNext === colon_1)
            return;
        end = zMinuteNext;
    }
    else
        return;
    return Lexer.tokenize(value, index, end, "Edm.DateTimeOffset", Lexer.TokenType.Literal);
}
exports.dateTimeOffsetValue = dateTimeOffsetValue;
function timeOfDayValue(value, index) {
    var hourNext = Lexer.hour(value, index);
    var colon = Lexer.COLON(value, hourNext);
    if (hourNext === index || !colon)
        return;
    var minuteNext = Lexer.minute(value, colon);
    if (minuteNext === colon)
        return;
    var end = minuteNext;
    colon = Lexer.COLON(value, minuteNext);
    if (colon) {
        var secondNext = Lexer.second(value, colon);
        if (secondNext === colon)
            return;
        if (value[secondNext] === 0x2e) {
            var fractionalSecondsNext = Lexer.fractionalSeconds(value, secondNext + 1);
            if (fractionalSecondsNext === secondNext + 1)
                return;
            end = fractionalSecondsNext;
        }
        else
            end = secondNext;
    }
    return Lexer.tokenize(value, index, end, "Edm.TimeOfDay", Lexer.TokenType.Literal);
}
exports.timeOfDayValue = timeOfDayValue;
// geography and geometry literals
function positionLiteral(value, index) {
    var longitude = doubleValue(value, index);
    if (!longitude)
        return;
    var next = Lexer.RWS(value, longitude.next);
    if (next === longitude.next)
        return;
    var latitude = doubleValue(value, next);
    if (!latitude)
        return;
    return Lexer.tokenize(value, index, latitude.next, { longitude: longitude, latitude: latitude }, Lexer.TokenType.Literal);
}
exports.positionLiteral = positionLiteral;
function pointData(value, index) {
    var open = Lexer.OPEN(value, index);
    if (!open)
        return;
    var start = index;
    index = open;
    var position = positionLiteral(value, index);
    if (!position)
        return;
    index = position.next;
    var close = Lexer.CLOSE(value, index);
    if (!close)
        return;
    index = close;
    return Lexer.tokenize(value, start, index, position, Lexer.TokenType.Literal);
}
exports.pointData = pointData;
function lineStringData(value, index) {
    return multiGeoLiteralFactory(value, index, "", positionLiteral);
}
exports.lineStringData = lineStringData;
function ringLiteral(value, index) {
    return multiGeoLiteralFactory(value, index, "", positionLiteral);
    // Within each ringLiteral, the first and last positionLiteral elements MUST be an exact syntactic match to each other.
    // Within the polygonData, the ringLiterals MUST specify their points in appropriate winding order.
    // In order of traversal, points to the left side of the ring are interpreted as being in the polygon.
}
exports.ringLiteral = ringLiteral;
function polygonData(value, index) {
    return multiGeoLiteralFactory(value, index, "", ringLiteral);
}
exports.polygonData = polygonData;
function sridLiteral(value, index) {
    if (!Utils.equals(value, index, "SRID"))
        return;
    var start = index;
    index += 4;
    var eq = Lexer.EQ(value, index);
    if (!eq)
        return;
    index++;
    var digit = Utils.required(value, index, Lexer.DIGIT, 1, 5);
    if (!digit)
        return;
    index = digit;
    var semi = Lexer.SEMI(value, index);
    if (!semi)
        return;
    index = semi;
    return Lexer.tokenize(value, start, index, "SRID", Lexer.TokenType.Literal);
}
exports.sridLiteral = sridLiteral;
function pointLiteral(value, index) {
    if (!Utils.equals(value, index, "Point"))
        return;
    var start = index;
    index += 5;
    var data = pointData(value, index);
    if (!data)
        return;
    return Lexer.tokenize(value, start, data.next, data, Lexer.TokenType.Literal);
}
exports.pointLiteral = pointLiteral;
function polygonLiteral(value, index) {
    if (!Utils.equals(value, index, "Polygon"))
        return;
    var start = index;
    index += 7;
    var data = polygonData(value, index);
    if (!data)
        return;
    return Lexer.tokenize(value, start, data.next, data, Lexer.TokenType.Literal);
}
exports.polygonLiteral = polygonLiteral;
function collectionLiteral(value, index) {
    return multiGeoLiteralFactory(value, index, "Collection", geoLiteral);
}
exports.collectionLiteral = collectionLiteral;
function lineStringLiteral(value, index) {
    if (!Utils.equals(value, index, "LineString"))
        return;
    var start = index;
    index += 10;
    var data = lineStringData(value, index);
    if (!data)
        return;
    index = data.next;
    return Lexer.tokenize(value, start, index, data, Lexer.TokenType.Literal);
}
exports.lineStringLiteral = lineStringLiteral;
function multiLineStringLiteral(value, index) {
    return multiGeoLiteralOptionalFactory(value, index, "MultiLineString", lineStringData);
}
exports.multiLineStringLiteral = multiLineStringLiteral;
function multiPointLiteral(value, index) {
    return multiGeoLiteralOptionalFactory(value, index, "MultiPoint", pointData);
}
exports.multiPointLiteral = multiPointLiteral;
function multiPolygonLiteral(value, index) {
    return multiGeoLiteralOptionalFactory(value, index, "MultiPolygon", polygonData);
}
exports.multiPolygonLiteral = multiPolygonLiteral;
function multiGeoLiteralFactory(value, index, prefix, itemLiteral) {
    if (!Utils.equals(value, index, prefix + "("))
        return;
    var start = index;
    index += prefix.length + 1;
    var items = [];
    var geo = itemLiteral(value, index);
    if (!geo)
        return;
    index = geo.next;
    while (geo) {
        items.push(geo);
        var close_2 = Lexer.CLOSE(value, index);
        if (close_2) {
            index = close_2;
            break;
        }
        var comma = Lexer.COMMA(value, index);
        if (!comma)
            return;
        index = comma;
        geo = itemLiteral(value, index);
        if (!geo)
            return;
        index = geo.next;
    }
    return Lexer.tokenize(value, start, index, { items: items }, Lexer.TokenType.Literal);
}
exports.multiGeoLiteralFactory = multiGeoLiteralFactory;
function multiGeoLiteralOptionalFactory(value, index, prefix, itemLiteral) {
    if (!Utils.equals(value, index, prefix + "("))
        return;
    var start = index;
    index += prefix.length + 1;
    var items = [];
    var close = Lexer.CLOSE(value, index);
    if (!close) {
        var geo = itemLiteral(value, index);
        if (!geo)
            return;
        index = geo.next;
        while (geo) {
            items.push(geo);
            close = Lexer.CLOSE(value, index);
            if (close) {
                index = close;
                break;
            }
            var comma = Lexer.COMMA(value, index);
            if (!comma)
                return;
            index = comma;
            geo = itemLiteral(value, index);
            if (!geo)
                return;
            index = geo.next;
        }
    }
    else
        index++;
    return Lexer.tokenize(value, start, index, { items: items }, Lexer.TokenType.Literal);
}
exports.multiGeoLiteralOptionalFactory = multiGeoLiteralOptionalFactory;
function geoLiteral(value, index) {
    return collectionLiteral(value, index) ||
        lineStringLiteral(value, index) ||
        multiPointLiteral(value, index) ||
        multiLineStringLiteral(value, index) ||
        multiPolygonLiteral(value, index) ||
        pointLiteral(value, index) ||
        polygonLiteral(value, index);
}
exports.geoLiteral = geoLiteral;
function fullPointLiteral(value, index) {
    return fullGeoLiteralFactory(value, index, pointLiteral);
}
exports.fullPointLiteral = fullPointLiteral;
function fullCollectionLiteral(value, index) {
    return fullGeoLiteralFactory(value, index, collectionLiteral);
}
exports.fullCollectionLiteral = fullCollectionLiteral;
function fullLineStringLiteral(value, index) {
    return fullGeoLiteralFactory(value, index, lineStringLiteral);
}
exports.fullLineStringLiteral = fullLineStringLiteral;
function fullMultiLineStringLiteral(value, index) {
    return fullGeoLiteralFactory(value, index, multiLineStringLiteral);
}
exports.fullMultiLineStringLiteral = fullMultiLineStringLiteral;
function fullMultiPointLiteral(value, index) {
    return fullGeoLiteralFactory(value, index, multiPointLiteral);
}
exports.fullMultiPointLiteral = fullMultiPointLiteral;
function fullMultiPolygonLiteral(value, index) {
    return fullGeoLiteralFactory(value, index, multiPolygonLiteral);
}
exports.fullMultiPolygonLiteral = fullMultiPolygonLiteral;
function fullPolygonLiteral(value, index) {
    return fullGeoLiteralFactory(value, index, polygonLiteral);
}
exports.fullPolygonLiteral = fullPolygonLiteral;
function fullGeoLiteralFactory(value, index, literal) {
    var srid = sridLiteral(value, index);
    if (!srid)
        return;
    var token = literal(value, srid.next);
    if (!token)
        return;
    return Lexer.tokenize(value, index, token.next, { srid: srid, value: token }, Lexer.TokenType.Literal);
}
exports.fullGeoLiteralFactory = fullGeoLiteralFactory;
function geographyCollection(value, index) {
    var prefix = Lexer.geographyPrefix(value, index);
    if (prefix === index)
        return;
    var start = index;
    index = prefix;
    var squote = Lexer.SQUOTE(value, index);
    if (!squote)
        return;
    index = squote;
    var point = fullCollectionLiteral(value, index);
    if (!point)
        return;
    index = point.next;
    squote = Lexer.SQUOTE(value, index);
    if (!squote)
        return;
    index = squote;
    return Lexer.tokenize(value, start, index, "Edm.GeographyCollection", Lexer.TokenType.Literal);
}
exports.geographyCollection = geographyCollection;
function geographyLineString(value, index) {
    return geoLiteralFactory(value, index, "Edm.GeographyLineString", Lexer.geographyPrefix, fullLineStringLiteral);
}
exports.geographyLineString = geographyLineString;
function geographyMultiLineString(value, index) {
    return geoLiteralFactory(value, index, "Edm.GeographyMultiLineString", Lexer.geographyPrefix, fullMultiLineStringLiteral);
}
exports.geographyMultiLineString = geographyMultiLineString;
function geographyMultiPoint(value, index) {
    return geoLiteralFactory(value, index, "Edm.GeographyMultiPoint", Lexer.geographyPrefix, fullMultiPointLiteral);
}
exports.geographyMultiPoint = geographyMultiPoint;
function geographyMultiPolygon(value, index) {
    return geoLiteralFactory(value, index, "Edm.GeographyMultiPolygon", Lexer.geographyPrefix, fullMultiPolygonLiteral);
}
exports.geographyMultiPolygon = geographyMultiPolygon;
function geographyPoint(value, index) {
    return geoLiteralFactory(value, index, "Edm.GeographyPoint", Lexer.geographyPrefix, fullPointLiteral);
}
exports.geographyPoint = geographyPoint;
function geographyPolygon(value, index) {
    return geoLiteralFactory(value, index, "Edm.GeographyPolygon", Lexer.geographyPrefix, fullPolygonLiteral);
}
exports.geographyPolygon = geographyPolygon;
function geometryCollection(value, index) {
    return geoLiteralFactory(value, index, "Edm.GeometryCollection", Lexer.geometryPrefix, fullCollectionLiteral);
}
exports.geometryCollection = geometryCollection;
function geometryLineString(value, index) {
    return geoLiteralFactory(value, index, "Edm.GeometryLineString", Lexer.geometryPrefix, fullLineStringLiteral);
}
exports.geometryLineString = geometryLineString;
function geometryMultiLineString(value, index) {
    return geoLiteralFactory(value, index, "Edm.GeometryMultiLineString", Lexer.geometryPrefix, fullMultiLineStringLiteral);
}
exports.geometryMultiLineString = geometryMultiLineString;
function geometryMultiPoint(value, index) {
    return geoLiteralFactory(value, index, "Edm.GeometryMultiPoint", Lexer.geometryPrefix, fullMultiPointLiteral);
}
exports.geometryMultiPoint = geometryMultiPoint;
function geometryMultiPolygon(value, index) {
    return geoLiteralFactory(value, index, "Edm.GeometryMultiPolygon", Lexer.geometryPrefix, fullMultiPolygonLiteral);
}
exports.geometryMultiPolygon = geometryMultiPolygon;
function geometryPoint(value, index) {
    return geoLiteralFactory(value, index, "Edm.GeometryPoint", Lexer.geometryPrefix, fullPointLiteral);
}
exports.geometryPoint = geometryPoint;
function geometryPolygon(value, index) {
    return geoLiteralFactory(value, index, "Edm.GeometryPolygon", Lexer.geometryPrefix, fullPolygonLiteral);
}
exports.geometryPolygon = geometryPolygon;
function geoLiteralFactory(value, index, type, prefix, literal) {
    var prefixNext = prefix(value, index);
    if (prefixNext === index)
        return;
    var start = index;
    index = prefixNext;
    var squote = Lexer.SQUOTE(value, index);
    if (!squote)
        return;
    index = squote;
    var data = literal(value, index);
    if (!data)
        return;
    index = data.next;
    squote = Lexer.SQUOTE(value, index);
    if (!squote)
        return;
    index = squote;
    return Lexer.tokenize(value, start, index, type, Lexer.TokenType.Literal);
}
exports.geoLiteralFactory = geoLiteralFactory;
function primitiveLiteral(value, index) {
    return nullValue(value, index) ||
        booleanValue(value, index) ||
        guidValue(value, index) ||
        dateValue(value, index) ||
        dateTimeOffsetValue(value, index) ||
        timeOfDayValue(value, index) ||
        decimalValue(value, index) ||
        doubleValue(value, index) ||
        singleValue(value, index) ||
        sbyteValue(value, index) ||
        byteValue(value, index) ||
        int16Value(value, index) ||
        int32Value(value, index) ||
        int64Value(value, index) ||
        stringValue(value, index) ||
        durationValue(value, index) ||
        binaryValue(value, index) ||
        NameOrIdentifier.enumeration(value, index) ||
        geographyCollection(value, index) ||
        geographyLineString(value, index) ||
        geographyMultiLineString(value, index) ||
        geographyMultiPoint(value, index) ||
        geographyMultiPolygon(value, index) ||
        geographyPoint(value, index) ||
        geographyPolygon(value, index) ||
        geometryCollection(value, index) ||
        geometryLineString(value, index) ||
        geometryMultiLineString(value, index) ||
        geometryMultiPoint(value, index) ||
        geometryMultiPolygon(value, index) ||
        geometryPoint(value, index) ||
        geometryPolygon(value, index);
}
exports.primitiveLiteral = primitiveLiteral;
//# sourceMappingURL=primitiveLiteral.js.map