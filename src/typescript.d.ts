/**
 * Generate typescript interface from table schema
 * Created by xiamx on 2016-08-10.
 */
import { Database, TableDefinition } from "./schemaInterfaces";
import Options from "./options";
export declare function generateTableInterface(tableNameRaw: string, tableDefinition: TableDefinition, options: Options): string;
export declare function generateEnumType(enumObject: any, options: Options): string;
export declare function generateCompositeType(db: Database | string, options: Options, enumTypes: string[]): Promise<string>;
export declare function generateTableTypes(tableNameRaw: string, tableDefinition: TableDefinition, options: Options): string;
