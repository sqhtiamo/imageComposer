'use strict';

const fs = require('fs');
const Canvas = require('canvas')
const Promise = require('bluebird')

const WIDTH = 400;
const HEIGHT = 700;
const BOTTOM_HEIGHT = 40; // 二维码距底部距离
const SPACE = 20; // 头像和二维码间距
const PORTRAIT_CENTER = 340;
// let canvas;
// let Image;
// let ctx;

const BACKGROUND = {
  SRC: __dirname + '/example/background.jpg',
  X: 0,
  Y: 0,
  WIDTH: WIDTH,
  HEIGHT: HEIGHT
};

const QRCODE = {
  SRC: __dirname + '/example/qrcode.jpg',
  WIDTH: 90
}

const PORTRAIT = {
  SRC: __dirname + '/default.jpg',
  RADIUS: 56
}

const ImageComposer = function (qrcode, portrait, background ) {
  this.qrcode = qrcode || QRCODE;
  this.portrait = portrait || PORTRAIT;
  this.background = background || BACKGROUND;
  this.output = {};
  this.img = new Canvas.Image;

};

ImageComposer.prototype.drawBackground = function (src) {
  this.canvas = new Canvas(WIDTH, HEIGHT);
  this.ctx = this.canvas.getContext('2d')
  console.log(this.ctx)
  //ctx.clearRect(0, 0, WIDTH, HEIGHT);
  return new Promise((resolve, reject) => {
    fs.readFile(src, (err, image) => {
      if (err) return reject(err);
      this.img.src = image;
      this.ctx.drawImage(this.img, this.background.X,
              this.background.Y,
              this.background.WIDTH,
              this.background.HEIGHT);
      resolve();
    });
  });
};

ImageComposer.prototype.drawQrcode = function (src) {
  return new Promise((resolve, reject) => {
    fs.readFile(src, (err, origin) => {
      if (err) return reject(err);
      this.img.src = origin;
      this.ctx.drawImage(this.img, this.background.WIDTH / 2 - this.qrcode.WIDTH / 2,
        this.background.HEIGHT - this.qrcode.WIDTH - BOTTOM_HEIGHT,
        this.qrcode.WIDTH,
        this.qrcode.WIDTH);
      resolve();

    });
  });
};

ImageComposer.prototype.drawPotrait = function (src) {
  return new Promise((resolve, reject) => {
    fs.readFile(src, (err, origin) => {
      if (err) return reject(err);

      this.img.src = origin;

      this.ctx.beginPath();
      this.ctx.translate(0,0);

      this.ctx.arc(
        this.background.WIDTH / 2,
        PORTRAIT_CENTER,
        this.portrait.RADIUS, 0, Math.PI * 2, true);

      this.ctx.clip()

      this.ctx.drawImage(this.img,
        this.background.WIDTH / 2 - this.portrait.RADIUS,
        PORTRAIT_CENTER - this.portrait.RADIUS,
        this.portrait.RADIUS * 2,
        this.portrait.RADIUS * 2);

      resolve();
    });

  });
};

ImageComposer.prototype.ouput = function (output) {

  return new Promise((resolve, reject) => {
    const outStream = fs.createWriteStream(output)
      console.log(this.canvas)

    const stream = this.canvas.createPNGStream();

    stream.on('data', function(chunk){
      outStream.write(chunk);
    });
    stream.on('end', function() {
      resolve();
    });
  });
};
ImageComposer.prototype.compose = function (opt, callback) {

  if (opt) {
    this.background.src = opt && opt.backgroundSrc || this.background.SRC;
    this.qrcode.src = opt && opt.qrcodeSrc || this.qrcode.SRC;
    this.portrait.src = opt && opt.portraitSrc || this.portrait.SRC;
    this.output.src = opt && opt.outputPath;
  }

  this.drawBackground(this.background.src)
    .then(() => this.drawQrcode(this.qrcode.src))
    .then(() => this.drawPotrait(this.portrait.src))
    .then(() => this.ouput(this.output.src))
    .then(() => { callback && callback(null, this.output.src)})
    .catch((err) => {
      console.error('Error: ' + err);
      callback && callback(err);
    })
};

module.exports = ImageComposer;
