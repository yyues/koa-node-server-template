'use strict';

const Controller = require( '../core/base_controller' );


class StarController extends Controller {
  async save() {
    const { ctx } = this
    const { uid } = await this.currentUser()
    const { type, url } = ctx.request.body
    const data = {}
    data[type] = url
    const [ dbRes, created ] = await ctx.model.Config.findOrCreate( {
      where: {
        uid,
        is_delete: false,
      },
      defaults: data,
    } );
    if ( created ) {
      //新建的流程而已
      this.success( dbRes )
      return
    }
    const res = await ctx.model.Config.update( data, {
      where: {
        uid, id_delete: false
      }
    } )
    this.success( res )
  }
}

module.exports = StarController;
