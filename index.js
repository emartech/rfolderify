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
    
    return through(write, end);
    
    function write (buf) { data += buf }
    function end () {
        var tr = this;
        var parsed = false;
        try {
            var output = falafel(data, function (node) {
                if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 'rfolder') {
                    var arg = node.arguments[0];
                    var t = 'return ' + arg.source();
                    arg = Function(varNames, t).apply(null, vars);
                    listRequireables(arg,function(ex,files) {
                        if(ex) {
                            if (parsed) return tr.emit('error', ex), tr.queue(data), tr.queue(null);
                            else return tr.queue(data), tr.queue(null);
                        }
                        var obj = '{';
                        for(var p in files) if(({}).hasOwnProperty.call(files,p)) {
                            obj += JSON.stringify(p)+': require('+JSON.stringify(files[p])+'),';
                        }
                        obj += '}';
                        node.update(obj);
                    });
                }
            });
        } catch (ex) {
            if (parsed) return tr.emit('error', ex), tr.queue(data), tr.queue(null);
            else return tr.queue(data), tr.queue(null);
        }
        tr.queue(String(output));
        tr.queue(null);
    }
};

function listRequireables(dir,cb) {
    fs.readDir(dir,function(err,files) {
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
