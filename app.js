const Koa = require("koa2");
const { Base } = require("./config/index");
const app = new Koa();
const path = require("path");

const { AddRouter } = require("./bin/router.js");

//bodyParser
const bodyParser = require("koa-bodyparser");
app.use(bodyParser());

// cors 跨域
const cors = require("koa-cors");
app.use(cors());

//static
const KoaStatic = require("koa-static");
app.use(KoaStatic(path.join(__dirname, "/public")));

// 登录拦截
const FILTER = require("./config/interceptor");
FILTER(app);

// logger
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

AddRouter(app);
app.listen(Base.port);
