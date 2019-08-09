import Options from "./options";
import { TableDefinition, Database, ColumnDefinition } from "./schemaInterfaces";
declare type EnumTypes = {
    [key: string]: string[];
};
declare type CompositeType = {
    type_name: string;
    key_name: string;
    udt_name: string;
};
declare type CompositeTypes = {
    [key: string]: (CompositeType & ColumnDefinition)[];
};
export declare class PostgresDatabase implements Database {
    connectionString: string;
    private db;
    constructor(connectionString: string);
    static mapValue(customTypes: string[], options: Options, c: ColumnDefinition): ColumnDefinition;
    private static mapTableDefinitionToType;
    query(queryString: string): Promise<any>;
    getEnumTypes(schema?: string): Promise<EnumTypes>;
    getCompositeTypes(_?: string): Promise<CompositeTypes>;
    getTableDefinition(tableName: string, tableSchema: string): Promise<TableDefinition>;
    getTableTypes(tableName: string, tableSchema: string, options: Options): Promise<TableDefinition>;
    getSchemaTables(schemaName: string): Promise<string[]>;
    getDefaultSchema(): string;
}
export {};
