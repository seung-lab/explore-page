/**
 * Module dependencies.
 */

var express = require('express');
var compression = require('compression');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var methodOverride = require('method-override');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var fs = require('fs');

var app = express();

// all environments

var PORT = process.env.PORT || 3000;

app.set('port', PORT);
app.set('views', path.join(__dirname, 'build/views/'));
app.set('view engine', 'ejs');
app.use(compression({ threshold: 512 }));
//app.use(favicon(__dirname + "/public/images/favicon.ico"));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(serveStatic('build/public'));

app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
