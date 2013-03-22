var path = require('path');

var through = require('through');
var falafel = require('falafel');
var unparse = require('escodegen').generate;

var rfileModules = ['rfile', 'ruglify'];

module.exports = function (file) {
    var data = '';
    var rfileNames = {};
    var dirname = path.dirname(file);
    var varNames = ['__filename', '__dirname', 'path', 'join'];
    var vars = [file, dirname, path, path.join];
    
    return through(write, end);
    
    function write (buf) { data += buf }
    function end () {
        var tr = this;
        
        var output = falafel(data, function (node) {
            if (requireName(node) && rfileModules.indexOf(requireName(node)) != -1 && variableDeclarationName(node.parent)) {
                rfileNames[variableDeclarationName(node.parent)] = requireName(node);
                node.update('undefined');
            }
            if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && rfileNames[node.callee.name]) {
                var rfile = require(rfileNames[node.callee.name]);
                var args = node.arguments;
                for (var i = 0; i < args.length; i++) {
                    var t = 'return ' + unparse(args[i]);
                    args[i] = Function(varNames, t).apply(null, vars);
                }
                args[1] = args[1] || {};
                args[1].basedir = args[1].basedir || dirname;
                node.update(JSON.stringify(rfile.apply(null, args)));
            }
        });
        
        tr.queue(String(output));
        tr.queue(null);
    }
};

function requireName(node) {
    var c = node.callee;
    if (c && node.type === 'CallExpression' && c.type === 'Identifier' && c.name === 'require') {
        return node.arguments[0].value;
    }
}
function variableDeclarationName(node) {
    if (node && node.type === 'VariableDeclarator' && node.id.type === 'Identifier') {
        return node.id.name;
    }
}
