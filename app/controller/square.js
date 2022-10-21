'use strict';

const Controller = require( '../core/base_controller' );

class SquareController extends Controller {
  // 查询列表接口---- get
  async getList() {
    const { ctx } = this;
    const { Op } = this.app.Sequelize
    const rules = {
      page: { type: 'number', required: true },
      limit: { type: 'number', required: true },
      keyword: { type: 'number', required: false },
    };
    // 校验  参数
    const val = this.Validate( rules, ctx.param )
    if ( !val.status ) {
      // 校验 不通过
      this.error( '校验不通过', val.error )
      return
    }
    const { page, limit, keyword } = ctx.param
    const res = await ctx.model.Square.findAndCountAll( {
      where: {
        is_delete: false,
        content: {
          [Op.like]: keyword
        },
        publish_time: {
          [Op.lte]: new Date().getTime(),
        },

      },
      order: [
        [ 'create_time' ],
      ],
      offset: page,
      limit
    } )
    // 需要再对数据进行处理
    const data = res.map( async i => {
      return {
        ...i,
        is_current_user: (await this.currentUser()).uid === i.uid
      }
    } )
    this.success( data )
  }

  async findOne() {
    const { ctx } = this
    const { Op } = this.app.Sequelize
    const id = ctx.param.id
    if ( !id ) {
      this.error( 'id不存在', [] )
      return
    }
    const res = await ctx.model.Square.findOne( {
      where: {
        id,
        // 找不到定时发布的时间
        is_delete: false,
        publish_time: {
          [Op.lte]: new Date().getTime(),
        }
      }
    } )
    if ( !res ) {
      this.error( '数据库查无数据', [] )
      return
    }
    this.success( res )
  }

  // 新增 - 修改
  async save() {
    const { ctx } = this
    const rules = {
      name: { type: 'string', required: true },
      avatar_url: { type: 'string', required: true }
    }
    const { name, avatar_url, id } = ctx.request.body
    let res
    if ( !id ) {
      res = await ctx.model.Square.create( {
        ...ctx.request.body
      } )
    }
    res = await ctx.model.Square.update( {
      ...ctx.request.body,
    }, {
      where: {
        id
      }
    } )
    this.success( res )
  }

  // 删除
  async delete() {
    const { ctx } = this
    const id = ctx.request.body.id
    if ( !id ) {
      this.error( 'id不存在', [] )
      return
    }
    const res = await ctx.model.Square.findOne( {
      where: {
        id,
        is_delete: false
      }
    } )
    if ( !res ) {
      this.error( '数据库查无数据', [] )
      return
    }
    await ctx.model.Square.update( {
      ...res,
      is_delete: true
    }, {
      where: { id }
    } )
    this.success( { message: '删除成功！' } )
  }
}

module.exports = SquareController;
