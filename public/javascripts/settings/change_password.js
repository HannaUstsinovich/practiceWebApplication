$(function () {
	// Обработка формы и ее отправление на сервер

	if ($("#changePasswordBtn").data("user_id"))
		var userId = $("#changePasswordBtn").data("user_id");

	function reqListener() {
		if (JSON.parse(this.response).success) {
			window.location.href = '/settings';
		}
	}

	function showError(container, errorMessage) {
		container.classList.add('error');
		var msgElem = document.createElement('small');
		msgElem.classList.add("error-message");
		msgElem.innerHTML = errorMessage;
		container.appendChild(msgElem);
	}

	function resetError(container) {
		container.classList.remove('error');
		if (container.lastChild.className == "error-message") {
			container.removeChild(container.lastChild);
		}
	}

	function validate(form) {
		var elems = form.elements;
		resetError(elems.password.parentNode);
		resetError(elems.password2.parentNode);
		if (elems.password.value.length < 5) {
			showError(elems.password.parentNode, ' Пароль должен содержать минимум 5 символов.');
			return false
		} else if (elems.password.value != elems.password2.value) {
			showError(elems.password2.parentNode, ' Пароли не совпадают.');
			return false
		}
		return true
	}

	function onclickSubmitBtn(event) {
		var form = document.getElementById('inputForm');
		if (validate(form)) {
			event.preventDefault();
			var formData = new FormData();
			formData.append("password", $("#newPassword").val())
			var request = new XMLHttpRequest();
			request.onload = reqListener;
			if (userId) {
				console.log("Id: " + userId)
				request.open('PUT', '/settings/user/' + userId + '/change_password', /* async = */ true);
			}
			else
				request.open('PUT', '/settings/user/change_password', /* async = */ true);
			request.send(formData)
		}
	};

	var submitBtn = document.getElementById('changePasswordBtn');
	submitBtn.addEventListener('click', onclickSubmitBtn);
});