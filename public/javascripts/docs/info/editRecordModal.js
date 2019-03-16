$(function () {
	// ОБРАБОТКА ФРЕЙМА "Срок рассмотрения материала"
	$("select[name=phase]").on('change', function () {
		if ($("select[name=phase] option:selected") && $(this).val() != "")
			$("input[id=phase_date").prop({ 'required': true, 'disabled': false });
		else
			$("input[id=phase_date").prop({ 'required': false, 'disabled': true });
	})

	// Статья УК
	var articleOption = $("#cc_article").data("article_option");
	$("#cc_article").find("option:contains('" + articleOption + "')").first().prop({ "selected": true });

	// Дата регистрации
	var registrationDate = $("#registrationDate").data("registration_date");
	$("#registrationDate").val(formatDate(registrationDate));

	// Принятие решения
	var decisionOption = $("#decision").data("decision_option");
	$("#decision").find("option:contains('" + decisionOption + "')").first().prop({ "selected": true });
	var decisionDate = $("#decisionDate").data("decision_date_value");
	$("#decisionDate").val(formatDate(decisionDate));

	// Срок рассмотрения материала
	setPhaseOption();
	setPhaseData();

	function formatDate(dateString) {
		var date = dateString.split(".")
		var newDate = date[2] + '-' + date[1] + '-' + date[0];
		return newDate;
	}

	function setPhaseOption() {
		if ($("#phase").data("phase_option"))
			$("#phase").find("option:contains('" + $("#phase").data("phase_option") + "')").first().prop({ "selected": true });
	}

	function setPhaseData() {
		if ($("#phase_date").data("phase_date_value")) {
			$("input[id=phase_date").prop({ 'required': true, 'disabled': false })
			$("#phase_date").val(formatDate($("#phase_date").data("phase_date_value")));
		}
	}

	// Работа с отправкой данных на сервер
	var docId = $("#editRecordBtn").data("doc_id");

	function toServerData(formatData) {
		for (var [key, value] of formatData.entries()) {
			if (key == "phase" || key == "phase_date") {
				if (!value) {
					formatData.delete(key);
				}
			}
		}
	};

	function reqListener() {
		if (JSON.parse(this.responseText).success) {
			window.location.href = '/docs/' + docId + '/info';
		}
	}

	function onclickSubmitBtn(event) {
		var form = document.getElementById('editRecordForm');
		if (form.checkValidity()) {
			event.preventDefault();
			var formData = new FormData(form);
			toServerData(formData);
			var request = new XMLHttpRequest();
			request.onload = reqListener;
			request.open('PUT', '/docs/' + docId + '/edit', /* async = */ true);
			request.send(formData)
		}
	};

	var submitBtn = document.getElementById('editRecordBtn');
	submitBtn.addEventListener('click', onclickSubmitBtn);

})