'use strict';

const Controller = require( '../core/base_controller' );

const rules = {
  content: { type: 'string', required: true },
  execute_time: { type: 'date', required: true }
}

class StarController extends Controller {
  async create() {
    const { ctx } = this
    const val = this.Validate( rules, ctx.request.body )
    if ( !val.status ) {
      this.error( '校验不通过', [] )
      return
    }
    const { uid } = await this.currentUser()
    const data = await ctx.model.Card.create( {
      ...ctx.request.body,
      uid
    } )

    this.success( data )
  }

  async finish() {
    const { ctx } = this
    const id = ctx.param.id
    if ( !id ) {
      this.error( '校验不通过', [] )
      return
    }
    const { uid } = await this.currentUser()
    const { finished_count, children_uid, finished_uid } = await ctx.model.Star.findOne( {
      where: { id }
    } )
    finished_uid.push( uid )
    const data = await ctx.model.Star.update( {
      status: 'finished',
      finished_count: finished_count + 1,
      finished_uid
    }, {
      where: {
        id,
      }
    } )
    this.success( {
      message: '取消点赞成功！', success: true
    } )
  }

  async findByUser() {
    const { uid } = await this.currentUser()
    // 查询 children_uid 数组里是否含有某个 uid
  }

  async findByFormId() {
    const form_id = this.ctx.param.form_id
    const data = await this.ctx.model.Card.findAll( {
      where: { form_id }
    } )
    this.success( data )
  }
}

module.exports = StarController;
