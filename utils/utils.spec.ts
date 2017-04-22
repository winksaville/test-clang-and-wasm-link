/**
 * Test Utils
 */
import * as path from "path";

import hookStdOut = require("intercept-stdout");

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
    wast2wasm,
    wasm2WasmModule,
    clang2wasm,
    clang2WasmModule,
    clang2WasmInstance,
    module2WasmInstance,
    displayWasmModuleExports,
    displayWasmModuleImports,
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
        let data = new Uint8Array(0);

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
        let outFile = "<empty>";

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

        let mod: WebAssembly.Module;
        await Expect(async () => {
            mod = await wasm2WasmModule(wasmFile);
        }).not.toThrowAsync();

        let inst: WebAssembly.Instance;
        await Expect(async () => {
            inst = await module2WasmInstance(mod);
        }).not.toThrowAsync();

        if (inst) {
            Expect(inst.exports.inc(1)).toBe(2);
        } else {
            Expect('testInstantiateWasmFile: inst is not defined').not.toBeTruthy();
        }
    }

    @TestCase("./utils/inc.c")
    @AsyncTest("test clang2WasmInstance")
    public async testClang2Wasminstance(filePath: string) {
        let inst: WebAssembly.Instance;
        await Expect(async () => {
            inst = await clang2WasmInstance(filePath);
        }).not.toThrowAsync();

        if (inst) {
            Expect(inst.exports.inc(1)).toBe(2);
        } else {
            Expect('testClang2instance: inst is not defined').not.toBeTruthy();
        }
    }

    @TestCase("./utils/getNumberAndInc.c")
    @AsyncTest("test display WasmModule imports and imports")
    public async testDisplayWasmModuleImportsAndExports(filePath: string) {
        let fileName = path.basename(filePath);
        let dirName = path.dirname(filePath);

        let mod: WebAssembly.Module;
        await Expect(async () => {
            mod = await clang2WasmModule(filePath);
        }).not.toThrowAsync();

        let logs: string[] = [];
        let unhookStdOut = hookStdOut((s: string) => {
            logs.push(s.trim());
        });
        try {
            displayWasmModuleExports(mod);
            displayWasmModuleImports(mod);
        } catch (err) {
            <void>err;
        } finally {
            unhookStdOut();
        }

        Expect(logs.length).toBe(5);
        Expect(logs[0]).toBe("length=2");
        Expect(logs[1]).toBe("[0] name=memory kind=memory");
        Expect(logs[2]).toBe("[1] name=getNumberAndInc kind=function");
        Expect(logs[3]).toBe("length=1");
        Expect(logs[4]).toBe("[0] name=getNumber kind=function");
    }
}
