# Test clang and wasm-merge
Uses clang to generate wasm32 code for addTwo.c and inc.c
and then uses wasm-link to merge the two generated wasm
files into addTwoInc.wasm.

Currently this just compiles there is no attempt to actually run
the results, this will be coming in the future :)

## Prerequisites
- Build clang v5.0, see [Using WebAssembly in LLVM](https://gist.github.com/yurydelendik/4eeff8248aeb14ce763e) into ~/prgs/llvmwasm.
Note: this took my desktop with 32GB of ram on linux my laptop with 16GB of ram wasn't enough.

- Build from source [wabt](https://github.com/WebAssembly/wabt) to
~/prgs/wabt. Don't for get to do a `git clone --recursive`

## Build
```
make clean && make
```
