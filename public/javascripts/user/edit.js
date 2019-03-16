$(function () {
	// Статья УК
	var departmentOption = $("#department").data("department_option");
	$("#department").find("option:contains('" + departmentOption + "')").first().prop({ "selected": true });

	// Работа с отправкой данных на сервер
	var userId = $("#editUserBtn").data("user_id");

	function reqListener() {
		if (JSON.parse(this.responseText).success) {
			window.location.href = '/user/' + JSON.parse(this.responseText).user[0].id + '/profile';
		}
	}

	function onclickSubmitBtn(event) {
		var form = document.getElementById('editProfileForm');
		if (form.checkValidity()) {
			event.preventDefault();
			var formData = new FormData(form);
			var request = new XMLHttpRequest();
			request.onload = reqListener;
			request.open('PUT', '/user/' + userId + '/profile/edit', /* async = */ true);
			request.send(formData)
			submitBtn.setAttribute("disabled", "disabled")
		}
	};

	var submitBtn = document.getElementById('editUserBtn');
	submitBtn.addEventListener('click', onclickSubmitBtn);

})