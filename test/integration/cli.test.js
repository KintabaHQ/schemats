"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var assert = require("power-assert");
describe('schemats cli tool integration testing', function () {
    describe('schemats generate postgres', function () {
        before(function () {
            if (!process.env.POSTGRES_URL) {
                this.skip();
            }
        });
        it('should run without error', function () {
            var _a = child_process_1.spawnSync('node', [
                'bin/schemats', 'generate',
                '-c', process.env.POSTGRES_URL || '',
                '-o', '/tmp/schemats_cli_postgres.ts'
            ], { encoding: 'utf-8' }), status = _a.status, stdout = _a.stdout, stderr = _a.stderr;
            console.log('opopopopop', stdout, stderr);
            assert.equal(0, status);
        });
    });
    describe('schemats generate mysql', function () {
        before(function () {
            if (!process.env.MYSQL_URL) {
                this.skip();
            }
        });
        it('should run without error', function () {
            var status = child_process_1.spawnSync('node', [
                'bin/schemats', 'generate',
                '-c', process.env.MYSQL_URL || '',
                '-s', 'test',
                '-o', '/tmp/schemats_cli_postgres.ts'
            ]).status;
            assert.equal(0, status);
        });
    });
});
//# sourceMappingURL=cli.test.js.map