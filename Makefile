cc=$(HOME)/prgs/llvmwasm/bin/clang
llc=$(HOME)/prgs/llvmwasm/bin/llc
s2wasm=$(HOME)/prgs/binaryen/bin/s2wasm
wasm-merge=$(HOME)/prgs/binaryen/bin/wasm-merge
wast2wasm=$(HOME)/prgs/wabt/out/clang/Debug/wast2wasm
wasm2wast=$(HOME)/prgs/wabt/out/clang/Debug/wasm2wast
wasm-link=$(HOME)/prgs/wabt/out/clang/Debug/wasm-link

outDir=out
srcDir=src
dstDir=$(outDir)/$(srcDir)

$(dstDir)/%.c.s: $(srcDir)/%.c
	mkdir -p $(outDir)/$(srcDir)
	$(cc) -emit-llvm --target=wasm32 -Oz $< -c -o $(dstDir)/$(notdir $<).bc
	$(llc) -asm-verbose=false $(dstDir)/$(notdir $<).bc -o $(dstDir)/$(notdir $<).s

$(dstDir)/%.c.wast: $(dstDir)/%.c.s
	$(s2wasm) --import-memory $< -o $@

$(dstDir)/%.c.main_wast: $(dstDir)/%.c.s
	$(s2wasm) $< -o $@

$(dstDir)/%.c.wasm: $(dstDir)/%.c.wast
	$(wast2wasm) $< -o $@
	
$(dstDir)/%.c.main_wasm: $(dstDir)/%.c.main_wast
	$(wast2wasm) $< -o $@
	
.PHONY: all, clean

all: $(dstDir)/addTwoInc.wasm

$(dstDir)/memory.c.s: $(srcDir)/memory.c
$(dstDir)/memory.c.main_wast: $(dstDir)/memory.s
$(dstDir)/memory.c.main_wasm: $(dstDir)/memory.main_wast

$(dstDir)/inc.c.s: $(srcDir)/inc.c
$(dstDir)/inc.c.wast: $(dstDir)/inc.c.s
$(dstDir)/inc.c.wasm: $(dstDir)/inc.c.wast

$(dstDir)/addTwo.c.s: $(srcDir)/addTwo.c
$(dstDir)/addTwo.c.wast: $(dstDir)/addTwo.c.s
$(dstDir)/addTwo.c.wasm: $(dstDir)/addTwo.c.wast

# Using memory.c to export a memory section causes an
# error "unsupport export type: 2"
$(dstDir)/addTwoInc.wasm: $(dstDir)/addTwo.c.wasm $(dstDir)/inc.c.wasm
	$(wasm-link) $^ -o $@
	$(wasm2wast) $@ -o $(basename $@).wast

clean:
	rm -rf $(outDir)

distclean: clean
	rm -rf node_modules
