import * as path from "path";
import * as fs from "fs";
import * as child from "child_process";
import * as os from "os";

/**
 * Stat a file
 *
 * @param path to file
 * @return stats: fs.Stats
 * @throws Error(string)
 */
export function statAsync(path: string): Promise<fs.Stats> {
    return new Promise<fs.Stats>((resolve, reject) => {
        fs.stat(path, (statErr: NodeJS.ErrnoException, stats: fs.Stats) => {
            if (statErr) {
                return reject(new Error(`statAsync: path=${path} err=${statErr}`));
            }
            return resolve(stats);
        });
    });
}

/**
 * Use unlink a file
 *
 * @param path to file
 * @param throwOnErr a boolean which throws an error
 * @return path as Promise<string>
 * @throws Error(string)
 */
export function unlinkAsync(path: string, throwOnErr?: boolean): Promise<string> {
    try {
        return new Promise<string>((resolve, reject) => {
            fs.unlink(path, (unlinkErr) => {
                if (unlinkErr && throwOnErr) {
                    return reject(
                        new Error(`unlinkAsync: path=${path} err=${unlinkErr}`));
                }
                return resolve(path);
            });
        });
    } catch (ex) {
        if (throwOnErr) {
            return Promise.reject(new Error(`unlinkAsync: err=${ex}`));
        } else {
            return Promise.resolve(path);
        }
    }
}

/**
 * Read the file and return a Uint8Array
 *
 * @param filePath is the path to the input file
 * @return data: Uint8Array
 * @throws Error(string)
 */
export function readFileAsync(filePath: string): Promise<Uint8Array> {
    return new Promise<Uint8Array>((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                return reject(new Error(`readFileAsync: filePath=${filePath} err=${err}`));
                //return reject(`shit`);
                //throw new Error(`readFileAsync: filePath=${filePath} err=${err}`);
            } else {
                return resolve(new Uint8Array(data));
            }
        });
    });
}

/**
 * Compile bc to s
 *
 * @param inputPath is the input file
 * @param outputPath is the output file
 * @return outputPath as Promise<string>
 * @throws Error(string)
 */
export function bc2s(inputPath: string, outputPath:string): Promise<string> {
    let llcPath = path.join(os.homedir(),"prgs", "llvmwasm", "bin", "llc");

    let llc = child.spawn(llcPath,
        [ "-asm-verbose=false", inputPath, "-o", outputPath ], { shell: true });
    return new Promise<string>((resolve, reject) => {
        llc.on("close", (code) => {
            if (code !== 0) {
                return reject(new Error(`llc2s: inputPath=${inputPath} outputPath=${outputPath} code=${code}`));
            } else {
                return resolve(outputPath);
            }
        });
    });
}

/**
 * Compile s to wasm
 *
 * @param inputPath is the input file
 * @param outputPath is the output file
 * @return outputPath as Promise<string>
 * @throws Error(string)
 */
export function s2wasm(inputPath: string, outputPath:string): Promise<string> {
    let s2wasmPath = path.join(os.homedir(),"prgs", "binaryen", "bin", "s2wasm");

    let s2w = child.spawn(s2wasmPath,
        [ inputPath, "-o", outputPath ], { shell: true });
    return new Promise<string>((resolve, reject) => {
        s2w.on("close", (code) => {
            if (code !== 0) {
                return reject(new Error(`s2wasm: inputPath=${inputPath} outputPath=${outputPath} code=${code}`));
            } else {
                return resolve(outputPath);
            }
        });
    });
}

/**
 * Compile wast to wasm
 *
 * @param inputPath is the input file
 * @param outputPath is the output file
 * @return outputPath as Promise<string>
 * @throws Error(string)
 */
export function wast2wasm(inputPath: string, outputPath:string): Promise<string> {
    let wast2wasmPath = path.join(os.homedir(),"prgs", "wabt", "out", "clang", "Debug", "wast2wasm");

    let w2w = child.spawn(wast2wasmPath,
        [ inputPath, "-o", outputPath ], { shell: true });
    return new Promise<string>((resolve, reject) => {
        w2w.on("close", (code) => {
            if (code !== 0) {
                return reject(new Error(`wast2wasm: inputPath=${inputPath} outputPath=${outputPath} code=${code}`));
            } else {
                return resolve(outputPath);
            }
        });
    });
}

/**
 * Compile wasm to wast
 *
 * @param inputPath is the input file
 * @param outputPath is the output file
 * @return outputPath as Promise<string>
 * @throws Error(string)
 */
export function wasm2wast(inputPath: string, outputPath:string): Promise<string> {
    let wasm2wastPath = path.join(os.homedir(),"prgs", "wabt", "out", "clang", "Debug", "wasm2wast");

    let w2w = child.spawn(wasm2wastPath,
        [ inputPath, "-o", outputPath ], { shell: true });
    return new Promise<string>((resolve, reject) => {
        w2w.on("close", (code) => {
            if (code !== 0) {
                return reject(new Error(`wast2wasm: inputPath=${inputPath} outputPath=${outputPath} code=${code}`));
            } else {
                return resolve(outputPath);
            }
        });
    });
}

/**
 * Merge wasm files
 *
 * @param inputPaths is an array of input wasm files
 * @param outputPath is the output file
 * @return outputPath as Promise<string>
 * @throws Error(string)
 */
