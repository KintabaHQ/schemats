/**
 * Generate typescript interface from table schema
 * Created by xiamx on 2016-08-10.
 */

import { keys } from "lodash";

import { Database, TableDefinition, ColumnDefinition } from "./schemaInterfaces";
import { PostgresDatabase } from "./schemaPostgres";
import Options from "./options";

function nameIsReservedKeyword(name: string): boolean {
  const reservedKeywords = ["string", "number", "package"];
  return reservedKeywords.indexOf(name) !== -1;
}

function normalizeName(name: string, options: Options): string {
  if (nameIsReservedKeyword(name)) {
    return `${name}_`;
  }
  return name;
}

export function generateTableInterface(
  tableNameRaw: string,
  tableDefinition: TableDefinition,
  options: Options,
) {
  const tableName = options.transformTypeName(tableNameRaw);
  let members = "";
  Object.keys(tableDefinition)
    .map(c => options.transformColumnName(c))
    .forEach(columnName => {
      members += `${columnName}: ${tableName}Fields.${normalizeName(
        columnName,
        options,
      )};\n`;
    });

  return `
        export interface ${normalizeName(tableName, options)} {
        ${members}
        }
    `;
}

export function generateEnumType(enumObject: any, options: Options) {
  let enumString = "";
  for (const enumNameRaw in enumObject) {
    const enumName = options.transformTypeName(enumNameRaw);
    enumString += `export type ${enumName} = `;
    enumString += enumObject[enumNameRaw]
      .map((v: string) => `'${v}'`)
      .join(" | ");
    enumString += ";\n";
  }
  return enumString;
}

export async function generateCompositeType(
  db: Database | string,
  options: Options,
  enumTypes: string[],
) {
  if (!(db instanceof PostgresDatabase)) {
    return "";
  }
  const compositeObject = await db.getCompositeTypes();
  const compositeTypes = keys(compositeObject);
  const customTypes = [...enumTypes, ...compositeTypes];
  let compositeString = "";
  for (const compositeNameRaw in compositeObject) {
    const compositeName = options.transformTypeName(compositeNameRaw);
    compositeString += `export type ${compositeName} = `;
    const props = compositeObject[compositeNameRaw].map(t => ({
      typeName: options.transformColumnName(t.key_name),
      column: PostgresDatabase.mapValue(customTypes, options, t),
    }));
    compositeString += `{
      ${props.map(t => `${t.typeName}: ${t.column.tsType} | null;`).join("\n")}
    }`;
    compositeString += ";\n";
  }
  return compositeString;
}

export function generateTableTypes(
  tableNameRaw: string,
  tableDefinition: TableDefinition,
  options: Options,
) {
  const tableName = options.transformTypeName(tableNameRaw);
  let fields = "";
  Object.keys(tableDefinition).forEach(columnNameRaw => {
    const type = tableDefinition[columnNameRaw].tsType;
    const nullable = tableDefinition[columnNameRaw].nullable ? "| null" : "";
    const columnName = options.transformColumnName(columnNameRaw);
    fields += `export type ${normalizeName(
      columnName,
      options,
    )} = ${type}${nullable};\n`;
  });

  return `
        export namespace ${tableName}Fields {
        ${fields}
        }
    `;
}
