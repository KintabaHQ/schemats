import * as PgPromise from "pg-promise";
import { mapValues, keys } from "lodash";

import Options from "./options";
import { TableDefinition, Database, ColumnDefinition } from "./schemaInterfaces";

const pgp = PgPromise();

type EnumType = { name: string; value: any };
type EnumTypes = { [key: string]: string[] };

type CompositeType = { type_name: string; key_name: string; udt_name: string }
type CompositeTypes = { [key: string]: (CompositeType & ColumnDefinition)[] };

export class PostgresDatabase implements Database {
  private db: PgPromise.IDatabase<{}>;

  constructor(public connectionString: string) {
    this.db = pgp(connectionString);
  }

  public static mapValue(
    customTypes: string[],
    options: Options,
    c: ColumnDefinition,
  ) {
    const column = c;
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
          const subTypeName = column.udtName.slice(1);
          if (customTypes.indexOf(subTypeName) !== -1) {
            const transformedType = options.transformTypeName(subTypeName);
            column.tsType = `Array<${transformedType}>`;
            return column;
          }
        }

        console.log(
          `Type [${column.udtName}] has been mapped to [any] because no specific type has been found.`,
        );
        column.tsType = "any";
        return column;
    }
  }


  private static mapTableDefinitionToType(
    tableDefinition: TableDefinition,
    customTypes: string[],
    options: Options,
  ): TableDefinition {
    return mapValues(tableDefinition, (c) => this.mapValue(
      customTypes,
      options,
      c,
    ));
  }

  public query(queryString: string) {
    return this.db.query(queryString);
  }

  public async getEnumTypes(schema?: string) {
    const enums: EnumTypes = {};
    const enumSchemaWhereClause = schema
      ? pgp.as.format(`where n.nspname = $1`, schema)
      : "";
    await this.db.each<EnumType>(
      "select n.nspname as schema, t.typname as name, e.enumlabel as value " +
        "from pg_type t " +
        "join pg_enum e on t.oid = e.enumtypid " +
        "join pg_catalog.pg_namespace n ON n.oid = t.typnamespace " +
        `${enumSchemaWhereClause} ` +
        "order by t.typname asc, e.enumlabel asc;",
      [],
      (item: EnumType) => {
        if (!enums[item.name]) {
          enums[item.name] = [];
        }
        enums[item.name].push(item.value);
      },
    );
    return enums;
  }

  public async getCompositeTypes(_?: string) {
    const types: CompositeTypes = {};
    await this.db.each<CompositeType>(
      `select a.attname as key_name, t.typname as udt_name, ut.typname as type_name
        from pg_attribute a
      join pg_type t on a.atttypid = t.typelem
      join (
        select * from pg_type
        where typname IN (
          select user_defined_type_name from information_schema.user_defined_types
        )
      ) ut on ut.typrelid = a.attrelid;`,
      [],
      (item: CompositeType) => {
        if (!types[item.type_name]) {
          types[item.type_name] = [];
        }
        types[item.type_name].push({
          ...item,
          udtName: item.udt_name[0] === "_" ? item.udt_name.slice(1) : item.udt_name,
          nullable: true,
        });
      },
    );
    return types;
  }

  public async getTableDefinition(tableName: string, tableSchema: string) {
    const tableDefinition: TableDefinition = {};
    type T = { column_name: string; udt_name: string; is_nullable: string };
    await this.db.each<T>(
      "SELECT column_name, udt_name, is_nullable " +
        "FROM information_schema.columns " +
        "WHERE table_name = $1 and table_schema = $2",
      [tableName, tableSchema],
      (schemaItem: T) => {
        tableDefinition[schemaItem.column_name] = {
          udtName: schemaItem.udt_name,
          nullable: schemaItem.is_nullable === "YES",
        };
      },
    );
    return tableDefinition;
  }

  public async getTableTypes(
    tableName: string,
    tableSchema: string,
    options: Options,
  ) {
    const [tableDef, enumTypes, compositeTypes] = await Promise.all([
      this.getTableDefinition(tableName, tableSchema),
      this.getEnumTypes(),
      this.getCompositeTypes(),
    ]);
    return PostgresDatabase.mapTableDefinitionToType(
      tableDef,
      [...keys(enumTypes), ...keys(compositeTypes)],
      options,
    );
  }

  public async getSchemaTables(schemaName: string): Promise<string[]> {
    return await this.db.map<string>(
      "SELECT table_name " +
        "FROM information_schema.columns " +
        "WHERE table_schema = $1 " +
        "GROUP BY table_name",
      [schemaName],
      (schemaItem: { table_name: string }) => schemaItem.table_name,
    );
  }

  getDefaultSchema(): string {
    return "public";
  }
}
