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
    await queryInterface.createTable( 'messages', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 }, // 唯一 id
      create_uid: { type: INTEGER, allowNull: true }, // 创建人 的 uid
      create_name: { type: STRING, allowNull: false }, // 创建人 的  name
      to_uid: { type: INTEGER, allowNull: true }, // 接收人 的
      to_name: { type: STRING, allowNull: false }, // 接收人 的  name
      content: { type: STRING( 99 ), allowNull: false, defaultValue: '还没有内容哦！' },//圈子的 内容
      form_type: { type: STRING( 10 ), defaultValue: 'person' }, // 是个人发布的还是圈子发布的
      overdue_time: { type: DATE, allowNull: true }, // 过期时间，默认可以不设置
      is_private: { type: BOOLEAN, defaultValue: false }, // 是否是私密的
      remark: { type: STRING( 19 ), allowNull: true }, // 备注， 长度应该不长，限制19
      is_delete: { type: BOOLEAN, defaultValue: false }, // 伪删除，正常状态是false，删除是true
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
    await queryInterface.dropTable( 'messages' );
  }
};
