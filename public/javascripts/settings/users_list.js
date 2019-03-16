$(function () {

	// Настройки дополнительных полей к таблице (страницы, поиск, инфо)
	$('#usersListTable').DataTable({
		"language": {
			"search": "Поиск:",
			"emptyTable": "Таблица пуста",
			"zeroRecords": "Не найдено пользователей, удовлетворяющих поиску",
			"infoFiltered": "",
			"infoEmpty": "",
			"loadingRecords": "Загрузка...",
			"info": "Отображается _START_ - _END_ из _TOTAL_ пользователей",
			"paginate": {
				"next": "Следующая",
				"previous": "Предыдущая"
			}
		},

		lengthChange: false,
		columnDefs: [
			{ targets: [2], orderable: false, searchable: false },
		],
		order: [],
	});
});