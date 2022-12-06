'use strict';

const Controller = require( '../core/base_controller' );

const rules = {
  form_id: { type: 'string', required: true }, // 归属的id， 表示从圈子发布的还是个人发布的
  form_type: { type: 'string', required: true }, // 是个人发布的还是圈子发布的
  form_status: { type: 'string', required: true }, // 点赞的是圈子还是广场
}

class StarController extends Controller {
  async Star() {
    const { ctx } = this
    const { form_id, form_type, form_status } = ctx.param
    const val = this.Validate( rules, ctx.param )
    if ( !val.status ) {
      this.error( '校验不通过', [] )
      return
    }
    const { uid } = await this.currentUser()
    const res = await ctx.model.Star.findOne( {
      where: {
        form_id,
      }
    } )
    if ( res && !res.is_delete ) {
      this.success( { message: '已经点过赞了', success: false } )
      return
    }

    if ( res ) {
      // 把 原来的 true 变成false
      await ctx.model.Star.update( { is_delete: false }, {
        where: {
          form_id,
        }
      } )
    } else {
      //添加一条新的数据
      await ctx.model.Star.create( {
        form_id, form_type, form_status, uid
      } )
    }

    this.success( {
      message: '点赞成功', success: true
    } )
  }

  async noStar() {
    const { ctx } = this
    const { form_id, form_type, form_status } = ctx.param
    const val = this.Validate( rules, ctx.param )
    if ( !val.status ) {
      this.error( '校验不通过', [] )
      return
    }
    const { uid } = await this.currentUser()
    const res = await ctx.model.Star.findOne( {
      where: {
        form_id,
      }
    } )
    if ( !res || res.is_delete ) {
      this.success( { message: '没有点过赞呢，亲！', success: false } )
      return
    }
    const data = await ctx.model.Star.update( {
      form_id, form_type, form_status, uid,
      is_delete: true
    }, {
      where: {
        form_id,
      }
    } )
    this.success( {
      message: '取消点赞成功！', success: true
    } )
  }
}

module.exports = StarController;
