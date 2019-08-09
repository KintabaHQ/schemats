"use strict";
/**
 * Generate typescript interface from table schema
 * Created by xiamx on 2016-08-10.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var lodash_1 = require("lodash");
var schemaPostgres_1 = require("./schemaPostgres");
function nameIsReservedKeyword(name) {
    var reservedKeywords = ["string", "number", "package"];
    return reservedKeywords.indexOf(name) !== -1;
}
function normalizeName(name, options) {
    if (nameIsReservedKeyword(name)) {
        return name + "_";
    }
    return name;
}
function generateTableInterface(tableNameRaw, tableDefinition, options) {
    var tableName = options.transformTypeName(tableNameRaw);
    var members = "";
    Object.keys(tableDefinition)
        .map(function (c) { return options.transformColumnName(c); })
        .forEach(function (columnName) {
        members += columnName + ": " + tableName + "Fields." + normalizeName(columnName, options) + ";\n";
    });
    return "\n        export interface " + normalizeName(tableName, options) + " {\n        " + members + "\n        }\n    ";
}
exports.generateTableInterface = generateTableInterface;
function generateEnumType(enumObject, options) {
    var enumString = "";
    for (var enumNameRaw in enumObject) {
        var enumName = options.transformTypeName(enumNameRaw);
        enumString += "export type " + enumName + " = ";
        enumString += enumObject[enumNameRaw]
            .map(function (v) { return "'" + v + "'"; })
            .join(" | ");
        enumString += ";\n";
    }
    return enumString;
}
exports.generateEnumType = generateEnumType;
function generateCompositeType(db, options, enumTypes) {
    return __awaiter(this, void 0, void 0, function () {
        var compositeObject, compositeTypes, customTypes, compositeString, compositeNameRaw, compositeName, props;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(db instanceof schemaPostgres_1.PostgresDatabase)) {
                        return [2 /*return*/, ""];
                    }
                    return [4 /*yield*/, db.getCompositeTypes()];
                case 1:
                    compositeObject = _a.sent();
                    compositeTypes = lodash_1.keys(compositeObject);
                    customTypes = __spreadArrays(enumTypes, compositeTypes);
                    compositeString = "";
                    for (compositeNameRaw in compositeObject) {
                        compositeName = options.transformTypeName(compositeNameRaw);
                        compositeString += "export type " + compositeName + " = ";
                        props = compositeObject[compositeNameRaw].map(function (t) { return ({
                            typeName: options.transformColumnName(t.key_name),
                            column: schemaPostgres_1.PostgresDatabase.mapValue(customTypes, options, t),
                        }); });
                        compositeString += "{\n      " + props.map(function (t) { return t.typeName + ": " + t.column.tsType + " | null;"; }).join("\n") + "\n    }";
                        compositeString += ";\n";
                    }
                    return [2 /*return*/, compositeString];
            }
        });
    });
}
exports.generateCompositeType = generateCompositeType;
function generateTableTypes(tableNameRaw, tableDefinition, options) {
    var tableName = options.transformTypeName(tableNameRaw);
    var fields = "";
    Object.keys(tableDefinition).forEach(function (columnNameRaw) {
        var type = tableDefinition[columnNameRaw].tsType;
        var nullable = tableDefinition[columnNameRaw].nullable ? "| null" : "";
        var columnName = options.transformColumnName(columnNameRaw);
        fields += "export type " + normalizeName(columnName, options) + " = " + type + nullable + ";\n";
    });
    return "\n        export namespace " + tableName + "Fields {\n        " + fields + "\n        }\n    ";
}
exports.generateTableTypes = generateTableTypes;
//# sourceMappingURL=typescript.js.map