# rfolderify

  Convert any code using rfile and derivatives so that it supports browserify.

[![Build Status](https://travis-ci.org/quarterto/rfolderify.png?branch=master)](https://travis-ci.org/quarterto/rfolderify)
[![Dependency Status](https://gemnasium.com/quarterto/rfolderify.png)](https://gemnasium.com/quarterto/rfolderify)

  This module is a plugin for [browserify](http://browserify.org/) to parse the AST for `rfolder` calls so that you can inline the folder contents into your bundles.

## Example with Browserify

  For a main.js

```javascript
var contents = rfolder('./misc');
console.log(contents['robot'].hello());
```

  And a misc/robot.js file.

```javascript
exports.hello = function() {
    return("Beep boop");
}
```

  first `npm install rfolderify` into your project, then:

### on the command-line

```
$ browserify -t rfolderify example/main.js > bundle.js
```

### or with the API

```javascript
var browserify = require('browserify');
var fs = require('fs');

var b = browserify('example/main.js');
b.transform('rfolderify');

b.bundle().pipe(fs.createWriteStream('bundle.js'));
```

## More options

You can pass an `options` parameter to rfolder:

```javascript
var contents = rfolder('./misc', {extensions: [".coffee", ".jade"], keepExt: [".jade"]});
```

Valid options are:

* `extensions` - A list of extensions to require.  If this is not provided, the default is to
  require any file which node.js would require. e.g. `[".js", ".coffee", ".jade"]` to require all
  .js, .coffee, and .jade files from the directory.
* `checkExt` - If false, then `extensions` will be ignored, and all files will be required
  regardless of their extension.
* `keepExt` - By default, rfolder strips extensions from file names when generating keys for the
  folder object.  `keepExt` can be set `true` to keep all extensions, or to an array of extensions
  to keep.  For example, if you have a folder containing a "robot.js" and a "robot.jade", then
  passing `{keepExt: '.jade'}` would make it so `contents['robot']` would refer to the .coffee file,
  while `contents['robot.jade']` would refer to the jade file.
* `require` - JS string used to require each file.  Defaults to "require".

## Direct Usage

A tiny command-line program ships with this module for easier debugging and if you just want this without any of the rest of browserify.

```
npm install rfolderify -g
rfolderify --help
```

## License

MIT

![viewcount](https://viewcount.jepso.com/count/quarterto/rfolderify.png)
