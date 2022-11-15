'use strict';

const Controller = require( '../core/base_controller' );

class todoController extends Controller {
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
              [Op.like]: '%' + uid,
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

  // 新增 - 修改
  async save() {
    const { ctx } = this
    const rules = {
      id: { type: 'string', required: false }, // 有ID表明修改，没有新增
      content: { type: 'string', required: true },
      long_content: { type: 'string', required: false },
      is_long_todo: { type: 'boolean', required: false },
      level: { type: 'number', required: true }, // 任务优先级，越大等级越高
      execute_time: { type: 'string', required: true },// 执行的时间
      is_cycle_todo: { type: 'boolean', required: false }, // 是否是 周期任务
      labels: { type: 'array', required: false },
      remind_time: { type: 'string', required: false }, // 提醒时间 可以不需要
      task_type: { type: 'string', required: true }, // 任务类型，表示所属类型或者所属圈子
      task_from_id: { type: 'string', required: false }, // 归属的圈子id 需要 连表查询所属的数据
      is_multiplayer: { type: 'boolean', required: false }, // 是否是多人任务
    }
    const {
      is_long_todo,
      task_type,
      id,
      content,
      level,
      execute_time,
      labels,
      long_content,
      task_from_id,
      is_multiplayer,
      is_cycle_todo,
      task_cycle,
      remind_time,
      start_time,
      end_time,
      description
    } = ctx.request.body
    const { uid, avatar_url } = await this.currentUser()

    console.log( ctx.request.body, '请求参数' )

    if ( task_type !== 'person' ) {
      // 一旦任务不属于个人，就需要传递 所属圈子 id
      rules.task_from_id.required = true
    }
    if ( is_cycle_todo ) {
      //  周期任务 ,必传周期时长，单位天
      rules.task_cycle = { type: 'number', required: true, max: 1000 }
    }
    // 校验  参数
    const val = this.Validate( rules, ctx.request.body )
    if ( !val.status ) {
      // 校验 不通过
      this.error( '校验不通过', val.error )
      return
    }
    // 设置数据库 保存参数
    const createData = {
      ...ctx.request.body,
      // uid: (await this.currentUser()).uid, // 当前登录人uid
      name: 'system auto name', // 系统自动生成的 name 名称
      // content, // 任务内容
      level, // 任务优先级，歧视是个数字
      execute_time: this.moment( execute_time ).format( 'YYYY-MM-DD' ), // 任务的执行时间
      task_type,// 任务类型 默认 person
      labels: labels ?? [], // 动态标签,
      is_current_user: true,
      create_uid: uid,
      create_url: avatar_url,
      remind_time,
      start_time,
      end_time,
      is_long_todo,
      description
    }
    // 一旦任务不属于个人，就需要传递 所属圈子 id
    if ( task_type !== 'person' ) {
      createData.task_from_id = task_from_id
    }

    //  但设定不是 多人任务
    if ( is_multiplayer === false ) {
      createData.is_multiplayer = false
      createData.is_can_invite = false // 不能邀请他人
      createData.max_number = 0
    }
    //  周期任务 ,必传周期时长
    if ( is_cycle_todo ) {
      createData.task_cycle = task_cycle
    }
    //  新增
    if ( !id ) {
      // 周期任务，批量创建，需要先创建一个父亲
      if ( is_cycle_todo ) {
        const data = await ctx.model.Todo.create( {
          ...createData,
          // 任务内容及长任务存储方式
          content: is_long_todo ? '' : content,
          long_content: is_long_todo ? content : '',
          has_children: true,
        } )
        for (let i = 0; i < task_cycle; i++) {
          await ctx.model.Todo.create( {
            ...createData,
            execute_time: this.moment( data.execute_time ).add( i, 'days' ).format( 'YYYY-MM-DD' ),
            parent_id: data.id,
            has_children: false,
            is_can_invite: false, // 作为子任务，不能邀请他人参与
          } )
        }
        this.success( data )
        return
      }
      // 普通 创建
      const data = await ctx.model.Todo.create( {
        ...createData,
        // 任务内容及长任务存储方式
        content: is_long_todo ? '' : content,
        long_content: is_long_todo ? content : '',
        create_uid: uid
      } )
      this.success( data )
      return
    }
    // 修改
    const res = await ctx.model.Todo.update( {
      ...ctx.request.body
    }, {
      where: {
        id,
        is_delete: false
      }
    } )
    this.success( res );
  }

  // 删除
  async delete() {
    const { ctx } = this
    const id = ctx.request.body.id
    if ( !id ) {
      this.error( 'id不存在', [] )
      return
    }
    const res = await ctx.model.Todo.findOne( {
      where: {
        id,
        is_delete: false
      }
    } )
    if ( !res ) {
      this.error( '数据库查无数据', [] )
      return
    }
    await ctx.model.Todo.update( {
      ...res,
      is_delete: true
    }, {
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
          { create_uid: uid },
          // sequelize.where( sequelize.fn( 'like', sequelize.col( 'current_uid' ) ), uid.toString() )
          {
            current_uid: {
              [Op.like]: '%' + uid,
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
    //  判断是不是多人任务， 先判断不是的
    const {
      is_multiplayer,
      current_uid,
      current_url,
      team_number,
      finish_number,
      finish_uid,
      finish_url,
      task_status
    } = await ctx.model.Todo.findOne( {
      where: { id, is_delete: false }
    } )
    if ( !is_multiplayer ) {
      if ( task_status !== 'running' ) return this.error( '状态错误', '' )
      //   如果不是 多人任务，直接修改状态
      await ctx.model.Todo.update( {
        task_status: 'finish'
      }, { where: { id, is_delete: false } } )
      return this.success( { message: '完成待办！' } )
    }
    // 是多人任务
    const id_index = current_uid.findIndex( uid )
    const url_index = current_url.findIndex( avatar_url )
    if ( id_index == -1 ) return this.error( '当前待办已完成', '' )
    current_uid.splice( id_index, 1 )
    current_url.splice( url_index, 1 )
    finish_url.push( avatar_url )
    finish_uid.push( uid )
    await ctx.model.Todo.update( {
      current_uid,
      current_url,
      team_number: team_number - 1,
      finish_number: finish_number + 1,
      finish_uid,
      finish_url
    }, { where: { id, id_delete: false } } )
    this.success( { message: '完成多人待办' } )
  }

  // 设置提醒时间
  async setClockTimeById() {
    const ctx = this.ctx
    const { id, remind_time } = ctx.request.body
    const formatTime = this.moment( remind_time ).format( 'YYYY-MM-DD HH:mm' )
    await ctx.model.Todo.update( {
      remind_time: formatTime,
      is_exist_remind: true
    }, { where: { id, is_delete: false } } )
    // 然后应该做个 定时任务，在 两小时发一次提醒
    console.log( { formatTime } )
    this.success( [] )
  }
}

module.exports = todoController;
