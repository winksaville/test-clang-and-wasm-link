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
        let data: Uint8Array;

        await Expect(async () => {
            data = await readFileAsync("./utils/data.txt")
        }).not.toThrowAsync();

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
        await Expect(() => readFileAsync("non-existent-file")).toThrowAsync();
    }

    @AsyncTest("Test clang2wasm succeeds")
    public async testClang2wasmSuccess() {
        const inFile = "./utils/ok.c";
        let outFile: string;

        debug(`testC2wasmSuccess:+ ${inFile}`);

        await Expect(async () => {
            outFile = await clang2wasm("./utils/ok.c");
        }).not.toThrowAsync({
            onOk: () => debug("Successfully compiled"),
            onErr: () => debug("Failed to compile")
        });

        debug(`testC2wasmSuccess:- ${inFile} to ${outFile}`);
    }

    @AsyncTest("Test clang2wasm fails on bad c file")
    public async testClang2wasmFailsOnBadFile() {
        await Expect(() => clang2wasm("./utils/bad.c")).toThrowAsync();
    }

    @AsyncTest("Test clang2wasm fails on non existent file")
    public async testClang2wasmFailsOnNonExistentFile() {
        await Expect(() => clang2wasm("non-existent-file")).toThrowAsync({
            onErr: () => debug("Succeeded but shoudn't have"),
            onOk: () => debug("Failed as expected")
        });
    }
}
