'use strict';

const Controller = require( '../core/base_controller' );

// 动态
class SquareController extends Controller {
  // 查询列表接口---- get
  async getList() {
    const { ctx } = this;
    const { Op } = this.app.Sequelize
    const rules = {
      page: { type: 'string', required: true },
      limit: { type: 'string', required: true },
      keyword: { type: 'string', required: false },
    };
    // 校验  参数
    const val = this.Validate( rules, ctx.query )
    if ( !val.status ) {
      // 校验 不通过
      this.error( '校验不通过', val.error )
      return
    }
    const { page, limit, keyword } = ctx.query
    const { uid } = await this.currentUser()
    const { count, rows } = await ctx.model.Square.findAndCountAll( {
      where: {
        is_delete: false,
        content: {
          [Op.like]: '%' + keyword + '%'
        },
        is_private: false, // 查询不是私密的就行
      },
      order: [ 'create_time' ],
      offset: Number( page ),
      limit: Number( limit ),
    } )
    //  对 数据里 的 发布时间 进行处理了
    const data = rows.map( i => {
      return {
        ...i.toJSON(),
        is_current_user: uid === i.create_uid,
      }
    } )
    this.success( { count, rows: data } )

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
      content: { type: 'string', required: true },
    }
    // 校验  敏感 字符
    const isSensitive = await  this.service.mp.checkIsSensitive(content)
    if(isSensitive) return this.error('含有敏感字符',[])
    // 校验  参数
    const val = this.Validate( rules, ctx.request.body )
    if ( !val.status ) {
      // 校验 不通过
      this.error( '校验不通过', val.error )
      return
    }
    const { uid, avatar_url,user_name } = await this.currentUser()
    const { content, id } = ctx.request.body
    if ( !id ) {
      // 新增
      await ctx.model.Square.create( {
        ...ctx.request.body,
        create_uid: uid,
        create_url: avatar_url,
        create_name: user_name
      } )
      this.success( { message: '发表成功！' } )
      return
    }
    // 修改
    await ctx.model.Square.update( {
      ...ctx.request.body,
    }, {
      where: { id, is_delete: false }
    } )
    this.success( { message: '修改成功！' } )
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
