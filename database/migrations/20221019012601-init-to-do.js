'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up( queryInterface, Sequelize ) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    const { INTEGER, DATE, STRING, BOOLEAN, UUID, UUIDV4 } = Sequelize;
    await queryInterface.createTable( 'to_do', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 }, // 用户 uid
      uid: { type: INTEGER, allowNull: true }, // 待办任务关联的用户 uid
      name: { type: STRING( 16 ), allowNull: true }, // 任务名称，可以没有，但一定要有任务内容
      content: { type: STRING( 49 ), allowNull: true }, // 任务内容，长度限制49个字符
      long_content: { type: STRING( 99 ), allowNull: true }, // 长任务内容， 长度较普通提高50至99字符
      level: { type: INTEGER, defaultValue: 0 }, // 任务优先级，数字越大表明优先级最高
      is_long_todo: { type: BOOLEAN, defaultValue: false }, // 是否是长任务，简化前端判断
      description: { type: STRING( 49 ), allowNull: true }, // 待办描述，长度49字符
      remark: { type: STRING( 19 ), allowNull: true }, // 待办的备注， 长度应该不长，限制19
      execute_time: { type: DATE( 6 ), allowNull: true, defaultValue: new Date() }, // 任务的执行时间，前期可不做要求
      is_cycle_todo: { type: BOOLEAN, defaultValue: false }, // 是否是 周期任务，指可以创建一系列的周期任务，简化前端判断
      has_children: { type: BOOLEAN, defaultValue: false }, // 是否含有子任务的判断，主要是关联周期任务里的子任务
      parent_id: { type: UUID, allowNull: true }, // 作为 系列任务中的子任务，存在关联的父id
      remind_time: { type: DATE( 6 ), allowNull: true }, // 微信的 打卡提醒时间， 可以忽略
      labels: {
        type: STRING,
        allowNull: true,
        get() {
          return this.getDataValue( 'labels' ).split( ';' );
        },
        set( val ) {
          this.setDataValue( 'labels', val.join( ';' ) );
        },
      }, // 动态标签
      is_exist_remind: { type: BOOLEAN, defaultValue: false }, // 默认是不设置打卡提醒的，似乎这个要用到公众号
      task_cycle: { type: INTEGER, defaultValue: 1 }, // 任务周期 一般一个任务只有一天的周期， 单位天， 类型 number
      is_multiplayer: { type: BOOLEAN, defaultValue: false }, // 是否是多人任务
      is_current_user: { type: BOOLEAN, defaultValue: false }, // 是否是当前用户创建的todo
      is_can_invite: { type: BOOLEAN, defaultValue: true }, // 是否可以邀请多人参与
      is_invited: { type: BOOLEAN, defaultValue: false }, // 是否已经邀请过他人参与
      max_user_count: { type: INTEGER, defaultValue: 19 }, // 任务最多参与人数，默认19人吧
      create_uid: { type: INTEGER, allowNull: true, }, // 创建人 uid
      invite_uid: {
        type: INTEGER, allowNull: true,
        get() {
          return this.getDataValue( 'invite_uid' ).split( ';' );
        },
        set( val ) {
          this.setDataValue( 'invite_uid', val.join( ';' ) );
        },
      }, //  邀请人 uid
      invite_time: { type: DATE, allowNull: true }, // 发起 邀请时间
      task_status: { type: STRING( 10 ), defaultValue: 'running' }, // 创建完任务后，状态就更新为进行中
      task_type: { type: STRING( 6 ), defaultValue: 'person' }, // 任务类型，一般是代表个人的
      task_from_id: { type: STRING, defaultValue: 'person' }, // 待办的所属圈子id
      is_delete: { type: BOOLEAN, defaultValue: false }, // 伪删除，正常状态是false，删除是true
      is_delay: { type: BOOLEAN, defaultValue: false }, // 是否延期
      delay_time: { type: STRING, defaultValue: '还没有逾期哦！' },// 逾期时间
      create_time: DATE( 6 ),
      update_time: DATE( 6 ),
    }, {
      // 不要忘记启用时间戳！
      timestamps: true,
      // 不想要 createdAt
      createdAt: 'create_time',
      updatedAt: 'update_time',
    } );

  },

  async down( queryInterface, Sequelize ) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable( 'to_do' );
  },
};
