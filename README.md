# rfolderify

  Convert any code using rfile and derivatives so that it supports browserify.

[![Build Status](https://travis-ci.org/quaterto/rfolderify.png?branch=master)](https://travis-ci.org/quaterto/rfolderify)
[![Dependency Status](https://gemnasium.com/quaterto/rfolderify.png)](https://gemnasium.com/quaterto/rfolderify)

  This module is a plugin for [browserify](http://browserify.org/) to parse the AST for `rfolder` calls so that you can inline the folder contents into your bundles.

## Example with Browserify

  For a main.js

```javascript
var rfolder = require('rfolder');
var contents = rfolder('./misc');
console.log(contents['robot.html']);
```

  And a misc/robot.html

```html
<b>beep boop</b>
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

## Direct Usage

A tiny command-line program ships with this module for easier debugging and if you just want this without any of the rest of browserify.

```
npm install rfolderify -g
rfolderify --help
```

## License

MIT

![viewcount](https://viewcount.jepso.com/count/quatert/rfolderify.png)
