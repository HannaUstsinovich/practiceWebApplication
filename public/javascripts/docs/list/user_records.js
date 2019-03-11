$(function () {

	var i = $(".tableRowNum").html();

	$(".tableRowNum").each(function (index, val) {
		$(val).html(i++);
	});

	// Ограничение вывода текста в поле "Фабула"
	var size = 150;

	$(".description-size").each(function (){
		var newText = $(this).text();
		if (newText.length > size) {
			$(this).text(newText.slice(0, size) + ' ...');
		}
	});


	// Настройки дополнительных полей к таблице (страницы, поиск, инфо)
	$('#user-records-table').DataTable({
		"language": {
			"lengthMenu": "Показать _MENU_ на странице",
			"search": "Поиск:",
			"emptyTable": "Таблица пуста",
			"zeroRecords": "Не найдено записей, удовлетворяющих поиску",
			"infoFiltered": "",
			"infoEmpty": "",
			"loadingRecords": "Загрузка...",
			"info": "Отображается _START_ - _END_ из _TOTAL_ записей",
			"paginate": {
				"next": "Следующая",
				"previous": "Предыдущая"
			}
		},
		"lengthMenu": [10, 25, 50],
		// lengthChange: false,
		columnDefs: [
			{ targets: [0], orderable: false },
			{ targets: [3], orderable: false }
		],
		order: [],
	});

	// Для перехода по ссылкам, содержащихся в строках таблицы
	$('#user-records-table tbody').on('click', 'tr', function (e) {
		window.location = $(e.currentTarget).data("href");
	} );
});