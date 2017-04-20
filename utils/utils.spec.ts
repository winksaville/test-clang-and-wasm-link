/**
 * Test Utils
 */

import {
    AsyncTest,
    Expect,
    SetupFixture,
    TeardownFixture,
    TestCase,
    TestFixture,
} from "alsatian";

import {
    readFileAsync,
    clang2instance,
    clang2wasm,
    instantiateWasmFile,
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
            onOk: () => debug("testClang2wasmSuccess: clang2wasm successfully compiled"),
            onErr: () => debug("testClang2wasmSuccess: clang2wasm failed to compile")
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
            onErr: () => debug("testClang2wasmFailOnNonExistentFile: clang2wasm succeeded but shoudn't have"),
            onOk: () => debug("testClang2wasmFailOnNonExistentFile: clant2wasm failed as expected"),
        });
    }

    @TestCase("./utils/inc.c")
    @AsyncTest("test instantiateWasmFile")
    public async testInstantiateWasmFile(filePath: string) {
        let wasmFile: string;

        await Expect(async () => {
            wasmFile = await clang2wasm(filePath);
        }).not.toThrowAsync();

        let inst: WebAssembly.Instance;
        await Expect(async () => {
            inst = await instantiateWasmFile(wasmFile);
        }).not.toThrowAsync();

        Expect(inst.exports.inc(1)).toBe(2);
    }

    @TestCase("./utils/inc.c")
    @AsyncTest("test clang2instance")
    public async testClang2instance(filePath: string) {
        let inst: WebAssembly.Instance;
        await Expect(async () => {
            inst = await clang2instance(filePath);
        }).not.toThrowAsync();

        Expect(inst.exports.inc(1)).toBe(2);
    }
}
