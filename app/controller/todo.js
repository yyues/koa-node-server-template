'use strict';

const Controller = require( '../core/base_controller' );

class todoController extends Controller {
  // 编写定时器
  todoTimeout( id, type = 'get', timer ) {
    // 限制 数量吧
    const map = new Map()
    // 先取
    if ( type === 'get' ) {
      if ( map.has( id ) ) return map.get( id )
      map.set( id, null )
      return null
    }
    // 再存
    if ( type === 'set' ) {
      map.set( id, timer )
    }
    //  删除
    if ( type === 'delete' ) {
      const time = map.get( id )
      if ( time ) {
        time.clearTimeout()
      }
      // 然后 删除
      map.delete( id )
    }

  }

  // 查询列表接口---- get
  async getList() {
    const ctx = this.ctx;
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
    const { page, limit, keyword, task_from_id } = ctx.query
    const { uid } = await this.currentUser()
    // 修改 查询逻辑
    const query = {
      is_delete: false,
    }
    if ( task_from_id ) {
      // 如果是圈子 下面的id 则 只需要 form_id
      query.task_from_id = task_from_id
    } else {
      // 否则 就是查询用户自己的
      query.create_uid = uid
    }
    const { count, rows } = await ctx.model.Todo.findAndCountAll( {
      where: {
        ...query,
        [Op.or]: [
          { create_uid: uid },
          // sequelize.where( sequelize.fn( 'like', sequelize.col( 'current_uid' ) ), uid.toString() )
          {
            current_uid: {
              [Op.like]: '%' + uid + '%',
            }
          }
          //  使用 like 来查找 数据库的字段 勉强实现查询全部的接口
        ]
      },
      order: [ 'create_time' ],
      offset: Number( page ),
      limit: Number( limit )
    } )
    const q = rows.map( (i => {
      return {
        ...i.toJSON(),
        is_current_user: i.create_uid === uid,
        is_start: this.moment().isBefore( i.execute_time )
      }
    }) )
    this.success( { count, rows: q } )
  }

  async findOne() {
    const { ctx } = this
    const id = ctx.query.id
    if ( !id ) {
      this.error( 'id不存在', [] )
      return
    }
    const { uid } = await this.currentUser()
    const res = await ctx.model.Todo.findOne( {
      where: {
        id,
        is_delete: false
      }
    } )
    // 需要查到 创建者 的 username
    const { user_name } = await ctx.model.User.findOne( {
      where: {
        uid: res.create_uid
      }
    } )

    if ( !res ) {
      this.error( '数据库查无数据', [] )
      return
    }
    this.success( {
      ...res.toJSON(),
      is_current_user: res.create_uid === uid,
      create_name: user_name
    } )
  }

  async findAll() {
    const ctx = this.ctx;
    const { Op } = this.app.Sequelize
    const { uid } = await this.currentUser()
    const { keyword } = ctx.query
    const res = await ctx.model.Todo.findAll( {
      where: {
        content: {
          [Op.like]: '%' + keyword + '%',
        },
        [Op.or]: [
          { create_uid: uid },
          {
            current_uid: {
              [Op.like]: '%' + uid,
            }
          }
          //  使用 like 来查找 数据库的字段 勉强实现查询全部的接口
        ],
        is_delete: false
      }
    } )
    this.success( res )
  }

  // 新增 - 修改
  async save() {
    const { ctx } = this
    const query = ctx.request.body
    const { uid, avatar_url } = await this.currentUser()
    // 设置数据库 保存参数
    const createData = {
      ...ctx.request.body,
      name: '我的待办',
      create_uid: uid,
      create_url: avatar_url,
    }
    //  但设定不是 多人任务
    if ( query.is_multiplayer === false ) {
      createData.is_can_invite = false // 不能邀请他人
      createData.max_number = 0
    }
    //  新增
    if ( !query.id ) {
      // 周期任务
      if ( query.is_cycle_todo ) return await this.AddCycleTodo( createData )
      // 多人任务
      if ( query.is_multiplayer ) return await this.AddMultiplayerTodo( createData )
      // 普通 创建
      const data = await ctx.model.Todo.create( {
        ...createData,
        // 任务内容及长任务存储方式
        content: query.is_long_todo ? '' : query.content,
        long_content: query.is_long_todo ? query.content : '',
      } )
      this.success( { message: '新增待办成功！' } )
      return
    }
    // 修改
    await this.change( query )
  }

