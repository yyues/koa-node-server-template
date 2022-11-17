'use strict';

const Controller = require( '../core/base_controller' );

const rules = {
  // create_uid: { type: 'string', required: true }, // 创建人 的 uid
  to_uid: { type: 'string', required: true }, // 创建人 的 uid
  form_type: { type: 'string', required: true }, // 点赞的是圈子还是广场
}

class StarController extends Controller {
  async getList() {
    const { ctx } = this;
    const { Op } = this.app.Sequelize
    const rules = {
      page: { type: 'string', required: true },
      limit: { type: 'string', required: true },
      keyword: { type: 'string', required: false },
    }
    // 校验  参数
    const val = this.Validate( rules, ctx.query )
    if ( !val.status ) {
      // 校验 不通过
      this.error( '校验不通过', val.error )
      return
    }
    const { uid } = await this.currentUser()
    const { page, limit, keyword, } = ctx.query
    let param = {
      is_delete: false,
      content: {
        [Op.like]: '%' + keyword
      },
      to_uid: uid
    }
    const { count, rows } = await ctx.model.Message.findAndCountAll( {
      where: param,
      order: [
        [ 'create_time' ],
      ],
      offset: Number( page ),
      limit: Number( limit ),
    } )
    // 还是需要过滤的 const
    const data = rows.map( i => {
      return {
        ...i.toJSON(),
        CanIdo: i.create_uid == uid,
        // res,
      }
    } )
    this.success( { count, rows: data } )
  }

  async send() {
    const { ctx } = this
    const { form_id, form_type, form_status } = ctx.request.body
    const val = this.Validate( rules, ctx.request.body )
    if ( !val.status ) {
      this.error( '校验不通过', [] )
      return
    }
    const { uid, user_name } = await this.currentUser()
    await ctx.model.Star.create( {
      ...ctx.request.body,
      create_uid: uid,
      create_name: user_name
    } )

    this.success( {
      message: '发送成功！', success: true
    } )
  }

  async cancel() {
    const id = this.ctx.param.id
    const data = await this.ctx.model.Star.update( {
      status: 'reBack',
    }, {
      where: {
        id,
        is_delete: false
      }
    } )
    this.success( {
      message: '撤回成功！', success: true
    } )
  }

  async receive() {
    const id = this.ctx.param.id
    const data = await this.ctx.model.Star.update( {
      status: 'received',
    }, {
      where: {
        id,
        is_delete: false
      }
    } )
    this.success( {
      message: '撤回成功！', success: true
    } )
  }

  async findOne() {
    const id = this.ctx.param.id
    const data = await this.ctx.model.Star.findOne( {
      where: {
        id,
        is_delete: false
      }
    } )
    this.success( data )
  }

  async findAll() {
    const { uid } = await this.currentUser()
    // 存在 指定圈子的 id 则 只 查找所属圈子的 消息
    const form_id = this.ctx.param.form_id
    const param = {
      uid,
    }
    if ( form_id ) {
      param.form_id = form_id
    }
    const data = await this.ctx.model.Message.findAll( {
      where: param
    } )
    this.success( data )
  }
}

module.exports = StarController;
