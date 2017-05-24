	.text
	.file	"src/addTwo.c"
	.hidden	addTwo
	.globl	addTwo
	.type	addTwo,@function
addTwo:
	.param  	i32, i32
	.result 	i32
	i32.add 	$push0=, $1, $0
	.endfunc
.Lfunc_end0:
	.size	addTwo, .Lfunc_end0-addTwo


	.ident	"clang version 5.0.0 (trunk 303787) (llvm/trunk 303786)"
