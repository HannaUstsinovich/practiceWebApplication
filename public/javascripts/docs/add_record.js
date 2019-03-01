$(function () {
	// "use strict";

	// ОБРАБОТКА ФРЕЙМА "Срок рассмотрения материала"
	var dateField1 = $('<div class="input-group input-group-sm col-md-3 mb-2">')
		.append('<input type="date" class="form-control period" id="dateField1" name="phase_date" required>');
	var dateField2 = $('<div class="input-group input-group-sm col-md-3 mb-2">')
		.append('<input type="date" class="form-control period" id="dateField2" name="phase_date" required>');
	var dateField3 = $('<div class="input-group input-group-sm col-md-3 mb-2">')
		.append('<input type="date" class="form-control period" id="dateField3" name="phase_date" required>');

	var dateFieldArray = [dateField1, dateField2, dateField3];
	var phaseID = ["phaseExtended", "phaseSuspended", "phaseRenewed"];

	$('.custom-control-label').on('click', function () {
		for (var i = 0; i < phaseID.length; i++) {
			if ($(this).attr("id") == phaseID[i]) {
				$(this).closest("div.row").append(dateFieldArray[i]);
			}
			else {
				$(dateFieldArray[i]).find("input").val("");
				$(dateFieldArray[i]).remove();
			}
		}
	});


	// ОБРАБОТКА ДАТЫ ДЛЯ ПОЛЯ "Срок рассмотрения материала:" (дата регистрации + 10 дней)
	var regdate = " ";

	$(".registrationDate").change(function () {
		regdate = $(this).val();
		var correctDate = formatDate(addDays(regdate, 10));
		$(".deadline").text(correctDate + " ");
	});

	function addDays(date, days) {
		var result = new Date(date);
		result.setDate(result.getDate() + days);
		return result;
	}

	function formatDate(date) {
		return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear();
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
		var select = $('<select/>', {
			type: 'text',
			'class': 'form-control',
			'id': 'feature',
			'name': 'feature',
			'required': 'true'
		}).appendTo(col);

		$('<option/>', { value: "" }).html("Выберите признак...").appendTo(select);
		$("<option/>").html("Признак1").appendTo(select);
		$("<option/>").html("Признак2").appendTo(select);
		$("<option/>").html("Признак3").appendTo(select);

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

});