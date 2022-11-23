const Controller = require( 'egg' ).Controller;
const moment = require( 'moment' );

class BaseController extends Controller {
  // 获取当前操作员方法 主要为了获取 uid
  async currentUser() {
    const token = this.ctx.request.header.token;
    if ( !token ) {
      return { uid: null };
    }
    const res = await this.ctx.model.User.findOne( {
      where: {
        access_token: token,
        is_delete: false,
      },
    } );
    if ( !res ) {
      return { uid: null };
    }
    return res;
  }

  moment( date ) {
    return moment( date )
  }

  // 自定义方法
  Validate( rules, query ) {
    let flag,
      error;
    try {
      this.ctx.validate( rules, query );
      flag = true;
    } catch (e) {
      error = e.errors;
      flag = false;
    }
    return {
      status: flag,
      error,
    };
  }

  success( data ) {
    this.ctx.body = {
      code: 200,
      status: 'SUCCESS',
      data,
      success: true,
    };
  }

  error( message, errors ) {
    this.ctx.body = {
      code: 200,
      status: 'error',
      errors,
      message,
      success: false,
    };
  }

  async sendTodoMsg( todoInfo, remind_time, remark = '待办即将到期' ) {
    //  一般来说,都是当前用户操作当前的订阅消息
    const { openid, uid } = await this.currentUser()
    // 重新获取token
    const { access_token } = await this.service.mp.getToken()
    // 微信 订阅消息服务端接口
    console.log('我真的干活了，在发布订阅消息了啊')
    const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${ access_token }`
    const param = {
      touser: openid,
      template_id: 'CzS_gPhxjoZG1EAgDm5ThiRo9H98Eblh9GSQ7j7eJZo',
      page: '/pages/todo-detail/index?type=clock&id=' + todoInfo.id,
      data: {
        "thing1": { value: todoInfo.content },
        "time2": { value: remind_time },
        "thing4": { value: todoInfo.description, },
        "thing17": { value: todoInfo.level == 0 ? '低优先级' : todoInfo.level == 1 ? '中优先级' : todoInfo.level == 2 ? '高优先级' : '紧急待办', },
        "thing12": { value: remark },
        lang: "zh_CN",
        miniprogram_state: "developer",
      }
    }
    const res = await this.ctx.curl( url, {
      method: 'POST',
      contentType: 'json',
      dataType: 'json',
      data: param,
    } )
    return res.data
  }

  oneOfTeamFinish( data, userInfo, type = 'todo' ) {
    if ( type === 'todo' ) {
      const {
        current_uid, current_url, team_number, finish_number, finish_uid, finish_url,
      } = data
      const { uid, avatar_url } = userInfo
      const id_index = current_uid.findIndex( i => i === uid.toJSON() )
      const url_index = current_url.findIndex( i => i === avatar_url )
      if ( id_index === -1 || url_index === -1 ) return null
      current_uid.splice( id_index, 1 )
      current_url.splice( url_index, 1 )
      finish_url.push( avatar_url )
      finish_uid.push( uid )
      return {
        ...data,
        current_uid,
        current_url,
        team_number: team_number - 1,
        finish_number: finish_number + 1,
        finish_uid,
        finish_url
      }
    }
  }
}

module.exports = BaseController;