export function wasm_merge(inputPaths: string[], outputPath:string): Promise<string> {
    let mergerPath = path.join(os.homedir(),"prgs", "binaryen", "bin", "wasm-merge");

    let merger = child.spawn(mergerPath,
        inputPaths.concat(["-o", outputPath ]), { shell: true });
    return new Promise<string>((resolve, reject) => {
        merger.on("close", (code) => {
            if (code !== 0) {
                return reject(new Error(`wast2wasm: inputPaths=${inputPaths} outputPath=${outputPath} code=${code}`));
            } else {
                return resolve(outputPath);
            }
        });
    });
}

/**
 * Compile wasm to WebAssembly.Module
 *
 * @param wasmFilePath is path to the file to instantiate
 * @return WebAssembly.Module
 * @throws Error(string)
 */
export async function wasm2WasmModule(wasmFilePath: string):
Promise<WebAssembly.Module> {
    let data = await readFileAsync(wasmFilePath);
    return await WebAssembly.compile(data);
}

/**
 * WebAssembly.Module to WebAssembly.Instance
 *
 * @param mod is a WebAssembly.Module to instantiate
 * @param imports is an optional parameter of the imports needed by the module
 * @return WebAssembly.Instance
 * @throws Error(string)
 */
export async function module2WasmInstance(mod: WebAssembly.Module, imports?: any):
Promise<WebAssembly.Instance> {
    return await WebAssembly.instantiate(mod, imports);
}

/**
 * Use clang to compile code to bc
 *
 * @param inputPath is the input file
 * @param outputPath is the output file
 * @return outputPath as Promise<string>
 * @throws Error(string)
 */
export function clang2bc(inputPath: string, outputPath:string): Promise<string> {
    let compilerPath = path.join(os.homedir(),"prgs", "llvmwasm", "bin", "clang");

    let compiler = child.spawn(compilerPath,
        [ "-emit-llvm", "--target=wasm32", "-Oz", inputPath, "-c", "-o", outputPath ], { shell: true });
    return new Promise<string>((resolve, reject) => {
        compiler.on("close", (code) => {
            if (code !== 0) {
                return reject(new Error(`clang2bc: inputPath=${inputPath} outputPath=${outputPath} code=${code}`));
            } else {
                return resolve(outputPath);
            }
        });
    });
}

/**
 * clang2wasm
 *
 * @param inputPath to a c file
 * @param optional outDir path, if none path.dirname(inputPath)
 * @param optional tempDir path, if none path.dirname(inputPath)
 * @return outputPath as Promise<string>
 * @throws Error(string)
 */
export async function clang2wasm(
    inputPath: string, outDir?: string, tempDir?: string):
Promise<string> {
    let fileName = path.basename(inputPath);
    let dirName = path.dirname(inputPath);
    if (!outDir) outDir = dirName;
    if (!tempDir) tempDir = dirName;

    let bcPath = await clang2bc(inputPath, path.join(tempDir, `${fileName}.bc`));
    let sPath = await bc2s(bcPath, path.join(tempDir, `${fileName}.s`));
    let wastPath = await s2wasm(sPath, path.join(outDir, `${fileName}.wast`));
    return await wast2wasm(wastPath, path.join(outDir, `${fileName}.wasm`));
}

/**
 * Compile a C file to a WebAssembly.Module using clang
 *
 * @param inputPath to a c file
 * @param optional outDir path, if none path.dirname(inputPath)
 * @param optional tempDir path, if none path.dirname(inputPath)
 * @return Promise<WebAssembly.Module>
 * @throws Error(string)
 */
export async function clang2WasmModule(
    inputPath: string, outDir?: string, tempDir?: string):
Promise<WebAssembly.Module> {
    let wasmFile = await clang2wasm(inputPath, outDir, tempDir);
    return await wasm2WasmModule(wasmFile);
}

/**
 * Compile a C file to a WebAssembly.Instance using clang
 *
 * @param inputPath to a c file
 * @param optional imports for the module
 * @param optional outDir path, if none path.dirname(inputPath)
 * @param optional tempDir path, if none path.dirname(inputPath)
 * @return Promise<WebAssembly.Instance>
 * @throws Error(string)
 */
export async function clang2WasmInstance(
    inputPath: string, imports?: any, outDir?: string, tempDir?: string):
Promise<WebAssembly.Instance> {
    let mod = await clang2WasmModule(inputPath, outDir, tempDir);
    return await module2WasmInstance(mod, imports);
}


/**
 * Display a modules export array
 *
 * @param mod is a WebAssembly module to display the exports
 * @param s is a sting to print on the first line
 */
export function displayWasmModuleExports(mod: WebAssembly.Module, prompt?: string) {
    let exports = WebAssembly.Module.exports(mod);
    console.log(`${prompt ? prompt + " " : "" }length=${exports.length}`);
    for (let i in exports) {
        let v = exports[i];
        console.log(`${prompt ? prompt : ""}[${i}] name=${v.name} kind=${v.kind}`);
    }
}

/**
 * Display a modules import array
 *
 * @param prompt is a sting to print on the first line
 * @param mod is a WebAssembly module to display the exports
 */
export function displayWasmModuleImports(mod: WebAssembly.Module, prompt?: string) {
    let imports = WebAssembly.Module.imports(mod);
    console.log(`${prompt ? prompt + " " : "" }length=${imports.length}`);
    for (let i in imports) {
        let v = imports[i];
        console.log(`${prompt ? prompt : ""}[${i}] name=${v.name} kind=${v.kind}`);
    }
}
