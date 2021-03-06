/**
 * Module dependencies.
 */

 if (process.env.NODE_ENV === 'production') {
 	require('newrelic');
 }

require("babel/register");

var express = require('express'),
	exphbs  = require('express-handlebars'),
	React = require('react'),
	compression = require('compression'),
	favicon = require('serve-favicon'),
	morgan = require('morgan'),
	methodOverride = require('method-override'),
	serveStatic = require('serve-static'),
	bodyParser = require('body-parser'),
	routes = require('./routes.js'),
	http = require('http'),
	path = require('path'),
	fs = require('fs');

var app = express();

// all environments

var PORT = process.env.PORT || 3000;

app.set('port', PORT);
app.set('views', path.join(__dirname, 'views/'));

app.engine('handlebars', exphbs({ }));
app.set('view engine', 'handlebars');

app.use(compression({ threshold: 512 }));
//app.use(favicon(__dirname + "/public/images/favicon.ico"));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride());
//app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(serveStatic('dist/public', {
	maxAge: '1h'
}));
app.use(favicon('dist/public/favicon.ico'));

app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
