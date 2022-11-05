'use strict';

const Controller = require( '../core/base_controller' );

class todoController extends Controller {
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
    console.log( ctx.query, 'dddd' )
    if ( !val.status ) {
      // 校验 不通过
      this.error( '校验不通过', val.error )
      return
    }
    const { page, limit, keyword } = ctx.query
    const { uid } = await this.currentUser()
    const { count, rows } = await ctx.model.Todo.findAndCountAll( {
      where: {
        is_delete: false,
        // ...!!keyword && {
        //   content: {
        //     [Op.like]: keyword
        //   }
        // },
        create_uid: uid
      },
      // order: [
      //   [ 'create_time' ],
      // ],
      offset: Number( page ),
      limit: Number( limit )
    } )
    const q = rows.map( (i => {
      return {
        ...i.toJSON(),
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
    this.success( res )
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
      remind_time: { type: 'date', required: false }, // 提醒时间 可以不需要
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
      createData.max_user_count = 0
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
      ...ctx.request.body,
      is_current_user: user.uid === ctx.request.body.uid
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
    const res = await ctx.model.Todo.findOne( {
      where: {
        id,
        is_delete: false
      }
    } )
    const param = {
      create_uid: res.create_uid,
      create_url: res.create_url,
      name: res.name,
      content: res.content,
      is_long_todo: res.is_long_todo,
      description: res.description,
      start_time: res.start_time,
      end_time: res.end_time,
      deadline: res.deadline,
      is_deadline: res.is_deadline,
      execute_time: res.execute_time,
      is_cycle_todo: res.is_cycle_todo,
      task_cycle: res.task_cycle,
      parent_id: id,
      labels: res.labels,
      is_current_user: false,
      is_can_invite: false,
      is_invited: false,
      is_delay: res.is_delay,
      delay_time: this.moment().diff( res.execute_time )
    }
    await ctx.model.Todo.create( param )
    this.success( { message: '接受邀请成功' } )
  }

  // 发起邀请
  async sendInvite() {
    //  新建一条发送的消息
  }

  // 获取今日待办
  async getTodoByDate() {
    const ctx = this.ctx
    const { date, task_status } = ctx.query
    const { uid } = await this.currentUser()
    const defaultDate = this.moment().format( 'YYYY-MM-DD' )
    const param = {
      create_uid: uid,
      is_delete: false,
      execute_time: date || defaultDate
    }
    if ( task_status ) {
      param.task_status = task_status
    }
    const res = await ctx.model.Todo.findAll( {
      where: param,
      order: [ 'create_time' ]
    } )
    this.success( res )
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
    // this.success(  { message: '延迟成功' } )
  }

  // 完成任务
  async finishTodo() {
    const ctx = this.ctx
    const { uid, avatar_url } = await this.currentUser()
    const id = ctx.request.body.id
    if ( !id ) return this.error( 'id不存在', [] )
    //  判断是不是多人任务， 先判断不是的
    const { is_multiplayer, create_uid, parent_id } = await ctx.model.Todo.findOne( {
      where: { id, is_delete: false }
    } )
    // 再优化逻辑， 先 统一更新自己的状态，然后 判断是不是是多人任务，
    // 是多人任务的话，就把 父任务 对应的数据更新就行
    await ctx.model.Todo.update( {
      task_status: 'finish'
    }, {
      where: { id, is_delete: false }
    } )
    if ( parent_id ) {
      //   多人任务的话 需要找到 父任务更新状态
      const { finish_number } = await ctx.model.Todo.findOne( {
        where: { id: parent_id, is_delete: false }
      } )
      // 更新 父任务里的完成人数而已
      await ctx.model.Todo.update( {
        finish_number: finish_number + 1
      }, {
        where: { id: parent_id, is_delete: false }
      } )
    }
    this.success( { message: '完成待办！' } )
  }
}

module.exports = todoController;
