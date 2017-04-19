/**
 * Test Utils
 */
//import * as path from "path";

import {
    AsyncTest,
    Expect,
    SetupFixture,
    TeardownFixture,
    TestFixture,
} from "alsatian";

import {
    readFileAsync,
    clang2wasm,
    statAsync,
    unlinkAsync,
} from "./utils";

import * as debugModule from "debug";
const debug = debugModule("utils.spec");

@TestFixture("utils tests")
export class UtilsTests {
    @SetupFixture
    public setupFixture() {
        debug("setupFixture:#");
    }

    @TeardownFixture
    public teardownFixture() {
        debug("teardownFixture:#");
    }

    @AsyncTest("Test readFileAsync success")
    public async testReadFileAsync() {
        let data = await readFileAsync("./utils/data.txt");
        Expect(data.length).toBe(9);
        let len = data.length;
        Expect(len).toBe(9);
        for (let i=0; i < len-1; i++) {
            Expect(data[i]).toBe(i + 0x31);
        }
        Expect(data[len-1]).toBe(0x0a);
    }

    @AsyncTest("Test readFileAsync failing")
    public async testReadFileAsyncFail() {
        let file="non-existent-file";

        // TODO: This should work:
        //    Expect(async () => await readFileAsync(file)).toThrow();
        // But there appears to be a bug in Alsatian.
        try {
            await readFileAsync(file);
            Expect(`testReadFileAsyncFail: reading ${file} succeeded but shouldn't have`).not.toBeTruthy();
        } catch (err) {
            debug(`testReadFileAsyncFail: reading ${file} failed as expected`);
        }
    }

    @AsyncTest("Test clang2wasm succeeds")
    public async testClang2wasmSuccess() {
        const inFile = "./utils/inc.c";
        let outFile = "<empty>";

        debug(`testC2wasmSuccess:+ ${inFile}`); 
        try {
            outFile = await clang2wasm(inFile);
            debug(`testC2wasmSuccess: ${inFile} to ${outFile}`);

            let stats = await statAsync(outFile);
            debug(`testC2wasmSuccess: stat ${outFile} stats=${JSON.stringify(stats)} done`);

            await unlinkAsync(outFile);
            debug(`testC2wasmSuccess: unlink ${outFile} done`);
        } catch (err) {
            Expect(`testC2wasmSuccess: error=${err}`).not.toBeTruthy(); // Always fail
        }

        debug(`testC2wasmSuccess:- ${inFile} to ${outFile}`);
    }

    //    @AsyncTest("Test tcCompile fails on non tbs file")
    //    public async testTcCompileFailsOnBadFile() {
    //        const inFile = "./utils/data.txt";
    //        const outFile = "./utils/tx1.wasm";
    //
    //        // TODO: This should work:
    //        //    Expect(async () => await tcCompile(inFile, outFile))).toThrow();
    //        try {
    //            await tcCompile(inFile, outFile);
    //            Expect(`testTcCompileFailsOnBadFile: ${inFile} to ${outFile} succeeded but shouldn't have`).not.toBeTruthy();
    //        } catch (err) {
    //            debug(`testTcCompileFailsOnBadFile: ${inFile} to ${outFile} failed as expected`);
    //        }
    //    }
    //
    //    @AsyncTest("Test tcCompile fails on non existent file")
    //    public async testTcCompileFailsOnNonExistentFile() {
    //        const inFile = "non-existent-file";
    //        const outFile = "./utils/tx2.wasm";
    //
    //        // TODO: This should work:
    //        //    Expect(async () => await tcCompile(inFile, outFile))).toThrow();
    //        try {
    //            await tcCompile(inFile, outFile);
    //            Expect(`testTcCompileFailsOnNonExistentFile: ${inFile} to ${outFile} Succeeded but shouldn't have`).not.toBeTruthy();
    //        } catch (err) {
    //            debug(`testTcCompileFailsOnNonExistentFile: ${inFile} to ${outFile} failed as expected`);
    //        }
    //    }
}
