'use strict';

const Controller = require( '../core/base_controller' );

class todoController extends Controller {
  // 查询列表接口---- get
  async getList() {
    const { ctx } = this;
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
    const res = await ctx.model.todo.findAndCountAll( {
      where: {
        is_delete: false,
        content: {
          [Op.like]: keyword
        }
      },
      order: [
        [ 'create_time' ],
      ],
      offset: page,
      limit
    } )
    this.success( res )
  }

  async findOne() {
    const { ctx } = this
    const id = ctx.param.id
    if ( !id ) {
      this.error( 'id不存在', [] )
      return
    }
    const res = await ctx.model.todo.findOne( {
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
      level: { type: 'string', required: true }, // 任务优先级，越大等级越高
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
      remind_time
    } = ctx.request.body
    if ( is_long_todo ) {
      //  表明是长任务，修改 校验逻辑
      rules.content.required = false
      rules.long_content.required = true
    }
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
      uid: (await this.currentUser()).uid, // 当前登录人uid
      name: 'system auto name', // 系统自动生成的 name 名称
      content, // 任务内容
      level, // 任务优先级，歧视是个数字
      execute_time, // 任务的执行时间
      task_type,// 任务类型 默认 person
      labels, // 动态标签,
      is_current_user: true,
      create_uid: (await this.currentUser()).uid,
      remind_time,
    }
    // 一旦任务不属于个人，就需要传递 所属圈子 id
    if ( task_type !== 'person' ) {
      createData.task_from_id = task_from_id
    }
    //  表明是长任务，
    if ( is_long_todo ) {
      createData.long_content = long_content
      createData.is_long_todo = is_long_todo
    }
    //  但设定不是 多人任务
    if ( is_multiplayer === false ) {
      createData.is_multiplayer = false
      createData.is_can_invite = false // 不能邀请他人
      createData.max_user_count = 0
      createData.max_user_count = 'no_invite'
    }
    //  周期任务 ,必传周期时长
    if ( is_cycle_todo ) {
      createData.task_cycle = task_cycle
    }
    //  新增
    if ( !id ) {
      // 周期任务，批量创建，需要先创建一个父亲
      if ( is_cycle_todo ) {
        const data = await ctx.model.todo.create( {
          ...createData,
          has_children: true,
        } )
        for (let i = 0; i < task_cycle; i++) {
          await ctx.mode.todo.create( {
            ...createData,
            execute_time: this.moment( data.execute_time ).add( i, 'days' ),
            parent_id: data.id,
            has_children: false,
            is_can_invite: false, // 作为子任务，不能邀请他人参与
          } )
        }
        this.success( data )
        return
      }
      // 普通 创建
      const data = await ctx.model.todo.create( {
        ...createData
      } )
      this.success( data )
      return
    }
    // 修改
    const res = await ctx.model.todo.update( {
      ...ctx.request.body,
      is_current_user: (await this.currentUser()).uid === ctx.request.body.uid
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
    const res = await ctx.model.todo.findOne( {
      where: {
        id,
        is_delete: false
      }
    } )
    if ( !res ) {
      this.error( '数据库查无数据', [] )
      return
    }
    await ctx.model.todo.update( {
      ...res,
      is_delete: true
    }, {
      where: { id }
    } )
    this.success( { message: '删除成功！' } )
  }
}

module.exports = todoController;
