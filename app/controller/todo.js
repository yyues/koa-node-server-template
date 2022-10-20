'use strict';

const Controller = require( '../core/base_controller' );

class todoController extends Controller {
  // 查询列表接口---- get
  async getList() {
    const { ctx } = this;
    const rules = {
      page: { type: 'number', required: true },
      limit: { type: 'number', required: true },
    };
    // 校验  参数
    const val = this.Validate( rules, ctx.param )
    if ( !val.status ) {
      // 校验 不通过
      this.error( '校验不通过', val.error )
      return
    }
    const { page, limit } = ctx.query

  }

  // 新增 - 修改
  async save() {
    this.success( [] );
  }
}

module.exports = todoController;
