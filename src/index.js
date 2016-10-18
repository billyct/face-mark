'use strict';
/**
 * 给图片用文字的形式打码
 * @example:
 *  let imageMarker = new ImageMarker('path/to/image');
 *  imageMarker.mark({
 *    text: '这是一个文字马赛克'
 *  }, callback(data) {
 *    //这里的data是Data URIs
 *    //参考 https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
 *  });
 */

 /* eslint no-unused-expressions: ["error", { "allowShortCircuit": true }] */

function ImageMarker(imageUrl) {
	if (!imageUrl) {
		throw new Error('the constructor needs image_url');
	}
	this.options = {
		imageUrl: imageUrl,
		top: 0,
		left: 0,
		width: 0,
		height: 0,
		text: 'mark',
		fontSize: 14,
		fontFamily: 'Monospace', // 最好是等长的文字,因为文字是按照等长来计算的
		backgroundColor: 'rgba(0, 0, 0, 0)'
	};
}

ImageMarker.prototype.recreateOptionsWithImage = function (options, image) {
	// 如果高和宽没有设定的话,就设定为整张图片的大小
	if (options.width === undefined) {
		this.options.width = image.width;
	}

	if (options.height === undefined) {
		this.options.height = image.height;
	}
};

ImageMarker.prototype.mark = function (options, callback) {
	options = options || {};
	this.options = Object.assign(this.options, options);

	this.initImage(img => {
		this.recreateOptionsWithImage(options, img);
		// 通过canvas假装把image加载进来
		this.initCanvas(img);
		// 把每个字应该在图片里所占的宽高算出来
		this.initUsedTextSize();
		// 获取一堆rgba
		const pixelGrid = this.initPixelsGrid();
		// 再根据mark rect把那部分清空
		this.canvas.context.clearRect(this.options.left, this.options.top, this.options.width, this.options.height);
		this.canvas.context.fillStyle = this.options.backgroundColor;
		this.canvas.context.fillRect(this.options.left, this.options.top, this.options.width, this.options.height);
		// 把一堆rgba用字写进去
		for (var i = 0; i < pixelGrid.length; i++) {
			let px = pixelGrid[i];
			// 一个字一个颜色嘛
			this.canvas.context.fillStyle = 'rgba(' + px.r + ', ' + px.g + ', ' + px.b + ', ' + px.a + ')';
			this.canvas.context.font = this.options.fontSize + 'px ' + this.options.fontFamily;
			this.canvas.context.fillText(this.getNextUsedChar(), px.x, px.y);
		}
		callback && callback(this.canvas.ele.toDataURL());
	});
};

ImageMarker.prototype.getNextUsedChar = function () {
	const str = this.options.text;
	let result = str.substring(this.usedText.currentIndex, this.usedText.currentIndex + 1);
	this.usedText.currentIndex++;
	if (this.usedText.currentIndex === str.length) {
		this.usedText.currentIndex = 0;
	}
	return result;
};

/**
 * 初始化一个是image的canvas
 * @param image
 */
ImageMarker.prototype.initCanvas = function (image) {
	// 先创建一个canvas，把图片放到里面
	const canvasElement = document.createElement('canvas');
	canvasElement.width = image.width;
	canvasElement.height = image.height;
	const canvasContext = canvasElement.getContext('2d');
	canvasContext.drawImage(this.image, 0, 0);
	// 主要是把canvas的数据记录到对象里面
	this.canvas = {
		ele: canvasElement,
		context: canvasContext,
		width: canvasElement.width,
		height: canvasElement.height,
		source: canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height).data
	};
};

/**
 * 计算文字的长和宽
 */
ImageMarker.prototype.initUsedTextSize = function () {
	let block = document.createElement('span');
	block.innerHTML = this.options.text[0];
	block.style.fontSize = this.options.fontSize + 'px';
	block.style.fontFamily = this.options.fontFamily;
	document.body.appendChild(block);
	// 这里必须先插入到html,再把它从html中移除
	this.usedText = {
		width: block.offsetWidth,
		height: Math.floor(block.offsetHeight - (block.offsetHeight * 0.2)),
		currentIndex: 0
	};
	document.body.removeChild(block);
};

/**
 * Return list of color areas, which will contain used symbols.
 * Every element has next data:
 * <code>
 * [
 *  'r': <red chanel>,
 *  'g': <green chanel>,
 *  'b': <blue chanel>,
 *  'a': <alfa chanel>,
 *  'x': <x-position on result image>,
 *  'y': '<y-position on result image>
 *  ]
 *  </code>
 *
 *  @return array
 */
ImageMarker.prototype.initPixelsGrid = function () {
	const sourceData = this.canvas.source;
	let pixelsGrid = [];
	for (let i = 0; i < sourceData.length; i += 4) {
		let y = Math.floor(i / (this.canvas.width * 4));
		let x = (i - (y * this.canvas.width * 4)) / 4;
		if (typeof pixelsGrid[x] === 'undefined') {
			pixelsGrid[x] = [];
		}
		pixelsGrid[x][y] = {
			r: sourceData[i],
			g: sourceData[i + 1],
			b: sourceData[i + 2],
			a: sourceData[i + 3]
		};
	}

	// 将文字的宽和高当做x和y的步长
	const stepX = this.usedText.width;
	const stepY = this.usedText.height;
	// 算出x和y上的文字总数
	const countStepsX = this.options.width / stepX;
	const countStepsY = this.options.height / stepY;
	let result = [];

	for (let y = 0; y < countStepsY; y++) {
		for (let x = 0; x < countStepsX; x++) {
			let resultX = this.options.left + (x * stepX);
			let resultY = this.options.top + (y * stepY);
			result.push({
				x: resultX,
				y: resultY,
				r: pixelsGrid[resultX][resultY].r,
				g: pixelsGrid[resultX][resultY].g,
				b: pixelsGrid[resultX][resultY].b,
				a: pixelsGrid[resultX][resultY].a
			});
		}
	}
	return result;
};

ImageMarker.prototype.initImage = function (callback) {
	this.image = new Image();
	this.image.src = this.options.imageUrl;
	this.image.onload = function () {
		callback && callback(this);
	};
};

global.ImageMarker = ImageMarker;
module.exports = ImageMarker;
