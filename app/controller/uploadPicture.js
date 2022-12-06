const Controller = require( '../core/base_controller' );

const error = require( 'egg' ).error;
const fs = require( 'fs' )
const fse = require( 'fs-extra' );
const path = require( 'path' );

class UploadPictureController extends Controller {
  async index() {
    await this.ctx.render( 'home/upload.tpl', {} );
  }

  async upload() {
    const { uid } = await this.currentUser()
    const file = this.ctx.request.files[0];
    const name = file.filename;

    const dist = `app/public/${ uid || 'default' }/`
    console.log( uid, name, dist );
    // 保证文件夹 一定要存在
    fse.ensureDir( `app/public/${ uid || 'default' }/` )
    // 读取文件夹的目录
    const files = fs.readdirSync( dist )
    if ( files.length > 100 && uid ) {
      return this.error( '上传文件数量超过限制啦！', [] )
    }
    let resPath = dist + name
    let result = await new Promise( ( resolve, reject ) => {
      fs.copyFile( file.filepath, resPath, ( error ) => {
        if ( error ) {
          reject( error );
        } else {
          resolve( true );
        }
      } );
    } );
    this.success( {
      filename: name,
      url: resPath.replace( 'app', '' )
    } )
  }
}

module.exports = UploadPictureController;
