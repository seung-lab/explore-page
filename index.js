let koa = require('koa');

let PORT = 3000;

let app = koa();
app.use(require('koa-static')('public', {}));

app.use(function *(){
  this.body = 'Hello World';
});

app.listen(PORT);

console.log(`Listening on port ${PORT}`)