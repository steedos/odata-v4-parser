export declare enum TokenType {
    Literal = "Literal",
    ArrayOrObject = "ArrayOrObject",
    Array = "Array",
    Object = "Object",
    Property = "Property",
    Annotation = "Annotation",
    Enum = "Enum",
    EnumValue = "EnumValue",
    EnumMemberValue = "EnumMemberValue",
    Identifier = "Identifier",
    QualifiedEntityTypeName = "QualifiedEntityTypeName",
    QualifiedComplexTypeName = "QualifiedComplexTypeName",
    ODataIdentifier = "ODataIdentifier",
    Collection = "Collection",
    NamespacePart = "NamespacePart",
    EntitySetName = "EntitySetName",
    SingletonEntity = "SingletonEntity",
    EntityTypeName = "EntityTypeName",
    ComplexTypeName = "ComplexTypeName",
    TypeDefinitionName = "TypeDefinitionName",
    EnumerationTypeName = "EnumerationTypeName",
    EnumerationMember = "EnumerationMember",
    TermName = "TermName",
    PrimitiveProperty = "PrimitiveProperty",
    PrimitiveKeyProperty = "PrimitiveKeyProperty",
    PrimitiveNonKeyProperty = "PrimitiveNonKeyProperty",
    PrimitiveCollectionProperty = "PrimitiveCollectionProperty",
    ComplexProperty = "ComplexProperty",
    ComplexCollectionProperty = "ComplexCollectionProperty",
    StreamProperty = "StreamProperty",
    NavigationProperty = "NavigationProperty",
    EntityNavigationProperty = "EntityNavigationProperty",
    EntityCollectionNavigationProperty = "EntityCollectionNavigationProperty",
    Action = "Action",
    ActionImport = "ActionImport",
    Function = "Function",
    EntityFunction = "EntityFunction",
    EntityCollectionFunction = "EntityCollectionFunction",
    ComplexFunction = "ComplexFunction",
    ComplexCollectionFunction = "ComplexCollectionFunction",
    PrimitiveFunction = "PrimitiveFunction",
    PrimitiveCollectionFunction = "PrimitiveCollectionFunction",
    EntityFunctionImport = "EntityFunctionImport",
    EntityCollectionFunctionImport = "EntityCollectionFunctionImport",
    ComplexFunctionImport = "ComplexFunctionImport",
    ComplexCollectionFunctionImport = "ComplexCollectionFunctionImport",
    PrimitiveFunctionImport = "PrimitiveFunctionImport",
    PrimitiveCollectionFunctionImport = "PrimitiveCollectionFunctionImport",
    CommonExpression = "CommonExpression",
    AndExpression = "AndExpression",
    OrExpression = "OrExpression",
    EqualsExpression = "EqualsExpression",
    NotEqualsExpression = "NotEqualsExpression",
    LesserThanExpression = "LesserThanExpression",
    LesserOrEqualsExpression = "LesserOrEqualsExpression",
    GreaterThanExpression = "GreaterThanExpression",
    GreaterOrEqualsExpression = "GreaterOrEqualsExpression",
    HasExpression = "HasExpression",
    AddExpression = "AddExpression",
    SubExpression = "SubExpression",
    MulExpression = "MulExpression",
    DivExpression = "DivExpression",
    ModExpression = "ModExpression",
    NotExpression = "NotExpression",
    BoolParenExpression = "BoolParenExpression",
    ParenExpression = "ParenExpression",
    MethodCallExpression = "MethodCallExpression",
    IsOfExpression = "IsOfExpression",
    CastExpression = "CastExpression",
    NegateExpression = "NegateExpression",
    FirstMemberExpression = "FirstMemberExpression",
    MemberExpression = "MemberExpression",
    PropertyPathExpression = "PropertyPathExpression",
    ImplicitVariableExpression = "ImplicitVariableExpression",
    LambdaVariable = "LambdaVariable",
    LambdaVariableExpression = "LambdaVariableExpression",
    LambdaPredicateExpression = "LambdaPredicateExpression",
    AnyExpression = "AnyExpression",
    AllExpression = "AllExpression",
    CollectionNavigationExpression = "CollectionNavigationExpression",
    SimpleKey = "SimpleKey",
    CompoundKey = "CompoundKey",
    KeyValuePair = "KeyValuePair",
    KeyPropertyValue = "KeyPropertyValue",
    KeyPropertyAlias = "KeyPropertyAlias",
    SingleNavigationExpression = "SingleNavigationExpression",
    CollectionPathExpression = "CollectionPathExpression",
    ComplexPathExpression = "ComplexPathExpression",
    SinglePathExpression = "SinglePathExpression",
    FunctionExpression = "FunctionExpression",
    FunctionExpressionParameters = "FunctionExpressionParameters",
    FunctionExpressionParameter = "FunctionExpressionParameter",
    ParameterName = "ParameterName",
    ParameterAlias = "ParameterAlias",
    ParameterValue = "ParameterValue",
    CountExpression = "CountExpression",
    RefExpression = "RefExpression",
    ValueExpression = "ValueExpression",
    RootExpression = "RootExpression",
    QueryOptions = "QueryOptions",
    Expand = "Expand",
    ExpandItem = "ExpandItem",
    ExpandPath = "ExpandPath",
    ExpandCountOption = "ExpandCountOption",
    ExpandRefOption = "ExpandRefOption",
    ExpandOption = "ExpandOption",
    Levels = "Levels",
    Search = "Search",
    SearchExpression = "SearchExpression",
    SearchParenExpression = "SearchParenExpression",
    SearchNotExpression = "SearchNotExpression",
    SearchOrExpression = "SearchOrExpression",
    SearchAndExpression = "SearchAndExpression",
    SearchTerm = "SearchTerm",
    SearchPhrase = "SearchPhrase",
    SearchWord = "SearchWord",
    Filter = "Filter",
    OrderBy = "OrderBy",
    OrderByItem = "OrderByItem",
    Skip = "Skip",
    Top = "Top",
    Format = "Format",
    InlineCount = "InlineCount",
    Select = "Select",
    SelectItem = "SelectItem",
    SelectPath = "SelectPath",
    AliasAndValue = "AliasAndValue",
    SkipToken = "SkipToken",
    Id = "Id",
    Crossjoin = "Crossjoin",
    AllResource = "AllResource",
    ActionImportCall = "ActionImportCall",
    FunctionImportCall = "FunctionImportCall",
    EntityCollectionFunctionImportCall = "EntityCollectionFunctionImportCall",
    EntityFunctionImportCall = "EntityFunctionImportCall",
    ComplexCollectionFunctionImportCall = "ComplexCollectionFunctionImportCall",
    ComplexFunctionImportCall = "ComplexFunctionImportCall",
    PrimitiveCollectionFunctionImportCall = "PrimitiveCollectionFunctionImportCall",
    PrimitiveFunctionImportCall = "PrimitiveFunctionImportCall",
    FunctionParameters = "FunctionParameters",
    FunctionParameter = "FunctionParameter",
    ResourcePath = "ResourcePath",
    CollectionNavigation = "CollectionNavigation",
    CollectionNavigationPath = "CollectionNavigationPath",
    SingleNavigation = "SingleNavigation",
    PropertyPath = "PropertyPath",
    ComplexPath = "ComplexPath",
    BoundOperation = "BoundOperation",
    BoundActionCall = "BoundActionCall",
    BoundEntityFunctionCall = "BoundEntityFunctionCall",
    BoundEntityCollectionFunctionCall = "BoundEntityCollectionFunctionCall",
    BoundComplexFunctionCall = "BoundComplexFunctionCall",
    BoundComplexCollectionFunctionCall = "BoundComplexCollectionFunctionCall",
    BoundPrimitiveFunctionCall = "BoundPrimitiveFunctionCall",
    BoundPrimitiveCollectionFunctionCall = "BoundPrimitiveCollectionFunctionCall",
    ODataUri = "ODataUri",
    Batch = "Batch",
    Entity = "Entity",
    Metadata = "Metadata",
}
export declare class Token {
    position: number;
    next: number;
    value: any;
    type: TokenType;
    raw: string;
    metadata: any;
    constructor(token: any);
}
export declare function tokenize(value: number[] | Uint8Array, index: number, next: number, tokenValue: any, tokenType: TokenType, metadataContextContainer?: Token): Token;
export declare function clone(token: any): Token;
export declare function ALPHA(value: number): boolean;
export declare function DIGIT(value: number): boolean;
export declare function HEXDIG(value: number): boolean;
export declare function AtoF(value: number): boolean;
export declare function DQUOTE(value: number): boolean;
export declare function SP(value: number): boolean;
export declare function HTAB(value: number): boolean;
export declare function VCHAR(value: number): boolean;
export declare function OWS(value: number[] | Uint8Array, index: number): number;
export declare function RWS(value: number[] | Uint8Array, index: number): number;
export declare function BWS(value: number[] | Uint8Array, index: number): number;
export declare function AT(value: number[] | Uint8Array, index: number): number;
export declare function COLON(value: number[] | Uint8Array, index: number): number;
export declare function COMMA(value: number[] | Uint8Array, index: number): number;
export declare function EQ(value: number[] | Uint8Array, index: number): number;
export declare function SIGN(value: number[] | Uint8Array, index: number): number;
export declare function SEMI(value: number[] | Uint8Array, index: number): number;
export declare function STAR(value: number[] | Uint8Array, index: number): number;
export declare function SQUOTE(value: number[] | Uint8Array, index: number): number;
export declare function OPEN(value: number[] | Uint8Array, index: number): number;
export declare function CLOSE(value: number[] | Uint8Array, index: number): number;
export declare function unreserved(value: number): boolean;
export declare function otherDelims(value: number[] | Uint8Array, index: number): number;
export declare function subDelims(value: number[] | Uint8Array, index: number): number;
export declare function pctEncoded(value: number[] | Uint8Array, index: number): number;
export declare function pctEncodedNoSQUOTE(value: number[] | Uint8Array, index: number): number;
export declare function pctEncodedUnescaped(value: number[] | Uint8Array, index: number): number;
export declare function pchar(value: number[] | Uint8Array, index: number): number;
export declare function pcharNoSQUOTE(value: number[] | Uint8Array, index: number): number;
export declare function qcharNoAMP(value: number[] | Uint8Array, index: number): number;
export declare function qcharNoAMPDQUOTE(value: number[] | Uint8Array, index: number): number;
export declare function base64char(value: number): boolean;
export declare function base64b16(value: number[] | Uint8Array, index: number): number;
export declare function base64b8(value: number[] | Uint8Array, index: number): number;
export declare function nanInfinity(value: number[] | Uint8Array, index: number): number;
export declare function oneToNine(value: number): boolean;
export declare function zeroToFiftyNine(value: number[] | Uint8Array, index: number): number;
export declare function year(value: number[] | Uint8Array, index: number): number;
export declare function month(value: number[] | Uint8Array, index: number): number;
export declare function day(value: number[] | Uint8Array, index: number): number;
export declare function hour(value: number[] | Uint8Array, index: number): number;
export declare function minute(value: number[] | Uint8Array, index: number): number;
export declare function second(value: number[] | Uint8Array, index: number): number;
export declare function fractionalSeconds(value: number[] | Uint8Array, index: number): number;
export declare function geographyPrefix(value: number[] | Uint8Array, index: number): number;
export declare function geometryPrefix(value: number[] | Uint8Array, index: number): number;
export declare function identifierLeadingCharacter(value: number): boolean;
export declare function identifierCharacter(value: number): boolean;
export declare function beginObject(value: number[] | Uint8Array, index: number): number;
export declare function endObject(value: number[] | Uint8Array, index: number): number;
export declare function beginArray(value: number[] | Uint8Array, index: number): number;
export declare function endArray(value: number[] | Uint8Array, index: number): number;
export declare function quotationMark(value: number[] | Uint8Array, index: number): number;
export declare function nameSeparator(value: number[] | Uint8Array, index: number): number;
export declare function valueSeparator(value: number[] | Uint8Array, index: number): number;
export declare function escape(value: number[] | Uint8Array, index: number): number;
