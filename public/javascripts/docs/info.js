$(function () {

	var docId = $("#add-identifier-btn").data("doc_id");

	function reqListener(){
		if (JSON.parse(this.responseText).success) {
			window.location.href = '/docs/' + docId + '/info';
		}
	}
	
	function onclickSubmitBtn(event) {
		var form = document.getElementById('inputIdentifierForm');
		if (form.checkValidity()) {
			event.preventDefault();
			
			// Получение данных формы
			var formData = new FormData();
			formData.set("feature", $("#inputFeature").val())
			formData.set("identifier", $("#inputIdentifier").val())
			formData.set("remark", $("#inputRemark").val())
			
			var request = new XMLHttpRequest();
			request.onload = reqListener;
			request.open('POST', '/docs/' + docId + '/info', /* async = */ true);
			request.send(formData)
		}
	};

	var submitBtn = document.getElementById('add-identifier-btn');
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