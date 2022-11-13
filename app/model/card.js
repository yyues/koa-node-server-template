'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE, BOOLEAN, UUID, UUIDV4 } = app.Sequelize;

  const Card = app.model.define( 'star', {
    id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 }, // 唯一 id
    uid: { type: INTEGER, allowNull: false }, // 创建人 的 uid
    form_id: { type: STRING, allowNull: true }, // 发起 的圈子 打卡， 目前不需要广场打卡，这个打卡也可以是个人发起的
    form_type: { type: STRING( 10 ), defaultValue: 'person' }, // 是个人发布的还是圈子发布的
    form_status: { type: STRING( 10 ) }, // 点赞的是圈子还是广场
    is_finished_today: { type: BOOLEAN, defaultValue: false },// 是否需要完成当天任务
    is_has_mark: { type: BOOLEAN, defaultValue: false },// 是否需要添加感想
    is_person: { type: BOOLEAN, defaultValue: true }, // 是否是个人的打卡任务
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
    children_uid: {
      type: STRING,
      allowNull: true,
      get() {
        return this.getDataValue( 'children_uid' ).split( ';' );
      },
      set( val ) {
        this.setDataValue( 'children_uid', val.join( ';' ) );
      },
    },// 打卡人的 uid 集合
    finished_uid: {
      type: STRING,
      allowNull: true,
      get() {
        return this.getDataValue( 'children_uid' ).split( ';' );
      },
      set( val ) {
        this.setDataValue( 'children_uid', val.join( ';' ) );
      },
    },// 已完成打卡人的 uid 集合
    finished_count: { type: INTEGER, defaultValue: 0 }, // 打卡数量
    content: { type: STRING( 99 ), allowNull: true, }, //  内容
    status: { type: STRING( 6 ), defaultValue: 'sending' }, // 状态， 进行，完成，过期
    is_delete: { type: BOOLEAN, defaultValue: false }, // 伪删除，正常状态是false，删除是true
    is_delay: { type: BOOLEAN, defaultValue: false }, // 是否延期， 可以延迟打卡
    execute_time: { type: DATE( 6 ), allowNull: true, defaultValue: new Date() }, // 任务的执行时间，前期可不做要求
    deadline: { type: DATE( 6 ), allowNull: true, defaultValue: new Date() }, // 截止时间
    create_time: DATE( 6 ),
    update_time: DATE( 6 ),
  }, {
    // 不要忘记启用时间戳！
    timestamps: true,
    createdAt: 'create_time',
    updatedAt: 'update_time',
  } );

  return Card;
};
