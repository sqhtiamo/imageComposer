const ImageComposer = require('../index.js');

const imgComposerDefault = new ImageComposer();
const imgComposer = new ImageComposer();

imgComposerDefault.compose({
	backgroundSrc: __dirname + '/background.jpg',
	qrcodeSrc: __dirname + '/qrcode.jpg',
	outputPath: __dirname + '/outputNameDefault.png'
});


imgComposer.compose({
	backgroundSrc: __dirname + '/background.jpg',
	qrcodeSrc: __dirname + '/qrcode.jpg',
	portraitSrc: __dirname + '/portrait.png',
	outputPath: __dirname + '/outputName.png'
});
