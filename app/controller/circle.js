'use strict';

const Controller = require( '../core/base_controller' );

class CircleController extends Controller {
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
    const { uid } = await this.currentUser()
    const { page, limit, keyword, status } = ctx.query
    const { count, rows } = await ctx.model.Circle.findAndCountAll( {
      where: {
        is_delete: false,
        status,
        content: {
          [Op.like]: '%' + keyword
        },
        [Op.or]: [
          { create_uid: uid },
          {
            member_uid: {
              [Op.like]: '%' + uid,
            }
          }
          //  使用 like 来查找 数据库的字段 勉强实现查询全部的接口
        ],
        publish_time: {
          [Op.lte]: new Date().getTime(),
        }
      },
      order: [
        [ 'create_time' ],
      ],
      offset: Number( page ),
      limit: Number( limit ),
    } )
    //  对 数据里 的 发布时间 进行处理了
    const data = rows.map( i => {
      return {
        ...i.toJSON(),
        publish_time: this.moment( i.publish_time ).format( 'YYYY-MM-DD' )
      }
    } )
    this.success( { count, rows: data } )
    // this.success( res )
  }

  async findOne() {
    const { ctx } = this
    const { Op } = this.app.Sequelize
    const id = ctx.query.id
    const { uid } = await this.currentUser()
    if ( !id ) {
      this.error( 'id不存在', [] )
      return
    }
    const res = await ctx.model.Circle.findOne( {
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
    // 需要查到 创建者 的 avatar_url
    const { avatar_url } = await ctx.model.User.findOne( {
      where: {
        uid: res.create_uid
      }
    } )
    //  对 数据里 的 发布时间 进行处理了
    this.success( {
      ...res.toJSON(),
      create_url: avatar_url,
      is_current_user: res.create_uid === uid,
      publish_time: this.moment( res.publish_time ).format( 'YYYY-MM-DD' )
    } )
  }

  // 新增 - 修改
  async save() {
    const { ctx } = this
    const { uid, user_name } = await this.currentUser()
    const rules = {
      name: { type: 'string', required: true },
      avatar_url: { type: 'string', required: true }
    }
    const { name, avatar_url, id, publish_time } = ctx.request.body
    let res
    // 新增
    if ( !id ) {
      // 存 发布时间 的时候 把 发布时期转化为 时间戳 方便查询
      res = await ctx.model.Circle.create( {
        ...ctx.request.body,
        create_uid: uid,
        create_name: user_name,
        publish_time: new Date( publish_time ).getTime(),
        status: 're_publish', // 新建后修改成待发布的状态
        is_current_user: true
      } )
      this.success( res )
      return
    }
    //修改
    res = await ctx.model.Circle.update( {
      ...ctx.request.body,
      publish_time: new Date( publish_time ).getTime(),

    }, {
      where: {
        id,
        is_delete: false
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
    const res = await ctx.model.Circle.findOne( {
      where: {
        id,
        is_delete: false
      }
    } )
    if ( !res ) {
      this.error( '数据库查无数据', [] )
      return
    }
    await ctx.model.Circle.update( {
      ...res,
      is_delete: true
    }, {
      where: { id }
    } )
    this.success( { message: '删除成功！' } )
  }

  async getAllUsers() {
    const { ctx } = this
    const status = ctx.query.status
    const { Op } = this.app.Sequelize
    const { uid } = await this.currentUser()
    const param = {
      create_uid: uid,
      is_delete: false,
    }
    if ( status ) param.status = status
    const res = await ctx.model.Circle.findAll( {
      where: {
        ...param,
        [Op.or]: [
          { create_uid: uid },
          // sequelize.where( sequelize.fn( 'like', sequelize.col( 'member_uid' ) ), uid.toString() )
          {
            member_uid: {
              [Op.like]: '%' + uid,
            }
          }
          //  使用 like 来查找 数据库的字段 勉强实现查询全部的接口
        ]
      }
    } )
    //  对 数据里 的 发布时间 进行处理了
    const rows = res.map( i => {
      return {
        ...i.toJSON(),
        publish_time: this.moment( i.publish_time ).format( 'YYYY-MM-DD' )
      }
    } )
    this.success( rows )
  }

//  加入 邀请的话是直接进入的
  async join() {
    const ctx = this.ctx
    const { id, type } = ctx.request.body
    const { uid, avatar_url } = await this.currentUser()
    if ( type ) {
      return this.error( '需要主人同意才能加入', [] )
    }
    const { member_uid, member_avatar, current_number, max_number } = await ctx.model.Circle.findOne( {
      where: {
        id,
        is_delete: false
      }
    } )
    if ( current_number >= max_number ) return this.error( '人数超出限制啦', [] )
    //  更新数据
    member_uid.push( uid )
    member_avatar.push( avatar_url )
    await ctx.model.Circle.update( {
      member_uid, member_avatar, current_number: current_number + 1
    }, {
      where: {
        id, is_delete: false
      }
    } )
  }
}

module.exports = CircleController;
