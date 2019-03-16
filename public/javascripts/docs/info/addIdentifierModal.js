$(function () {

	var docId = $("#addIdentifierBtn").data("doc_id");

	function reqListener() {
		if (JSON.parse(this.responseText).success) {
			window.location.href = '/docs/' + docId + '/info';
		}
	}

	function onclickSubmitBtn(event) {
		var form = document.getElementById('inputIdentifierForm');
		if (form.checkValidity()) {
			event.preventDefault();
			var formData = new FormData(form);
			var request = new XMLHttpRequest();
			request.onload = reqListener;
			request.open('POST', '/docs/' + docId + '/info/add/identifier', /* async = */ true);
			request.send(formData)
			submitBtn.setAttribute("disabled", "disabled")
		}
	};

	var submitBtn = document.getElementById('addIdentifierBtn');
	submitBtn.addEventListener('click', onclickSubmitBtn);
})

// request.onreadystatechange = function() { 
			// 	if (request.readyState == 4) {
			// 		if(request.status == 200) {
			// 			console.log(request.responseText)
			// 			var v = jQuery.parseJSON(request.responseText);
			// 			console.log(v.success);
			// 		}
			// 	}
			// }