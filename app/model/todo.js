'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE, BOOLEAN, UUID, UUIDV4 } = app.Sequelize;

  const todo = app.model.define( 'todo', {
    id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 }, // 用户 uid
    create_uid: { type: INTEGER, allowNull: true }, // 创建人 uid
    create_url: { type: STRING, allowNull: true }, //创建 uid 的头像
    name: { type: STRING( 16 ), allowNull: true,  }, // 任务名称，可以没有，但一定要有任务内容
    content: { type: STRING( 49 ), allowNull: true }, // 任务内容，长度限制49个字符
    long_content: { type: STRING( 99 ), allowNull: true }, // 长任务内容， 长度较普通提高50至99字符
    level: { type: INTEGER, defaultValue: 0 }, // 任务优先级，数字越大表明优先级最高
    is_long_todo: { type: BOOLEAN, defaultValue: false }, // 是否是长任务，简化前端判断
    description: { type: STRING( 49 ), allowNull: true }, // 待办描述，长度49字符
    remark: { type: STRING( 19 ), allowNull: true }, // 待办的备注， 长度应该不长，限制19
    start_time: { type: STRING( 16 ), allowNull: true }, // 开始时间 ‘10：00’
    end_time: { type: STRING( 16 ), allowNull: true }, // 结束时间 ‘10：00’
    deadline: { type: STRING( 16 ), allowNull: true },// 时间截止线， 不一定非要选择开始世界和结束时间，而是选择一个截止时间
    is_deadline: { type: BOOLEAN, defaultValue: false }, // 是否是截止时间， 目前不是的，目前默认选择 的是时间范围
    execute_time: { type: STRING, allowNull: true, }, // 任务的执行时间，前期可不做要求
    is_cycle_todo: { type: BOOLEAN, defaultValue: false }, // 是否是 周期任务，指可以创建一系列的周期任务，简化前端判断
    has_children: { type: BOOLEAN, defaultValue: false }, // 是否含有子任务的判断，主要是关联周期任务里的子任务
    has_parent: { type: BOOLEAN, defaultValue: false }, // 是否 关联 有父任务
    parent_id: { type: UUID, allowNull: true }, // 作为 系列任务中的子任务，存在关联的父id
    is_exist_remind: { type: BOOLEAN, defaultValue: false }, // 默认是不设置打卡提醒的，似乎这个要用到公众号
    remind_time: { type: STRING, allowNull: true }, // 微信的 打卡提醒时间， 可以忽略
    labels: {
      type: STRING,
      allowNull: true,
      get() {
        const data = this.getDataValue( 'labels' );
        return data ? data.split( ';' ) : [];
      },
      set( val = [] ) {
        this.setDataValue( 'labels', val.join( ';' ) );
      },
    }, // 动态标签
    task_cycle: { type: INTEGER, defaultValue: 1 }, // 任务周期 一般一个任务只有一天的周期， 单位天， 类型 number
    is_multiplayer: { type: BOOLEAN, defaultValue: false }, // 是否是多人任务
    is_current_user: { type: BOOLEAN, defaultValue: true }, // 是否是当前用户创建的todo
    is_can_invite: { type: BOOLEAN, defaultValue: true }, // 是否可以邀请多人参与
    current_uid: {
      type: STRING, allowNull: true,
      get() {
        const data = this.getDataValue( 'current_uid' );
        return data ? data.split( ';' ) : [];
      },
      set( val = [] ) {
        this.setDataValue( 'current_uid', val.join( ';' ) );
      },
    }, //  当前 待办内的 用户 uid 集合
    current_url: {
      type: STRING, allowNull: true,
      get() {
        const data = this.getDataValue( 'current_url' );
        return data ? data.split( ';' ) : [];
      },
      set( val = [] ) {
        this.setDataValue( 'current_url', val.join( ';' ) );
      },
    }, //  当前 待办内的 用户 头像集合
    team_number: { type: INTEGER, defaultValue: 1 }, // 当前 待办内的 用户人数 默认是 1 因为群主也在内
    finish_number: { type: INTEGER, defaultValue: 0 }, // 已完成的人数，只有多人任务才会有，默认是0
    finish_uid: {
      type: STRING, allowNull: true,
      get() {
        const data = this.getDataValue( 'finish_uid' );
        return data ? data.split( ';' ) : [];
      },
      set( val = [] ) {
        this.setDataValue( 'finish_uid', val.join( ';' ) );
      },
    }, // 当前完成代办的任务
    finish_url: {
      type: STRING, allowNull: true,
      get() {
        const data = this.getDataValue( 'finish_url' );
        return data ? data.split( ';' ) : [];
      },
      set( val = [] ) {
        this.setDataValue( 'finish_url', val.join( ';' ) );
      },
    }, //  当前 待办内的 用户 头像集合
    max_number: { type: INTEGER, defaultValue: 36 }, // 任务最多参与人数，默认36人吧
    task_status: { type: STRING( 10 ), defaultValue: 'running' }, // 创建完任务后，状态就更新为进行中
    task_type: { type: STRING( 19 ), defaultValue: 'person' }, // 任务类型，一般是代表个人的
    task_from_id: { type: STRING, allowNull: true }, // 待办的所属圈子id
    is_delay: { type: BOOLEAN, defaultValue: false }, // 是否延期
    delay_time: { type: STRING, allowNull: true },// 逾期时间
    bg_url: { type: STRING, allowNull: true }, // 我可以有一个背景图片
    primary_color: { type: STRING, allowNull: true }, // 同样可以有一个 主体颜色，
    is_delete: { type: BOOLEAN, defaultValue: false }, // 伪删除，正常状态是false，删除是true
    create_time: DATE,
    update_time: DATE,
  }, {
    // 不要忘记启用时间戳！
    timestamps: true,
    createdAt: 'create_time',
    updatedAt: 'update_time',
  } );

  return todo;
};
