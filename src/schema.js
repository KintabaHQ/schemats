"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var schemaPostgres_1 = require("./schemaPostgres");
var SQLVersion;
(function (SQLVersion) {
    SQLVersion[SQLVersion["POSTGRES"] = 1] = "POSTGRES";
    SQLVersion[SQLVersion["UNKNOWN"] = 3] = "UNKNOWN";
})(SQLVersion || (SQLVersion = {}));
function getSQLVersion(connection) {
    if (/^postgres(ql)?:\/\//i.test(connection)) {
        return SQLVersion.POSTGRES;
    }
    return SQLVersion.UNKNOWN;
}
function getDatabase(connection) {
    switch (getSQLVersion(connection)) {
        case SQLVersion.POSTGRES:
            return new schemaPostgres_1.PostgresDatabase(connection);
        default:
            throw new Error("SQL version unsupported in connection: " + connection);
    }
}
exports.getDatabase = getDatabase;
//# sourceMappingURL=schema.js.map