import * as path from "path";
import * as fs from "fs";
import * as child from "child_process";
import * as os from "os";

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
    let wast2wasmPath = path.join(os.homedir(),"prgs", "wabt", "out", "clang","Debug", "wast2wasm");

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
    let wasm2wastPath = path.join(os.homedir(),"prgs", "wabt", "out", "clang","Debug", "wasm2wast");

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
 * clang2wasm
 *
 * @param inputPath to a c file
 * @param optional outDir path, if none path.dirname(inputPath)
 * @param optional tempDir path, if none path.dirname(inputPath)
 * @return outputPath as Promise<string>
 * @throws Error(string)
 */
export async function clang2wasm(inputPath: string, outDir?: string, tempDir?: string):
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
 * clang2Instance
 *
 * @param inputPath to a c file
 * @param optional outDir path, if none path.dirname(inputPath)
 * @param optional tempDir path, if none path.dirname(inputPath)
 * @return Promise<WebAssembly.instance>
 * @throws Error(string)
 */
export async function clang2instance(inputPath: string, outDir?: string, tempDir?: string):
Promise<WebAssembly.Instance> {
    let dirName = path.dirname(inputPath);
    if (!outDir) outDir = dirName;
    if (!tempDir) tempDir = dirName;

    let outPath = await clang2wasm(inputPath, outDir, tempDir);
    return await instantiateWasmFile(outPath);
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
                    return reject(new Error(`unlinkAsync: path=${path} err=${unlinkErr}`));
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
 * Instatnitate a Wasm File
 *
 * @param filePath is path to the file to instantiate
 * @return WebAssembly.Instance
 * @throws Error(string)
 */
export async function instantiateWasmFile(filePath: string): Promise<WebAssembly.Instance> {
    // Read the file
    let data = await readFileAsync(filePath);

    // Compile
    let mod = await WebAssembly.compile(data);

    // Instantiate:
    let instance = await WebAssembly.instantiate(mod);

    return instance;
}
