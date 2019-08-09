import * as ts from "typescript";
import { Database } from "../src/index";
export declare function compile(fileNames: string[], options: ts.CompilerOptions): boolean;
export declare function compare(goldStandardFile: string, outputFile: string): Promise<boolean>;
export declare function loadSchema(db: Database, file: string): Promise<Object[]>;
export declare function writeTsFile(inputSQLFile: string, inputConfigFile: string, outputFile: string, db: Database): Promise<void>;
