// 需要 每天将 没有完成的待办 更新成 延期状态
const Subscription = require( 'egg' ).Subscription;
const moment = require( 'moment' )
moment.defineLocale( 'zh-cn', {
  months: '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split( '_' ),
  monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split( '_' ),
  weekdays: '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split( '_' ),
  weekdaysShort: '周日_周一_周二_周三_周四_周五_周六'.split( '_' ),
  weekdaysMin: '日_一_二_三_四_五_六'.split( '_' ),
  longDateFormat: {
    LT: 'Ah点mm分',
    LTS: 'Ah点m分s秒',
    L: 'YYYY-MM-DD',
    LL: 'YYYY年MMMD日',
    LLL: 'YYYY年MMMD日Ah点mm分',
    LLLL: 'YYYY年MMMD日ddddAh点mm分',
    l: 'YYYY-MM-DD',
    ll: 'YYYY年MMMD日',
    lll: 'YYYY年MMMD日Ah点mm分',
    llll: 'YYYY年MMMD日ddddAh点mm分'
  },
  meridiemParse: /凌晨|早上|上午|中午|下午|晚上/,
  meridiemHour: function ( hour, meridiem ) {
    if ( hour === 12 ) {
      hour = 0;
    }
    if ( meridiem === '凌晨' || meridiem === '早上' ||
      meridiem === '上午' ) {
      return hour;
    } else if ( meridiem === '下午' || meridiem === '晚上' ) {
      return hour + 12;
    } else {
      // '中午'
      return hour >= 11 ? hour : hour + 12;
    }
  },
  meridiem: function ( hour, minute, isLower ) {
    var hm = hour * 100 + minute;
    if ( hm < 600 ) {
      return '凌晨';
    } else if ( hm < 900 ) {
      return '早上';
    } else if ( hm < 1130 ) {
      return '上午';
    } else if ( hm < 1230 ) {
      return '中午';
    } else if ( hm < 1800 ) {
      return '下午';
    } else {
      return '晚上';
    }
  },
  calendar: {
    sameDay: function () {
      return this.minutes() === 0 ? '[今天]Ah[点整]' : '[今天]LT';
    },
    nextDay: function () {
      return this.minutes() === 0 ? '[明天]Ah[点整]' : '[明天]LT';
    },
    lastDay: function () {
      return this.minutes() === 0 ? '[昨天]Ah[点整]' : '[昨天]LT';
    },
    nextWeek: function () {
      var startOfWeek, prefix;
      startOfWeek = moment().startOf( 'week' );
      prefix = this.unix() - startOfWeek.unix() >= 7 * 24 * 3600 ? '[下]' : '[本]';
      return this.minutes() === 0 ? prefix + 'dddAh点整' : prefix + 'dddAh点mm';
    },
    lastWeek: function () {
      var startOfWeek, prefix;
      startOfWeek = moment().startOf( 'week' );
      prefix = this.unix() < startOfWeek.unix() ? '[上]' : '[本]';
      return this.minutes() === 0 ? prefix + 'dddAh点整' : prefix + 'dddAh点mm';
    },
    sameElse: 'LL'
  },
  ordinalParse: /\d{1,2}(日|月|周)/,
  ordinal: function ( number, period ) {
    switch (period) {
      case 'd':
      case 'D':
      case 'DDD':
        return number + '日';
      case 'M':
        return number + '月';
      case 'w':
      case 'W':
        return number + '周';
      default:
        return number;
    }
  },
  relativeTime: {
    future: '%s内',
    past: '%s前',
    s: '几秒',
    m: '1 分钟',
    mm: '%d 分钟',
    h: '1 小时',
    hh: '%d 小时',
    d: '1 天',
    dd: '%d 天',
    M: '1 个月',
    MM: '%d 个月',
    y: '1 年',
    yy: '%d 年'
  },
  week: {
    // GB/T 7408-1994《数据元和交换格式·信息交换·日期和时间表示法》与ISO 8601:1988等效
    dow: 1, // Monday is the first day of the week.
    doy: 4  // The week that contains Jan 4th is the first week of the year.
  }
} );

class UpdateCache extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      // interval: '1d', // 1 天吧
      type: 'all', // 指定所有的 worker 都需要执行
      // 每天凌晨 四点更新
      cron: '0 0 4 * * ?',
      immediate: true
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
        task_status: 'running',
        execute_time: {
          [Op.lt]: new Date( moment().format( 'YYYY-MM-DD' ) )
        }
      }
    } )
    console.log( '定时任务被执行了，滴滴滴滴滴--------', res.length )
    for (let i = 0; i < res.length; i++) {
      const element = res[i]
      await Todo.update( {
          is_delay: true,
          delay_time: moment( element.execute_time ).fromNow( true ),
          task_status: 'delayed'
        }, { where: { id: element.id } }
      )
    }
    //  更新成功
  }
}

module.exports = UpdateCache;