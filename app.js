const Koa = require('koa2');
const app = new Koa();
const bodyParser = require('koa-bodyparser');
const cors=require('koa-cors')
//使用router
const index=require('./router/index')
const user=require('./router/user')

const {Base} =require('./config/index')
app.use(bodyParser());
app.use(cors())

// logger
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});


//router
app.use(index.routes())
app.use(user.routes())

app.listen(Base.port);