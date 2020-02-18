import { Database as DatabaseInternal } from './schemaInterfaces'
import { PostgresDatabase } from './schemaPostgres'

enum SQLVersion {
    POSTGRES = 1,
    UNKNOWN = 3
}

function getSQLVersion (connection: string): SQLVersion {
    if (/^postgres(ql)?:\/\//i.test(connection)) {
        return SQLVersion.POSTGRES
    } else {
        return SQLVersion.UNKNOWN
    }
}

export function getDatabase (connection: string): DatabaseInternal {
    switch (getSQLVersion(connection)) {
        case SQLVersion.POSTGRES:
            return new PostgresDatabase(connection)
        default:
            throw new Error(`SQL version unsupported in connection: ${connection}`)
    }
}

export type Database = DatabaseInternal;