  // 删除
  async delete() {
    const { ctx } = this
    const id = ctx.request.body.id
    if ( !id ) return this.error( 'id不存在', [] )
    // 需要 判断一下 是不是 有没有设置提醒， 设置的话删除掉
    const res = await ctx.model.Todo.findOne( {
      where: { id, is_delete: false }
    } )
    if ( !res ) return this.error( '数据库查无数据', [] )
    if ( res.is_exist_remind && this.moment().isBefore( res.remind_time ) ) {
      //  设置 定时器 了 但是 还没有执行   这时候需要移除掉定时器
      this.todoTimeout( id, 'delete' )
    }
    await ctx.model.Todo.update( { is_delete: true }, {
      where: { id }
    } )
    this.success( { message: '删除成功！' } )
  }

  // 接受邀请
  async receiveInvite() {
    const { ctx } = this
    const { uid, avatar_url } = await this.currentUser()
    // 需要调整
    const id = ctx.request.body.id
    if ( !id ) return this.error( 'id不存在', [] )
    // 接受邀请 ，表示新建一条数据，存在关联的数据
    const { current_uid, current_url, max_number, team_number, create_uid } = await ctx.model.Todo.findOne( {
      where: {
        id,
        is_delete: false
      }
    } )
    if ( create_uid === uid ) return this.error( '无需加入！', [] )
    if ( current_uid.includes( uid.toString() ) ) return this.error( '已加入！', [] )
    if ( team_number >= max_number ) return this.error( '成员已满！', [] )
    // 不再新建 一条数据 而是更新用户当前的 成员信息
    current_uid.push( uid )
    current_url.push( avatar_url )
    await ctx.model.Todo.update( {
      current_uid, current_url, team_number: team_number + 1
    }, {
      where: {
        id,
        is_delete: false
      }
    } )
    this.success( { message: '加入成功' } )
  }

  // 发起邀请
  async sendInvite() {
    //  新建一条发送的消息
  }

  // 获取今日待办
  async getTodoByDate() {
    const ctx = this.ctx
    const { date, task_status } = ctx.query
    const { Op } = this.app.Sequelize
    const sequelize = this.app.Sequelize
    const { uid } = await this.currentUser()
    const defaultDate = this.moment().format( 'YYYY-MM-DD' )
    const param = {
      // create_uid: uid,
      is_delete: false,
      execute_time: date || defaultDate
    }
    if ( task_status ) {
      param.task_status = task_status
    }
    // 修改 查找逻辑， 既要能找到自己创建的，也要能找到参加的多人待办
    const res = await ctx.model.Todo.findAll( {
      where: {
        ...param,
        [Op.or]: [
          {
            create_uid: uid,
            finish_uid: {
              [Op.notLike]: '%' + uid + '%',
            }
          },
          // sequelize.where( sequelize.fn( 'like', sequelize.col( 'current_uid' ) ), uid.toString() )
          {
            current_uid: {
              [Op.like]: '%' + uid + '%',
            }
          }
          //  使用 like 来查找 数据库的字段 勉强实现查询全部的接口
        ]
      },
      order: [ 'create_time' ]
    } )
    // 更新 当前用户查询状态
    const req = res.map( i => {
      return {
        ...i.toJSON(),
        is_current_user: i.create_uid === uid
      }
    } )
    this.success( req )
  }

  // 延迟 待办
  async delayTodo() {
    const ctx = this.ctx
    const { id, num } = ctx.request.body
    if ( !id ) return this.error( 'id不存在', [] )
    const res = await ctx.model.Todo.findOne( {
      where: { id }
    } )
    await ctx.model.Todo.update( {
      execute_time: this.moment( res.execute_time ).add( Number( num ) || 1, 'days' ).format( "YYYY-MM-DD" )
    }, { where: { id } } )
    // 如果是多人任务 是否要统一延迟  ???? 提醒不?
    this.success( { message: '延迟成功' } )
  }

