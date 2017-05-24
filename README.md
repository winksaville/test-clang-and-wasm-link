# Test clang and wasm-merge
Uses clang to generate wasm32 code for addTwo.c and inc.c
and then uses wasm-link to merge the two generated wasm
files into addTwoInc.wasm.

Currently this just compiles there is no attempt to actually run
the results, this will be coming in the future :)

## Prerequisites
- Use [llvmwasm-builder](https://github.com/winksaville/llvmwasm-builder) to
build clang v5.0, webassembly/binaryen and wabt

## Build
```
make clean && make
```
