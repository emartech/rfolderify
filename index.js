var path = require('path');
var fs = require('fs');

var through = require('through');
var falafel = require('falafel');

module.exports = function (file) {
    if (/\.json$/.test(file)) return through();

    var data = '';
    var rfileNames = {};
    var dirname = path.dirname(file);
    var varNames = ['__filename', '__dirname', 'path', 'join'];
    var vars = [file, dirname, path, path.join];
    var pending = 0;
    
    var tr = through(write, end);
    return tr;
    
    function write (buf) { data += buf }
    function end () {
        try {
            var output = parse();
        } catch (err) {
            this.emit('error', new Error(
                err.toString().replace('Error: ', '') + ' (' + file + ')')
            );
        }
        if(pending == 0) finish(output);
    }
    function finish(output) {
        tr.queue(String(output));
        tr.queue(null);
    }
    function parse() {
        var output = falafel(data, function (node) {
            if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 'rfolder') {
                ++pending;
                var arg = node.arguments[0];
                var t = 'return ' + arg.source();
                arg = Function(varNames, t).apply(null, vars);
                listRequireables(arg,function(err,files) {
                    if(err) return tr.emit('error',err);
                    var obj = '{';
                    for(var p in files) if(({}).hasOwnProperty.call(files,p)) {
                        obj += JSON.stringify(p)+': require('+JSON.stringify(files[p])+'),';
                    }
                    obj = obj.substr(0,obj.length-1); //remove trailing comma
                    obj += '}';
                    node.update(obj);
                    if(--pending == 0) finish(output);
                });
            }
        });
        return output;
    }
};

function listRequireables(dir,cb) {
    fs.readdir(dir,function(err,files) {
        if(err) return cb(err);
        var results = {}, file, base, full, ext;
        for(var i = 0, l = files.length; i < l; ++i) {
            file = files[i];
            ext = path.extname(file);
            if(ext in require.extensions) { // yup, this works with (coffee|live)ify
                base = path.basename(file,ext);
                full = path.resolve(dir,file);
                results[base] = full;
            }
        }
        cb(null,results);
    });
}
