var load = require('rfile');
var loadSRC = require('ruglify');

console.log(load('./robot.html'));
console.log(load('./robot', {extensions: ['.html']}));

console.dir(Function('return ' + loadSRC('./answer.js'))());