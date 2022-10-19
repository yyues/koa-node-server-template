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
    await queryInterface.createTable( 'square', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 }, // id
      uid: { type: INTEGER, allowNull: true }, // 待办任务关联的用户 uid
      create_name: { type: STRING, allowNull: false }, // 创建人 name
      content: { type: STRING( 99 ), allowNull: false, defaultValue: '还没有内容哦！' },// 发布的内容
      is_current_user: { type: BOOLEAN, defaultValue: false }, // 是否是当前用户创建的todo
      overdue_time: { type: DATE, allowNull: true }, // 圈子过期时间，默认可以不设置
      is_private: { type: BOOLEAN, defaultValue: false }, // 是否是私密的
      status: { type: STRING( 10 ), defaultValue: 'created' },// 发布的 广场状态
      labels: {
        type: STRING,
        allowNull: true,
        get() {
          return this.getDataValue( 'labels' ).split( ';' )
        },
        set( val ) {
          this.setDataValue( 'labels', val.join( ';' ) );
        },
      }, // 动态标签
      image_url: { type: STRING, allowNull: true }, // 微信群聊名片url
      form_id: { type: STRING, allowNull: true },// 归属的id， 表示从圈子发布的还是个人发布的
      is_master: { type: BOOLEAN, defaultValue: false }, // 是否是管方发布的
      form_type: { type: STRING( 10 ), defaultValue: 'person' }, // 是个人发布的还是圈子发布的
      is_can_star: { type: BOOLEAN, defaultValue: true }, // 是否可以点赞
      star_count: { type: INTEGER, defaultValue: 0 },// 点赞数量
      is_timing_delete: { type: BOOLEAN, defaultValue: false },// 是否定时删除
      delete_time: { type: DATE, allowNull: true },// 定期删除时间
      is_timing_publish: { type: BOOLEAN, defaultValue: false },// 是否定时发布
      publish_time: { type: DATE, allowNull: true },//  定时发布 时间， 一半都是立刻发布
      description: { type: STRING( 49 ), allowNull: true }, // 描述，长度49字符
      remark: { type: STRING( 19 ), allowNull: true }, // 备注， 长度应该不长，限制19
      is_delete: { type: BOOLEAN, defaultValue: false }, // 伪删除，正常状态是false，删除是true
      create_time: DATE,
      update_time: DATE,
    }, {
      // 不要忘记启用时间戳！
      timestamps: true,
      // 不想要 createdAt
      createdAt: 'create_time',
      updatedAt: 'update_time'
    } );
  },

  async down( queryInterface, Sequelize ) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable( 'square' );
  }
};
