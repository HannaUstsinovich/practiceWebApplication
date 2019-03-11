$(function(){
	//Получение списка для срока рассмотрения материала
		var  selectPhase = $("#phase");
		$('<option/>').html("Возобновлен").appendTo(selectPhase);
		$('<option/>').html("Приостановлен").appendTo(selectPhase);
		$('<option/>').html("Продлен").appendTo(selectPhase);
});