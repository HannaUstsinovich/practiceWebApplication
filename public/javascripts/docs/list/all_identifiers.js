$(function () {

	var i = $(".tableRowNum").html();

	$(".tableRowNum").each(function (index, val) {
		$(val).html(i++);
	});

	// Настройки дополнительных полей к таблице (страницы, поиск, инфо)
	$('#identifiers-table').DataTable({
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
	$('#identifiers-table tbody').on('click', 'tr', function (e) {
		window.location = $(e.currentTarget).data("href");
	} );

});