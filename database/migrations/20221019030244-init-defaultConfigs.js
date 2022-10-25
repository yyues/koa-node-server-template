'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    const { INTEGER, DATE, STRING, BOOLEAN, UUID, UUIDV4 } = Sequelize;
    await queryInterface.createTable('defaultConfigs', {
      id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 },
      wx_image_default_url: { type: STRING, allowNull: true }, // 微信群聊名片url
      card_image_default_url: { type: STRING, allowNull: true }, // 卡片默认url
      bg_default_url: { type: STRING, allowNull: true }, // 背景默认url
      avatar_default_url: { type: STRING, allowNull: true }, // 头像默认url
      label_default_url: { type: STRING, allowNull: true }, // 标签默认url
      add_new_default_url: { type: STRING, allowNull: true }, // 添加默认url
      edit_default_url: { type: STRING, allowNull: true }, // 编辑默认url
      music_default_url: { type: STRING, allowNull: true }, // 音乐默认url
      create_time: DATE( 6 ),
      update_time: DATE( 6 ),
    }, {
      // 不要忘记启用时间戳！
      timestamps: true,
      // 不想要 createdAt
      createdAt: 'create_time',
      updatedAt: 'update_time',
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('defaultConfigs');
  },
};
