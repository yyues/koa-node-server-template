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
    await queryInterface.createTable( 'stars', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 }, // 唯一 id
      uid: { type: INTEGER, allowNull: false }, // 待办任务关联的用户 uid
      form_id: { type: STRING, allowNull: true },// 归属的id， 表示从圈子发布的还是个人发布的
      form_type: { type: STRING( 10 ), defaultValue: 'person' }, // 是个人发布的还是圈子发布的
      star_count: { type: INTEGER, defaultValue: 0 },// 点赞数量
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
    await queryInterface.dropTable( 'stars' );
  }
};
