const config ={
  database: 'test',
  username: 'root',
  password: '123456',
  port: '3306',
  dialect: 'mysql',
  host:'localhost'
}
const Base={
  port: '3000',
  secretOrKey: 'secret',
  tokenExpiresIn: 3600 * 24 * 7
}
module.exports={
  config,Base
}