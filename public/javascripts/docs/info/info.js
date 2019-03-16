$(function () {
	$(".show-edit-state span").on('click', function () {
		$(".edit-icon").prop({ 'hidden': false })
		$(".edit-icon-id").prop({ 'hidden': false })
		$(".hide-edit-state").prop({ 'hidden': false })
		$("#enableIdAddingBtn").prop({ 'hidden': false })
		$(".show-edit-state").hide()
	});

	$(".hide-edit-state span").on('click', function () {
		$(".edit-icon").prop({ 'hidden': true })
		$(".edit-icon-id").prop({ 'hidden': true })
		$(".hide-edit-state").prop({ 'hidden': true })
		$("#enableIdAddingBtn").prop({ 'hidden': true })
		$(".show-edit-state").show()
	});
})