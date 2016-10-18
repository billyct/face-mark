# image-marker

[![Build Status](https://travis-ci.org/billyct/image-marker.svg?branch=master)](https://travis-ci.org/billyct/image-marker)

> mark image part with text

## Usage && API

```js
var ImageMarker = require('image-marker')
var imageMarker = new ImageMarker('image_url');
imageMarker.mark({}, function(data) {
	// do what you like with data
});
```

## Install

With [npm](https://npmjs.org/) installed, run

```
$ npm install image-marker
```

## Acknowledgments

image-marker was inspired by [HTML5-ASCII-art-converter](http://haruatari.github.io/HTML5-ASCII-art-converter/)

## License

MIT @[billyct](http://billyct.com)