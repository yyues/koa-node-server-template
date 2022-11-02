// 需要 每天将 没有完成的待办 更新成 延期状态
const Subscription = require( 'egg' ).Subscription;
const moment = require( 'moment' )

class UpdateCache extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      // interval: '1d', // 1 天吧
      type: 'all', // 指定所有的 worker 都需要执行
      // 每三小时准点执行一次
      cron: '0 0 4 1 * *',
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    //  sequelize 批量更新
    const Todo = this.ctx.model.Todo
    const Op = this.app.Sequelize.Op
    const sequelize = this.app.Sequelize
    //  拿到实例 --- 找到 执行时间在今天的，都更新为 逾期 状态
    const res = await Todo.findAll( {
      where: {
        is_delete: false,
        [Op.or]: [ sequelize.fn( 'date', sequelize.col( 'execute_time' ), '<', moment().format( 'YYYY-MM-DD' ) ) ]
      }
    } )
    for (let i = 0; i < res.toJSON(); i++) {
      const element = res.toJSON()[i]
      await Todo.update( {
          is_delay: true,
          delay_time: moment().diff( element.execute_time ),
          status: 'delayed'
        }, { where: { id: element.id } }
      )
    }
    //  更新成功
  }
}

module.exports = UpdateCache;