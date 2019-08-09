"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var PgPromise = require("pg-promise");
var lodash_1 = require("lodash");
var pgp = PgPromise();
var PostgresDatabase = /** @class */ (function () {
    function PostgresDatabase(connectionString) {
        this.connectionString = connectionString;
        this.db = pgp(connectionString);
    }
    PostgresDatabase.mapValue = function (customTypes, options, c) {
        var column = c;
        switch (column.udtName) {
            case "bpchar":
            case "char":
            case "varchar":
            case "text":
            case "citext":
            case "uuid":
            case "bytea":
            case "inet":
            case "time":
            case "timetz":
            case "interval":
            case "name":
            case "int8":
            case "float8":
            case "numeric":
            case "money":
                column.tsType = "string";
                return column;
            case "int2":
            case "int4":
            case "float4":
            case "oid":
                column.tsType = "number";
                return column;
            case "bool":
                column.tsType = "boolean";
                return column;
            case "json":
            case "jsonb":
                column.tsType = "Object";
                return column;
            case "date":
            case "timestamp":
            case "timestamptz":
                column.tsType = "Date";
                return column;
            case "_int2":
            case "_int4":
            case "_float4":
                column.tsType = "Array<number>";
                return column;
            case "_bool":
                column.tsType = "Array<boolean>";
                return column;
            case "_varchar":
            case "_text":
            case "_citext":
            case "_uuid":
            case "_bytea":
            case "_int8":
            case "_float8":
            case "_numeric":
            case "_money":
                column.tsType = "Array<string>";
                return column;
            case "_json":
            case "_jsonb":
                column.tsType = "Array<Object>";
                return column;
            case "_timestamptz":
                column.tsType = "Array<Date>";
                return column;
            default:
                if (customTypes.indexOf(column.udtName) !== -1) {
                    column.tsType = options.transformTypeName(column.udtName);
                    return column;
                }
                if (column.udtName[0] === "_") {
                    var subTypeName = column.udtName.slice(1);
                    if (customTypes.indexOf(subTypeName) !== -1) {
                        var transformedType = options.transformTypeName(subTypeName);
                        column.tsType = "Array<" + transformedType + ">";
                        return column;
                    }
                }
                console.log("Type [" + column.udtName + "] has been mapped to [any] because no specific type has been found.");
                column.tsType = "any";
                return column;
        }
    };
    PostgresDatabase.mapTableDefinitionToType = function (tableDefinition, customTypes, options) {
        var _this = this;
        return lodash_1.mapValues(tableDefinition, function (c) { return _this.mapValue(customTypes, options, c); });
    };
    PostgresDatabase.prototype.query = function (queryString) {
        return this.db.query(queryString);
    };
    PostgresDatabase.prototype.getEnumTypes = function (schema) {
        return __awaiter(this, void 0, void 0, function () {
            var enums, enumSchemaWhereClause;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        enums = {};
                        enumSchemaWhereClause = schema
                            ? pgp.as.format("where n.nspname = $1", schema)
                            : "";
                        return [4 /*yield*/, this.db.each("select n.nspname as schema, t.typname as name, e.enumlabel as value " +
                                "from pg_type t " +
                                "join pg_enum e on t.oid = e.enumtypid " +
                                "join pg_catalog.pg_namespace n ON n.oid = t.typnamespace " +
                                (enumSchemaWhereClause + " ") +
                                "order by t.typname asc, e.enumlabel asc;", [], function (item) {
                                if (!enums[item.name]) {
                                    enums[item.name] = [];
                                }
                                enums[item.name].push(item.value);
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, enums];
                }
            });
        });
    };
    PostgresDatabase.prototype.getCompositeTypes = function (_) {
        return __awaiter(this, void 0, void 0, function () {
            var types;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        types = {};
                        return [4 /*yield*/, this.db.each("select a.attname as key_name, t.typname as udt_name, ut.typname as type_name\n        from pg_attribute a\n      join pg_type t on a.atttypid = t.typelem\n      join (\n        select * from pg_type\n        where typname IN (\n          select user_defined_type_name from information_schema.user_defined_types\n        )\n      ) ut on ut.typrelid = a.attrelid;", [], function (item) {
                                if (!types[item.type_name]) {
                                    types[item.type_name] = [];
                                }
                                types[item.type_name].push(__assign(__assign({}, item), { udtName: item.udt_name[0] === "_" ? item.udt_name.slice(1) : item.udt_name, nullable: true }));
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, types];
                }
            });
        });
    };
    PostgresDatabase.prototype.getTableDefinition = function (tableName, tableSchema) {
        return __awaiter(this, void 0, void 0, function () {
            var tableDefinition;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tableDefinition = {};
                        return [4 /*yield*/, this.db.each("SELECT column_name, udt_name, is_nullable " +
                                "FROM information_schema.columns " +
                                "WHERE table_name = $1 and table_schema = $2", [tableName, tableSchema], function (schemaItem) {
                                tableDefinition[schemaItem.column_name] = {
                                    udtName: schemaItem.udt_name,
                                    nullable: schemaItem.is_nullable === "YES",
                                };
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, tableDefinition];
                }
            });
        });
    };
    PostgresDatabase.prototype.getTableTypes = function (tableName, tableSchema, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, tableDef, enumTypes, compositeTypes;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.getTableDefinition(tableName, tableSchema),
                            this.getEnumTypes(),
                            this.getCompositeTypes(),
                        ])];
                    case 1:
                        _a = _b.sent(), tableDef = _a[0], enumTypes = _a[1], compositeTypes = _a[2];
                        return [2 /*return*/, PostgresDatabase.mapTableDefinitionToType(tableDef, __spreadArrays(lodash_1.keys(enumTypes), lodash_1.keys(compositeTypes)), options)];
                }
            });
        });
    };
    PostgresDatabase.prototype.getSchemaTables = function (schemaName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.map("SELECT table_name " +
                            "FROM information_schema.columns " +
                            "WHERE table_schema = $1 " +
                            "GROUP BY table_name", [schemaName], function (schemaItem) { return schemaItem.table_name; })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    PostgresDatabase.prototype.getDefaultSchema = function () {
        return "public";
    };
    return PostgresDatabase;
}());
exports.PostgresDatabase = PostgresDatabase;
//# sourceMappingURL=schemaPostgres.js.map