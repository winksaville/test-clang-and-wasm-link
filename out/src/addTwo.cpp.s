	.text
	.file	"src/addTwo.cpp"
	.hidden	_ZN4Math6addTwoEii
	.globl	_ZN4Math6addTwoEii
	.type	_ZN4Math6addTwoEii,@function
_ZN4Math6addTwoEii:
	.param  	i32, i32
	.result 	i32
	i32.add 	$push0=, $1, $0
	.endfunc
.Lfunc_end0:
	.size	_ZN4Math6addTwoEii, .Lfunc_end0-_ZN4Math6addTwoEii


	.ident	"clang version 5.0.0 (trunk 303787) (llvm/trunk 303786)"
