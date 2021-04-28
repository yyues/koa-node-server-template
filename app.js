const Koa = require("koa2");
const { Base } = require("./config/index");
const app = new Koa();
const { AddRouter } = require("./bin/router.js");
AddRouter(app);
//bodyParser
const bodyParser = require("koa-bodyparser");
app.use(bodyParser());

// cors 跨域
const cors = require("koa-cors");
app.use(cors());

//upload
const KoaBody = require("koa-body");
const path = require("path");
app.use(
  KoaBody({
    multipart: true,
    formidable: {
      keepExtensions: true,
    },
  })
);

//static
const KoaStatic = require("koa-static");
app.use(KoaStatic(path.join(__dirname, "/public")));

// logger
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

app.listen(Base.port);
