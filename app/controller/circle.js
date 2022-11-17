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
      status: { type: 'string', required: true },
    }
    // 校验  参数
    const val = this.Validate( rules, ctx.query )
    if ( !val.status ) {
      // 校验 不通过
      this.error( '校验不通过', val.error )
      return
    }
    const { uid } = await this.currentUser()
    const { page, limit, keyword, status } = ctx.query
    let param = {
      is_delete: false,
      status,
      content: {
        [Op.like]: '%' + keyword
      },
      publish_time: {
        [Op.lte]: new Date().getTime(),
      }
    }
    if ( status !== 'published' ) {
      param = {
        ...param,
        [Op.or]: [
          { create_uid: uid },
          {
            member_uid: {
              [Op.like]: '%' + uid,
            }
          }
          //  使用 like 来查找 数据库的字段 勉强实现查询全部的接口
        ],
      }
    }
    const { count, rows } = await ctx.model.Circle.findAndCountAll( {
      where: param,
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
    // 获取 请求数据
    const { id, type } = ctx.request.body
    // 获取用户数据
    const { uid, avatar_url, user_name } = await this.currentUser()
    // 查询详情
    const {
      member_uid,
      member_avatar,
      current_number,
      max_number,
      create_uid,
      create_name,
      name,
      avatar_url: circle_url
    } = await ctx.model.Circle.findOne( {
      where: {
        id,
        is_delete: false
      }
    } )
    if ( create_uid === uid ) return this.error( '自己的不能加入！', [] )
    if ( current_number >= max_number ) return this.error( '人数超出限制啦', [] )
    if ( type === 'receive' ) {
      // 已经 在的就返回错误
      if ( member_uid.includes( uid.toString() ) ) return this.error( '已经在圈子内！', [] )
      //   接受邀请的可以直接加入
      member_uid.push( uid )
      member_avatar.push( avatar_url )
      await ctx.model.Circle.update( {
        member_uid, member_avatar, current_number: current_number + 1
      }, {
        where: {
          id, is_delete: false
        }
      } )
      return this.success( { message: '加入成功！' } )
    }
    //   需要调用 message 表 给 圈主发一条消息
    const [ user, created ] = await ctx.model.Message.findOrCreate( {
      where: { create_uid: uid, to_uid: create_uid, form_id: id, status: 'sending', form_type: 'circle-join' },
      defaults: {
        create_uid: uid,
        create_name: user_name,
        to_uid: create_uid,
        to_name: create_name,
        content: user_name + '申请加入' + name,
        form_id: id,
        form_type: 'circle-join',
        form_url: circle_url
      }
    } );
    if ( created ) {
      this.success( { message: '等待同意！' } )
    } else {
      this.error( '在申请中！', [] )
    }
  }

  async agree() {
    // 同意加入
    const ctx = this.ctx
    const { apply_id, id, msgId } = ctx.request.body
    if ( !apply_id ) return this.error( '申请人id不存在', [] )
    // 查询申请 加入的目标圈子信息
    const res = await ctx.model.Circle.findOne( { where: { id, is_delete: false } } )
    if ( !res ) return this.error( '圈子不存在！', [] )
    // 查询 申请人的 用户信息
    const userInfo = await ctx.model.User.findOne( { where: { uid: apply_id, is_delete: false } } )
    if ( !userInfo ) return this.error( '用户信息获取错误', [] )
    const { member_uid, member_avatar, current_number, max_number } = res
    if ( current_number >= max_number ) return this.error( '人数超出限制啦', [] )
    console.log( apply_id, member_uid, 'dddddd-----------------' )
    if ( member_uid.includes( apply_id.toString() ) ) return this.error( '已经在圈子内！', [] )
    //   接受邀请的可以直接加入
    member_uid.push( apply_id )
    member_avatar.push( userInfo.avatar_url )
    await ctx.model.Circle.update( {
      member_uid, member_avatar, current_number: current_number + 1
    }, {
      where: {
        id, is_delete: false
      }
    } )
    // 更新之前 发送的消息数据
    await ctx.model.Message.update( { status: 'join-finish' }, { where: { id: msgId, is_delete: false } } )

    // 然后给用户发一条消息
    await ctx.model.Message.create( {
      create_uid: res.create_uid,
      create_name: res.create_name,
      to_uid: apply_id,
      to_name: userInfo.user_name,
      content: '圈主 同意加入' + res.name,
      form_id: id,
      form_type: 'circle-join-success',
      form_url: res.avatar_url
    } )
    return this.success( { message: '同意加入成功！' } )
  }
}

module.exports = CircleController;
