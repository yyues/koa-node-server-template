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
    await queryInterface.createTable( 'circle', {
      id: { type: UUID, defaultValue: UUIDV4, primaryKey: true }, // 圈子的id， 唯一主键
      create_uid: { type: INTEGER, allowNull: true }, // 圈主 的 uid
      create_name: { type: STRING, allowNull: false }, // 圈主 的  name
      name: { type: STRING( 19 ), allowNull: false }, // 圈子 名称
      content: { type: STRING( 99 ), allowNull: false, defaultValue: '还没有内容哦！' }, // 圈子的 内容
      is_current_user: { type: BOOLEAN, defaultValue: false }, // 是否是当前用户创建的 圈子
      overdue_time: { type: DATE( 6 ), allowNull: true }, // 圈子过期时间，默认可以不设置
      avatar_url: { type: STRING, allowNull: false },// 圈子头像
      is_private: { type: BOOLEAN, defaultValue: false }, // 是否是私密的
      max_persons: { type: INTEGER, defaultValue: 50 }, // 圈子最多人数
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
      status: { type: STRING( 10 ), defaultValue: 'created' }, // 圈子 状态
      wx_image_url: { type: STRING, allowNull: true }, // 微信群聊名片url
      wx_image_out: { type: DATE( 6 ), allowNull: true }, // 群聊图片过期时间
      wx_master: { type: STRING, allowNull: true }, // 圈主 微信
      wx_mark: { type: STRING, allowNull: true }, // 圈主 微信备注
      is_master: { type: BOOLEAN, defaultValue: false }, // 是否是管方发布的
      is_can_star: { type: BOOLEAN, defaultValue: true }, // 是否可以点赞
      star_count: { type: INTEGER, defaultValue: 0 }, // 点赞数量
      is_stared: { type: BOOLEAN, defaultValue: true }, // 当前用户是否点赞过了
      is_timing_publish: { type: BOOLEAN, defaultValue: false }, // 是否定时创建圈子
      publish_time: { type: INTEGER, allowNull: true }, //  定时发布 时间， 一般都是立刻创建圈子, 时间戳存储
      description: { type: STRING( 49 ), allowNull: true }, // 描述，长度49字符
      remark: { type: STRING( 19 ), allowNull: true }, // 备注， 长度应该不长，限制19
      is_delete: { type: BOOLEAN, defaultValue: false }, // 伪删除，正常状态是false，删除是true
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
    await queryInterface.dropTable( 'circle' );
  },
};
