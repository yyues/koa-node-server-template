const { Base } =require('./index')
const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = Base.secretOrKey;

const User = require('../model/user')

module.exports = passport =>{

  // console.log(passport);
  passport.use(new JwtStrategy(opts, async function(jwt_payload, done) {
    //操作数据库判断用户在不在
    // User.findAll({id: jwt_payload.sub}, function(err, user) {
    //   if (err) {
    //     return done(err, false);
    //   }
    //   if (user) {
    //     return done(null, user);
    //   } else {
    //     return done(null, false);
    //     // or you could create a new account
    //   }
    // });
  }));
}