const JSON= require('JSON')

const getOneDbData = (data) =>{

    return JSON.parse(JSON.stringify(data))[0]

}
const getListDbData= (data) =>{

    return JSON.parse(JSON.stringify(data))

}

module.exports={

    getOneDbData,getListDbData

}