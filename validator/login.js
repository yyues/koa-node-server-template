const Validator =require('validator')
const isEmpty =require('../util/isEmpty')
module.exports=function ValidatorUserLogin (data) {
    let err={}
    if( !Validator.isLength(data.name,{min: 6, max: 10}) ){
        err.name='名字的长度不符合要求'
    }
    return {
        err,
        isValid: isEmpty(err)
    }
}
