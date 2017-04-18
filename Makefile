cc=$(HOME)/prgs/llvmwasm/bin/clang
llc=$(HOME)/prgs/llvmwasm/bin/llc
s2wasm=$(HOME)/prgs/binaryen/bin/s2wasm
wasm-merge=$(HOME)/prgs/binaryen/bin/wasm-merge
wast2wasm=$(HOME)/prgs/wabt/out/clang/Debug/wast2wasm
wasm2wast=$(HOME)/prgs/wabt/out/clang/Debug/wasm2wast

#%.wasm: %.c
#	$(cc) -emit-llvm --target=wasm32 -Oz $< -c -o $(basename $<).bc
#	$(llc) -asm-verbose=false $(basename $<).bc -o $(basename $<).s
#	#$(s2wasm) --import-memory $(basename $<).s > $(basename $<).wast
#	$(s2wasm) $(basename $<).s > $(basename $<).wast
#	$(wast2wasm) $(basename $<).wast -o $@

%.s: %.c
	$(cc) -emit-llvm --target=wasm32 -Oz $< -c -o $(basename $<).bc
	$(llc) -asm-verbose=false $(basename $<).bc -o $(basename $<).s

%.wast: %.s
	$(s2wasm) --import-memory $< > $@

%.main_wast: %.s
	$(s2wasm) $< $@

%.wasm: %.wast
	$(wast2wasm) $< -o $@
	
%.main_wasm: %.main_wast
	$(wast2wasm) $< -o $@
	
all: addTwoInc.wasm

memory.s: memory.c
memory.main_wast: memory.s
memory.main_wasm: memory.main_wast

inc.s: inc.c
inc.wast: inc.s
inc.wasm: inc.wast

addTwo.s: addTwo.c
addTwo.wast: addTwo.s
addTwo.wasm: addTwo.wast

# Using memory.c to export a memory section causes an
# error "unsupport export type: 2"
#addTwoInc.wasm: memory.main_wasm addTwo.wasm inc.wasm
addTwoInc.wasm: addTwo.wasm inc.wasm
	$(wasm-merge) $^ -o $@
	$(wasm2wast) $@ -o $(basename $@).wast

clean:
	rm -f *.s *.bc *wasm *wast
