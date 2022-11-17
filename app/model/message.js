'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE, BOOLEAN, UUID, UUIDV4 } = app.Sequelize;

  const Message = app.model.define( 'message', {
    id: { type: UUID, primaryKey: true, defaultValue: UUIDV4 }, // 唯一 id
    create_uid: { type: INTEGER, allowNull: true }, // 创建人 的 uid
    create_name: { type: STRING, allowNull: false }, // 创建人 的  name
    to_uid: { type: INTEGER, allowNull: true }, // 接收人 的
    to_name: { type: STRING, allowNull: true }, // 接收人 的  name
    status: { type: STRING( 30 ), defaultValue: 'sending' }, // 状态， 发送中，已接收，撤回
    content: { type: STRING( 99 ), allowNull: true, }, //  内容
    form_id: { type: STRING, allowNull: true, }, // 发起的 id ，可能是有 圈子发起的消息
    form_type: { type: STRING( 30 ), defaultValue: 'person' }, //个人 发起的  还是圈子 发起的
    form_url: { type: STRING, allowNull: true }, // 关联的 待办或者 群聊图片
    overdue_time: { type: DATE( 6 ), allowNull: true }, // 过期时间，默认可以不设置
    is_private: { type: BOOLEAN, defaultValue: false }, // 是否是私密的
    remark: { type: STRING( 19 ), allowNull: true }, // 备注， 长度应该不长，限制19
    is_delete: { type: BOOLEAN, defaultValue: false }, // 伪删除，正常状态是false，删除是true
    create_time: DATE( 6 ),
    update_time: DATE( 6 ),
  }, {
    // 不要忘记启用时间戳！
    timestamps: true,
    createdAt: 'create_time',
    updatedAt: 'update_time',
  } );

  return Message;
};
