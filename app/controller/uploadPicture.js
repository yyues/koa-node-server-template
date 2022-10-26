const Controller = require( '../core/base_controller' );

const error = require('egg').error;
const fs = require('fs');

class UploadPictureController extends Controller {
  async index() {
    await this.ctx.render('home/upload.tpl', {});
  }
  async upload() {
    const file = this.ctx.request.files[0];
    const name = file.filename;
    const dist = 'app/public/' + name;
    let result = await new Promise((resolve, reject) => {
      fs.copyFile(file.filepath, dist, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(true);
        }
      });
    });
    this.success({
      filename: name,
      url: dist.replace('app','')
    })
  }
}

module.exports = UploadPictureController;
