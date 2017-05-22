	.text
	.file	"src/inc.c"
	.hidden	inc
	.globl	inc
	.type	inc,@function
inc:
	.param  	i32
	.result 	i32
	i32.const	$push0=, 1
	i32.call	$push1=, addTwo@FUNCTION, $0, $pop0
	.endfunc
.Lfunc_end0:
	.size	inc, .Lfunc_end0-inc


	.ident	"clang version 5.0.0 (trunk 300422)"
	.functype	addTwo, i32, i32, i32
