import path from 'path';
import test from 'ava';
import browserEnv from 'browser-env';
import ImageMarker from '../src';

browserEnv();

test.beforeEach(t => {
	const imageMarker = new ImageMarker(path.resolve(__dirname, '../example/img/X.jpg'));
	t.context.imageMarker = imageMarker;
});

test('initImage', t => {
	t.context.imageMarker.initImage(img => {
		t.is(img.width, 259);
		t.is(img.height, 194);
	});
});

test('recreateOptionsWithImage', t => {
	t.context.imageMarker.recreateOptionsWithImage({
		width: 0
	}, {
		width: 259,
		height: 194
	});
	t.is(t.context.imageMarker.options.width, 0);
	t.is(t.context.imageMarker.options.height, 194);
});

test('getNextUsedChar', t => {
	t.context.imageMarker.options.text = 'just for fun';
	t.context.imageMarker.initUsedTextSize();
	t.is(t.context.imageMarker.getNextUsedChar(), 'j');
	t.is(t.context.imageMarker.getNextUsedChar(), 'u');
	t.is(t.context.imageMarker.getNextUsedChar(), 's');
});

test('initCanvas', t => {
	let image = new Image();
	image.src = t.context.imageMarker.options.imageUrl;
	image.onload = function () {
		t.context.imageMarker.initCanvas(this);
		t.is(t.context.imageMarker.canvas.width, 259);
		t.is(t.context.imageMarker.canvas.height, 194);
	};
});

test('initUsedTextSize', t => {
	t.context.imageMarker.initUsedTextSize();
	t.is(t.context.imageMarker.usedText.currentIndex, 0);
});

test('initPixelsGrid', t => {
	let image = new Image();
	image.src = t.context.imageMarker.options.imageUrl;
	image.onload = function () {
		t.context.imageMarker.initCanvas(this);
		let result = t.context.imageMarker.initPixelsGrid();
		t.is(typeof result, 'array');
	};
});

test('mark', t => {
	t.context.imageMarker.mark(result => {
		t.is(/^data/.test(result), true);
	});
});
