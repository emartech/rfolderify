var path = require('path');
var fs = require('fs');

var through = require('through');
var falafel = require('falafel');

var defaults = {require:"require",}

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

                // Parse arguemnts to calls to `require(module, options)`
                var args = node.arguments;
                for (var i = 0; i < args.length; i++) {
                    var t = 'return ' + (args[i]).source();
                    args[i] = Function(varNames, t).apply(null, vars);
                }

                // Resolve the foler to require relative the file which is requiring it
                var parentDir = path.dirname(file);
                var folder = path.resolve(parentDir, args[0])

                var options = args[1] || {}
                options.require = args[1].require || "require";
                options.checkExt = args[1].checkExt != null ? args[1].checkExt : true;
                options.keepExt = args[1].keepExt || false;
                // By default, require anything that node.js would require
                options.extensions = args[1].extensions || Object.keys(require.extensions);


                listRequireables(folder, options, function(err,files) {
                    if(err) return tr.emit('error',err);
                    var obj = '{';
                    for(var p in files) if(({}).hasOwnProperty.call(files,p)) {
                        obj += JSON.stringify(p)+': '+args[1].require+'('+JSON.stringify(files[p])+'),';
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

function listRequireables(dir,options,cb) {
    fs.readdir(dir,function(err,files) {
        if(err) return cb(err);
        var results = {}, file, base, full, ext, symbol, shouldRequire, keepExt;
        for(var i = 0, l = files.length; i < l; ++i) {
            file = files[i];
            ext = path.extname(file);

            shouldRequire = !options.checkExt ||
                (options.extensions.indexOf(ext) != -1);

            if(shouldRequire) {
                keepExt = (options.keepExt === true) ||
                    (options.keepExt && options.keepExt.indexOf(ext) != -1)
                symbol = keepExt ? file : path.basename(file,ext);
                full = path.resolve(dir,file);
                results[symbol] = full;
            }
        }
        cb(null,results);
    });
}
