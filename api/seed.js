var mongoose = require('mongoose');
var State = require('./app/models/state');

mongoose.connect('mongodb://localhost/hackathon-war-dev');

var states = [
  ['Acre', 'AC', '-9.1285244', '-70.3077931'],
  ['Alagoas', 'AL', '-9.658443', '-36.6897704'],
  ['Amapá', 'AP', '1.603494', '-52.3764644'],
  ['Amazonas', 'AM', '-3.7857105', '-64.9495526'],
  ['Bahia', 'BA', '-13.4343696', '-41.982751'],
  ['Ceará', 'CE', '-5.3214533', '-39.3382675'],
  ['Espírito Santo', 'ES', '-19.5968657', '-40.7717683'],
  ['Goiás', 'GO', '-15.9471833', '-49.5790826'],
  ['Maranhão', 'MA', '-5.6558833', '-45.2755116'],
  ['Mato Grosso do Sul', 'MS', '-20.611376', '-54.5449798'],
  ['Mato Grosso', 'MT', '-12.6955444', '-55.9289973'],
  ['Minas Gerais', 'MG', '-18.5779703', '-45.4514505'],
  ['Paraná', 'PR', '-24.6169813', '-51.3214141'],
  ['Paraíba', 'PB', '-7.1644358', '-36.7793751'],
  ['Pará', 'PA', '-3.6250659', '-52.4812983'],
  ['Pernambuco', 'PE', '-8.3779283', '-38.0825865'],
  ['Piauí', 'PI', '-6.8380377', '-43.1823977'],
  ['Rio Grande do Norte', 'RN', '-5.9072667', '-36.7754294'],
  ['Rio Grande do Sul', 'RS', '-30.4163413', '-53.6677564'],
  ['Rio de Janeiro', 'RJ', '-22.066452', '-42.9232368'],
  ['Rondônia', 'RO', '-10.8315007', '-63.2922964'],
  ['Roraima', 'RR', '1.8456015', '-61.8560613'],
  ['Santa Catarina', 'SC', '-27.6536999', '-51.1508311'],
  ['Sergipe', 'SE', '-10.5417791', '-37.3227577'],
  ['São Paulo', 'SP', '-22.5455869', '-48.6355226'],
  ['Tocantins', 'TO', '-9.3180492', '-48.219068']
];

var counter = 0;
states.forEach(function (state) {
  new State({
    name: state[0],
    acronym: state[1],
    lat: state[2],
    lng: state[3]
  }).save(function (err) {
    if (err) {
      console.error(err);
    }
    counter ++;
    if (counter === states.length) {
      mongoose.connection.close();
    }
  });
});
