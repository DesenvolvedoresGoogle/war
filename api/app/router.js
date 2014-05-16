var express = require('express');
var GamesController = require('./controllers/games');
var router = express();

router.get('/api/games', GamesController.index);
router.post('/api/games', GamesController.create);
router.post('/api/games/waiting', GamesController.waiting);

module.exports = router;
