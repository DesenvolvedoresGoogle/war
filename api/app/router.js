var express = require('express');
var GamesController = require('./controllers/games');
var router = express();

router.get('/api/games', GamesController.index);
router.post('/api/games', GamesController.create);

module.exports = router;
