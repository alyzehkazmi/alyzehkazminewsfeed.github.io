$(document).ready( function() {
	$("#post-form").submit((e)=>{
		e.preventDefault();
		console.log(e.target)
	})
})