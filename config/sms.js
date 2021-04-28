// 安装阿里云短语npm
// npm install @alicloud/sms-sdk --save

const SMSClint = require("@alicloud/sms-sdk");

const accessKeyId = ""; //你自己在阿里云后台的accessKeyId
const secretAccessKey = ""; //secretAccessKey

let SMS = {};

module.exports = SMS;

SMS.send = async (ctx) => {
  let { PhoneNumber } = ctx.request.body;
  let num = "";
  for (let i = 0; i < 6; i++) {
    number += Math.floor(Math.random() * 10);
  }
  //初始化sms_client
  let smsClient = new SMSClient({ accessKeyId, secretAccessKey });
  var s = await smsClient.sendSMS({
    PhoneNumbers: PhoneNumber, //发送的电话号码
    SignName: "阿斯蒂芬", //认证签名
    TemplateCode: "SMS_11111111", //模板id
    TemplateParam: '{"number":"' + number + '","product":"阿斯蒂芬"}', //特别注意，这里的参数名
  });
  if (s.Code == "OK") {
    ctx.body = { code: 200, msg: "短信发送成功，请及时输入验证码" };
  } else {
    ctx.body = { code: 500 };
  }
};
// 后续在使用的时候直接在router使用该方法就行，数据来源到时候封装一下就行
