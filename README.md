# Test clang and wasm-merge
Uses clang to generate wasm32 code for addTwo.c and inc.c
and then uses wasm-merge to merge the two generated wasm
files into addTwoInc.wasm.

## Prerequisites
- Build clang v5.0, see [Using WebAssembly in LLVM](https://gist.github.com/yurydelendik/4eeff8248aeb14ce763e) into ~/prgs/llvmwasm.
Note: this took my desktop with 32GB of ram on linux my laptop with 16GB of ram wasn't enough.

- Build the do-not-require-memoryBaseGlobals-or-tableBaseGlobals branch from
source [winksaville/binaryen](https://github.com/winksaville/binaryen)
to ~/prgs/binaryen.

- Build from source [wabt](https://github.com/WebAssembly/wabt) to
~/prgs/wabt. Don't for get to do a `git clone --recursive`

- yarn

## Initialize
```
yarn
yarn initialize
```

## Test merge
This tests wasm-merge of addTwo.c and inc.c to addTwoInc.wasm
```
yarn test:merge
```

## Test utils
Utils is added to be able to compile and run wasm code.
The current incarnation allows running the stages of
clang to wasm compiliation using node and are async wrappers.
Its a firt pass and will change significantly and I'll probably
move it into one or more npm libraries to make it available
to others, we'll see.
```
$ yarn test:utils
```
or
```
$ yarn test:utils.dbg
```

## What I learned about linking/merging
My original [test](https://github.com/winksaville/test-emcc-and-wasm-link) used
emcc and wasm-link that required modifing the generated code to get it to
create addTwoInc.wasm. Turns out I needed to modify binaryen but it seems
a better solution moving forward.

## The results are:
```
$ make clean && make
rm -f *.s *.bc *wasm *wast
/home/wink/llvmwasm/bin/clang -emit-llvm --target=wasm32 -Oz addTwo.c -c -o addTwo.bc
/home/wink/llvmwasm/bin/llc -asm-verbose=false addTwo.bc -o addTwo.s
s2wasm --import-memory addTwo.s > addTwo.wast
wast2wasm addTwo.wast -o addTwo.wasm
/home/wink/llvmwasm/bin/clang -emit-llvm --target=wasm32 -Oz inc.c -c -o inc.bc
/home/wink/llvmwasm/bin/llc -asm-verbose=false inc.bc -o inc.s
s2wasm --import-memory inc.s > inc.wast
wast2wasm inc.wast -o inc.wasm
wasm-merge addTwo.wasm inc.wasm -o addTwoInc.wasm
wasm2wast addTwoInc.wasm -o addTwoInc.wast
```
And the `merged` result is
```
$ cat addTwoInc.wast
(module
  (type (;0;) (func (param i32 i32) (result i32)))
  (type (;1;) (func (param i32 i32) (result i32)))
  (type (;2;) (func (param i32) (result i32)))
  (import "env" "memory" (memory (;0;) 1))
  (func (;0;) (type 0) (param i32 i32) (result i32)
    block i32  ;; label = @1
      get_local 1
      get_local 0
      i32.add
    end)
  (func (;1;) (type 2) (param i32) (result i32)
    block i32  ;; label = @1
      get_local 0
      i32.const 1
      call 0
    end)
  (table (;0;) 0 anyfunc)
  (export "addTwo" (func 0))
  (export "inc" (func 1))
  (elem))
```

## The `addTwoInc.wasm` has NOT been tested
