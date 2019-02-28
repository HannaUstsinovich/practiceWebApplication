$(function(){
	//Получение списка принятия решения
		var  selectDecision = $("#decision");
		$('<option/>').html("Отказано в возбуждении дела").appendTo(selectDecision);
		$('<option/>').html("Прекращена проверка по делу").appendTo(selectDecision);
		$('<option/>').html("Приостановлено проведение").appendTo(selectDecision);
		$('<option/>').html("Передано").appendTo(selectDecision);
		$('<option/>').html("Возбуждено уголовное дело").appendTo(selectDecision);
});