/**
 * Test Utils
 */

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
        let succeeded: boolean;

        // TODO: This should work:
        //    await Expect(() => readFileAsync(file)).toThrowAsync();
        try {
            await readFileAsync(file);
            succeeded = true; // Should not happen
        } catch (err) {
            succeeded = false; // Expected to fail
        }
        debug(`testReadFileAsyncFail: reading ${file} ${succeeded ? "succeeded but shouldn't have" : "failed as expected"}`);
        Expect(succeeded).not.toBeTruthy();
    }

    @AsyncTest("Test clang2wasm succeeds")
    public async testClang2wasmSuccess() {
        const inFile = "./utils/ok.c";
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

    @AsyncTest("Test clang2wasm fails on bad c file")
    public async testClang2wasmFailsOnBadFile() {
        const inFile = "./utils/bad.c";
        let outFile = "<empty>";
        let succeeded: boolean;

        // TODO: This should work:
        //    await Expect(outFile = (): string => {return clang2wasm(inFile)})).toThrowAsync();
        try {
            outFile = await clang2wasm(inFile);
            succeeded = true; // Should not happen
        } catch (err) {
            succeeded = false; // Expected to fail
        }
        debug(`testClang2wasmFailsOnBadFile: ${inFile} to ${outFile} ${succeeded ? "succeeded but shouldn't have" : "failed as expected"}`);
        Expect(succeeded).not.toBeTruthy();
    }

    @AsyncTest("Test clang2wasm fails on non existent file")
    public async testClang2wasmFailsOnNonExistentFile() {
        const inFile = "non-existent-file";
        let outFile = "<empty>";
        let succeeded: boolean;

        try {
            outFile = await clang2wasm(inFile);
            succeeded = true; // Should not happen
        } catch (err) {
            succeeded = false; // Expeced to fail
        }
        debug(`testClang2wasmFailsOnNonExistentFile: ${inFile} to ${outFile} ${succeeded ? "succeeded but shouldn't have" : "failed as expected"}`);
        Expect(succeeded).not.toBeTruthy();
    }
}
