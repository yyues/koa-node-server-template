class Result {
     success(data,msg) {
        if (data){
            return {
                status:200,
                msg: msg,
                data: data
            }
        } else {
            return {
                status:200,
                msg: msg
            }
        }
    }
    error(msg) {
         return {
             status:500,
             msg: msg
         }
    }
    waring(status,msg) {
         return {
             status: status,
             msg: msg
         }
    }

}
module.exports= new Result()