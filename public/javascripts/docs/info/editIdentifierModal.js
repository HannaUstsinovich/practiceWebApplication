$(function () {
	var identId;

	// Обработка предзаполнения идентификатора в модальном окне
	$(".edit-icon-id").each(function (index) {
		$(this).on('click', function () {
			var featureOption = $("#featureSetter" + index).data("feature_option");
			// console.log(featureOption + "")
			$("#editFeature").find("option:contains('" + featureOption + "')").first().prop({ "selected": true });
			var identifierValue = $("#identifierSetter" + index).data("identifier_value");
			$("#editIdentifier").val(identifierValue + "");
			identId = $(".identifier-block" + index).data("get_id");
			if ($("#remarkSetter" + index).data("remark_value"))
				$("#editRemark").val($("#remarkSetter" + index).data("remark_value") + "");
			else
				$("#editRemark").val("");
		})
	})

	// Работа с отправкой данных на сервер
	var docId = $("#editIdentifierBtn").data("doc_id");

	function reqListener() {
		if (JSON.parse(this.responseText).success) {
			window.location.href = '/docs/' + docId + '/info';
		}
	}

	function onclickSubmitBtn(event) {
		var form = document.getElementById('editIdentifierForm');
		if (form.checkValidity()) {
			event.preventDefault();
			var formData = new FormData(form);
			var request = new XMLHttpRequest();
			request.onload = reqListener;
			request.open('PUT', '/docs/' + docId + '/edit/' + identId + '/identifier', /* async = */ true);
			request.send(formData)
		}
	};

	var submitBtn = document.getElementById('editIdentifierBtn');
	submitBtn.addEventListener('click', onclickSubmitBtn);
})