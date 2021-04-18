const db = require('../db/index')
const {DataTypes} =require('sequelize')


//建立user表的相关操作，并进行检查

const user = db.define('user',{
  id:{
    type: DataTypes.UUID,
    primaryKey:true,
    unique: true
  },
  username:{
    type: DataTypes.STRING(8),
  },
  password:{
    type: DataTypes.STRING
  }
},{
    freezeTableName: true,
    updatedAt:'updateTime',
    createdAt:'createTime'
})
user.sync()
module.exports=user

