const Koa = require('koa2');
const {Base} =require('./config/index')
const app = new Koa();

//bodyParser
const bodyParser = require('koa-bodyparser');
app.use(bodyParser());

// cors 跨域
const cors=require('koa-cors')
app.use(cors())

// passport 验证
const passport = require('koa-passport')
app.use(passport.initialize())
app.use(passport.session())
require('./config/passport')(passport)

// Sessions
// const session = require('koa-session')
// app.keys = ['secret']
// app.use(session({}, app))



// logger
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});


//router
const index=require('./router/index')
const user=require('./router/user')
app.use(index.routes())
app.use(user.routes())

app.listen(Base.port);