$(function () {
	// "use strict";

	function reqListener() {
		if (JSON.parse(this.response).success) {
			window.location.href = '/user/' + JSON.parse(this.response).user[0].id + '/profile';
		}
	}

	function onclickSubmitBtn(event) {
		var form = document.getElementById('addUserForm');
		if (form.checkValidity()) {
			event.preventDefault();
			var formData = new FormData(form);
			var request = new XMLHttpRequest();
			request.onload = reqListener;
			request.open('POST', '/settings/user/add', /* async = */ true);
			request.send(formData)
			submitBtn.setAttribute("disabled", "disabled")
		}
	};

	var submitBtn = document.getElementById('addUserBtn');
	submitBtn.addEventListener('click', onclickSubmitBtn);
});