$(function () {
	// "use strict";

	// ОБРАБОТКА ФРЕЙМА "Срок рассмотрения материала"
	$("select[name=phase]").on('change', function () {
		if ($("select[name=phase] option:selected") && $(this).val() != "")
			$("input[id=phase_date").prop({ 'required': true, 'disabled': false });
		else
			$("input[id=phase_date").prop({ 'required': false, 'disabled': true });
	})


	// ОБРАБОТКА ДАТЫ ДЛЯ ПОЛЯ "Срок рассмотрения материала:" (дата регистрации + 10 дней)
	var regdate = " ";

	$(".registrationDate").change(function () {
		regdate = $(this).val();
		var correctDate = formatDate(addDays(regdate, 10));
		$(".deadline").text(correctDate + "");
	});

	function addDays(date, days) {
		var result = new Date(date);
		result.setDate(result.getDate() + days);
		return result;
	}

	function formatDate(date) {
		var day = date.getDate();
		var month = date.getMonth() + 1;
		return (day < 10 ? '0' : '') + day + '.' + (month < 10 ? '0' : '') + month + '.' + date.getFullYear();
	}

	// ОБРАБОТКА ФРЕЙМА "Идентификаторы"
	$('#addIdentifiersBtn').on('click', function () {
		addDynamicIdentifiers();
		return false;
	})

	function addDynamicIdentifiers() {
		disableAddButton();

		var div = $('<div/>', {
			'class': 'dynamicIdentifiers'
		}).appendTo($('.dynamicIdentifiersContainer'));
		var row = $('<div/>').addClass("form-group row").appendTo(div);

		var col = $('<div/>').addClass("col-md-5").appendTo(row);
		var selectFeature = $('<select/>', {
			type: 'text',
			'class': 'form-control',
			'id': 'feature',
			'name': 'feature',
			'required': 'true'
		}).appendTo(col);

		//Получение списка для признака идентификатора	
		$('<option/>', { value: "" }).html("Выберите признак...").appendTo(selectFeature);
		$('<option/>').html("Признак1").appendTo(selectFeature);
		$('<option/>').html("Признак2").appendTo(selectFeature);
		$('<option/>').html("Признак3").appendTo(selectFeature);


		col = $('<div/>').addClass("col-md-7").appendTo(row);
		var input = $('<input/>', {
			type: 'text',
			'class': 'form-control',
			'id': 'identifier',
			'name': 'identifier',
			'placeholder': 'Идентификатор',
			'required': 'true'
		}).appendTo(col);

		row = $('<div/>').addClass("form-group row").appendTo(div);
		col = $('<div/>').addClass("col-md-10 mb-4").appendTo(row);
		var textarea = $('<textarea/>', {
			'id': 'remark',
			rows: '2',
			'class': 'form-control',
			'name': 'remark',
			'placeholder': 'Примечание',
			'area-label': 'Примечание',
			'value': ""
		}).appendTo(col);

		col = $('<div/>').addClass("col-md-2").appendTo(row);

		var removeBtn = $('<button/>', {
			value: 'Удаление',
			type: 'button',
			'id': 'removeIdentfiersBtn',
			'class': 'btn btn-danger btn-sm btn-block'
		}).html("Удалить").appendTo(col);

		removeBtn.click(function () {
			$(this).closest("div.dynamicIdentifiers").remove();
			enableAddButton();
		});
	}

	function disableAddButton() {
		$('#addIdentifiersBtn').prop('disabled', true);
	}

	function enableAddButton() {
		$('#addIdentifiersBtn').prop('disabled', false);
	}


	// Обработка формы и ее отправление на сервер

	function toServerData(formatData) {
		console.log("CLIENT")
		for (var [key, value] of formatData.entries()) {
			if (key == "phase" || key == "phase_date") {
				if (!value)
					formatData.delete(key);
			}
		}
	};

	function reqListener() {
		if (JSON.parse(this.response).success) {
			window.location.href = '/docs/all';
		}
	}

	function onclickSubmitBtn(event) {
		var form = document.getElementById('inputForm');
		if (form.checkValidity()) {
			event.preventDefault();
			var formData = new FormData(form);
			toServerData(formData);
			var request = new XMLHttpRequest();
			request.onload = reqListener;
			request.open('POST', '/docs/new/', /* async = */ true);
			request.send(formData)
		}
	};

	var submitBtn = document.getElementById('add_record_btn');
	submitBtn.addEventListener('click', onclickSubmitBtn);
});