  // 完成任务
  async finishTodo() {
    const ctx = this.ctx
    const { uid, avatar_url } = await this.currentUser()
    const id = ctx.request.body.id
    if ( !id ) return this.error( 'id不存在', [] )
    const res = await ctx.model.Todo.findOne( {
      where: { id, is_delete: false }
    } )
    // 新增了定时器 ，所以 需要完善关于 定时器的逻辑
    if ( res.is_exist_remind && this.moment().isBefore( res.remind_time ) ) {
      //  设置 定时器 了 但是 还没有执行
      //   这时候需要移除掉定时器
      this.todoTimeout( id, 'delete' )
    }
    if ( !res.is_multiplayer ) {
      if ( res.task_status !== 'running' ) return this.error( '状态错误', '' )
      //   如果不是 多人任务，直接修改状态
      await ctx.model.Todo.update( {
        task_status: 'finish'
      }, { where: { id, is_delete: false } } )
      return this.success( { message: '完成待办！' } )
    }
    // 是多人任务
    const data = this.oneOfTeamFinish( res.toJSON(), { uid, avatar_url }, 'todo' )
    if ( !data ) return this.error( '数据处理错误', [] )
    await ctx.model.Todo.update( data, { where: { id, is_delete: false } } )
    this.success( { message: '完成多人待办' } )
  }

  // 设置提醒时间----- 这种要靠    前端 过滤掉没有设置定时提醒的任务的----
  async setClockTimeById() {
    const ctx = this.ctx
    const { id, remind_time } = ctx.request.body
    // 先计算差值 diff 为 提醒时间 距 限制还有多久
    const diff = new Date( remind_time ).getTime() - new Date().getTime()
    console.log( diff, '时间差' )
    // 对 小于 15 分钟内 的提醒时间不做校验
    if ( diff < 0 ) return this.error( '待办已过期！', [] )
    if ( diff < 1000 * 60 * 15 ) return this.error( '待办时间不足15分钟', [] )
    // 直接更新数据 -- 然后绑定计时器
    await ctx.model.Todo.update( { remind_time, is_exist_remind: true }, { where: { id, is_delete: false } } )
    // 设置 定时器， 但这个定时器 很有可能是 会 没有执行就被销毁了
    let timer
    // 在 设定前   5分钟执行
    timer = setTimeout( async () => {
      // 定时器到期后
      const todoInfo = await ctx.model.Todo.findOne( { where: { id, is_delete: false } } )
      // 走 微信 服务发送数据
      const data = await this.sendTodoMsg( todoInfo.toJSON(), remind_time, '待办还有5分钟即将到期！' )

      // 失败处理 --- 先不考虑

      // 移除 定时器 map 中的 对应定时器
      this.todoTimeout( id, 'delete' )

    }, diff - 5 * 60 * 1000 )
    // 将 定时器 存储起来
    this.todoTimeout( id, 'set', timer )
    // 算是个异步任务，
    this.success( { message: '设置提醒成功！' } )
  }

  // 新建多人任务处理逻辑 将 新增的 处理逻辑 拆分出来
  async AddMultiplayerTodo( data ) {
    const ctx = this.ctx
    const service = this.service
    //   data 是前端 传递过且经过处理的参数
    let current_uid = [], current_url = []
    const { uid, avatar_url, openid } = await this.currentUser()
    // 新建 多人任务的时候， 自动把 自己的信息 添加到 team 里
    current_uid.push( uid )
    current_url.push( avatar_url )
    await ctx.model.Todo.create( {
      ...data,
      current_uid,
      current_url,
      name: '我的多人待办'
    } )
    this.success( { message: '新建多人待办成功！' } )
  }

  // 将修改的 逻辑拆分出来
  async change( param ) {
    // param 为 接口的传递参数
    const ctx = this.ctx
    const { id } = param
    const res = await ctx.model.Todo.findOne( { where: { id, is_delete: false } } )
    if ( !res ) return this.error( '数据不存在', [] )
    // 校验 是否有定时器存在
    if ( res.is_exist_remind && this.moment().isBefore( res.remind_time ) ) {
      //  设置 定时器 了 但是 还没有执行
      //   这时候需要移除掉定时器
      this.todoTimeout( id, 'delete' )
    }
    await ctx.model.Todo.update( param, {
      where: { id: param.id, is_delete: false }
    } )
    this.success( { message: '修改待办成功！' } );
  }

  // 新建 周期任务
  async AddCycleTodo( data ) {
    // 处理任务
    const ctx = this.ctx

    const days = Number( data.task_cycle ) !== NaN ? Number( data.task_cycle ) : 1
    // 获得 初始执行时间
    const initDate = data.execute_time
    for (let i = 0; i < days; i++) {
      // 是否应该将之后 每天的任务关联到 周期的第一个任务id 呢？？
      await ctx.model.Todo.create( {
        ...data,
        execute_time: this.moment( initDate ).add( i, 'days' ).format( 'YYYY-MM-DD' ),
        name: `周期待办，第${ i + 1 }天`
      } )
    }
    this.success( { message: '创办周期待办成功' } )
  }
}

module.exports = todoController;
