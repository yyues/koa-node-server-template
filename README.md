### Wx-todo

本意是做个node版本的后端服务，主要是实现一个`todoList` 的界面，参考小程序 `主线程`的界面来描述对应的接口及其说明

使用说明

- 请在本地准备 `wx-todo`的数据库

#### 数据库创建教程

本项目采用的 是  `egg-sequelize` 及 `sequelize-li` 来实现的数据库表简历

新建users 表

```javascript
npx sequelize migration:generate --name=init-users
```

执行完后会在 `database/migrations` 目录下生成一个 migration 文件(`${timestamp}-init-users.js`)，

```javascript
'use strict';

module.exports = {
  // 在执行数据库升级时调用的函数，创建 users 表
  up: async (queryInterface, Sequelize) => {
    const { INTEGER, DATE, STRING } = Sequelize;
    await queryInterface.createTable('users', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      name: STRING(30),
      age: INTEGER,
      created_at: DATE,
      updated_at: DATE,
    });
  },
  // 在执行数据库降级时调用的函数，删除 users 表
  down: async (queryInterface) => {
    await queryInterface.dropTable('users');
  },
};
```

然后是 执行数据库变更

```
# 升级数据库
npx sequelize db:migrate
# 如果有问题需要回滚，可以通过 `db:migrate:undo` 回退一个变更
# npx sequelize db:migrate:undo
# 可以通过 `db:migrate:undo:all` 回退到初始状态
# npx sequelize db:migrate:undo:all
```

