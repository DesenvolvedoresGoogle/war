'use strict';

WAR.module.Menu = {
	init: function () {
		this.setup();
		this.bind();
		this.showModal();
		this.updateListGames();
	},

	setup: function () {
		this.$form = $('#form');
		this.$username = $('#username');
		this.$btnNewGame = $('#btn-new-game');
		this.$modal = $('#start-screen');
		this.$pieces = $('#points');
		this.$listGames = $('#waiting-list');
		this.$btnEnterGame = $('.btn-enter-game');
	},

	bind: function () {
		var _this = this;

		this.$btnNewGame.on('click', function () {
			_this.waitingList();
		});

		$(document).on('click', '.btn-enter-game', function () {
			_this.joinGame($(this));
		});

		WAR.instance.socket.on('created-game', function (data) {
			WAR.module.Game.init(data);
		});
	},

	joinGame: function (target) {
		WAR.username = this.$username.val();

		if (!WAR.username) {
	        alert('Preencha o seu nome antes de criar um jogo');
	        return;	
		}

		var owner = target.parent().prev().html(),
			arrayUsers = [owner, WAR.username];

		this.$username.val('');
		WAR.instance.socket.emit('join-game', arrayUsers);
	},

	waitingList: function () {
		WAR.username = this.$username.val();

		if (!WAR.username) {
	        alert('Preencha o seu nome antes de criar um jogo');
	        return;	
		}

		this.$username.val('');
		WAR.instance.socket.emit('new-game', WAR.username);

		this.$modal.find('.modal-body')
			.html('<p class="text-center">Aguardando outro jogador...</p>')
			.next()
			.empty();
	},

	showModal: function () {
		this.$modal.modal('show');
	},

	hideModal: function () {
		this.$modal.modal('hide');
	},

	updateListGames: function () {
		var _this = this;

		WAR.instance.socket.on('games', function (data) {
			var html = [];

			_this.$listGames.empty();

			for (var i = 0, len = data.length; i < len; i++) {
				html.push('<tr>');
				html.push('	<td>' + data[i] + '</td>');
				html.push('	<td>');
				html.push('	 <button class="btn btn-primary btn-enter-game">Entrar</a>');
				html.push('	</td>');
				html.push('</tr>');
			}

			_this.$listGames.append(html.join(' '));
		});
	}

};
