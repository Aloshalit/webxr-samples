var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Copyright 2018 The Immersive Web Community Group
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

var GL = WebGLRenderingContext; // For enums

var nextDataTextureIndex = 0;

export var TextureSampler = function TextureSampler() {
  _classCallCheck(this, TextureSampler);

  this.minFilter = null;
  this.magFilter = null;
  this.wrapS = null;
  this.wrapT = null;
};

export var Texture = function () {
  function Texture() {
    _classCallCheck(this, Texture);

    this.sampler = new TextureSampler();
    this.mipmap = true;
    // TODO: Anisotropy
  }

  _createClass(Texture, [{
    key: 'format',
    get: function get() {
      return GL.RGBA;
    }
  }, {
    key: 'width',
    get: function get() {
      return 0;
    }
  }, {
    key: 'height',
    get: function get() {
      return 0;
    }
  }, {
    key: 'textureKey',
    get: function get() {
      return null;
    }
  }]);

  return Texture;
}();

export var ImageTexture = function (_Texture) {
  _inherits(ImageTexture, _Texture);

  function ImageTexture(img) {
    _classCallCheck(this, ImageTexture);

    var _this = _possibleConstructorReturn(this, (ImageTexture.__proto__ || Object.getPrototypeOf(ImageTexture)).call(this));

    _this._img = img;
    _this._imgBitmap = null;
    _this._manualKey = null;

    if (img.src && img.complete) {
      if (img.naturalWidth) {
        _this._promise = _this._finishImage();
      } else {
        _this._promise = Promise.reject('Image provided had failed to load.');
      }
    } else {
      _this._promise = new Promise(function (resolve, reject) {
        img.addEventListener('load', function () {
          return resolve(_this._finishImage());
        });
        img.addEventListener('error', reject);
      });
    }
    return _this;
  }

  _createClass(ImageTexture, [{
    key: '_finishImage',
    value: function _finishImage() {
      var _this2 = this;

      if (window.createImageBitmap) {
        return window.createImageBitmap(this._img).then(function (imgBitmap) {
          _this2._imgBitmap = imgBitmap;
          return Promise.resolve(_this2);
        });
      }
      return Promise.resolve(this);
    }
  }, {
    key: 'waitForComplete',
    value: function waitForComplete() {
      return this._promise;
    }
  }, {
    key: 'genDataKey',
    value: function genDataKey() {
      this._manualKey = 'DATA_' + nextDataTextureIndex;
      nextDataTextureIndex++;
    }
  }, {
    key: 'format',
    get: function get() {
      // TODO: Can be RGB in some cases.
      return GL.RGBA;
    }
  }, {
    key: 'width',
    get: function get() {
      return this._img.width;
    }
  }, {
    key: 'height',
    get: function get() {
      return this._img.height;
    }
  }, {
    key: 'textureKey',
    get: function get() {
      return this._manualKey || this._img.src;
    }
  }, {
    key: 'source',
    get: function get() {
      return this._imgBitmap || this._img;
    }
  }]);

  return ImageTexture;
}(Texture);

export var UrlTexture = function (_ImageTexture) {
  _inherits(UrlTexture, _ImageTexture);

  function UrlTexture(url) {
    _classCallCheck(this, UrlTexture);

    var img = new Image();

    var _this3 = _possibleConstructorReturn(this, (UrlTexture.__proto__ || Object.getPrototypeOf(UrlTexture)).call(this, img));

    img.src = url;
    return _this3;
  }

  return UrlTexture;
}(ImageTexture);

export var BlobTexture = function (_ImageTexture2) {
  _inherits(BlobTexture, _ImageTexture2);

  function BlobTexture(blob) {
    _classCallCheck(this, BlobTexture);

    var img = new Image();

    var _this4 = _possibleConstructorReturn(this, (BlobTexture.__proto__ || Object.getPrototypeOf(BlobTexture)).call(this, img));

    img.src = window.URL.createObjectURL(blob);
    return _this4;
  }

  return BlobTexture;
}(ImageTexture);

export var VideoTexture = function (_Texture2) {
  _inherits(VideoTexture, _Texture2);

  function VideoTexture(video) {
    _classCallCheck(this, VideoTexture);

    var _this5 = _possibleConstructorReturn(this, (VideoTexture.__proto__ || Object.getPrototypeOf(VideoTexture)).call(this));

    _this5._video = video;

    if (video.readyState >= 2) {
      _this5._promise = Promise.resolve(_this5);
    } else if (video.error) {
      _this5._promise = Promise.reject(video.error);
    } else {
      _this5._promise = new Promise(function (resolve, reject) {
        video.addEventListener('loadeddata', function () {
          return resolve(_this5);
        });
        video.addEventListener('error', reject);
      });
    }
    return _this5;
  }

  _createClass(VideoTexture, [{
    key: 'waitForComplete',
    value: function waitForComplete() {
      return this._promise;
    }
  }, {
    key: 'format',
    get: function get() {
      // TODO: Can be RGB in some cases.
      return GL.RGBA;
    }
  }, {
    key: 'width',
    get: function get() {
      return this._video.videoWidth;
    }
  }, {
    key: 'height',
    get: function get() {
      return this._video.videoHeight;
    }
  }, {
    key: 'textureKey',
    get: function get() {
      return this._video.src;
    }
  }, {
    key: 'source',
    get: function get() {
      return this._video;
    }
  }]);

  return VideoTexture;
}(Texture);

export var DataTexture = function (_Texture3) {
  _inherits(DataTexture, _Texture3);

  function DataTexture(data, width, height) {
    var format = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : GL.RGBA;
    var type = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : GL.UNSIGNED_BYTE;

    _classCallCheck(this, DataTexture);

    var _this6 = _possibleConstructorReturn(this, (DataTexture.__proto__ || Object.getPrototypeOf(DataTexture)).call(this));

    _this6._data = data;
    _this6._width = width;
    _this6._height = height;
    _this6._format = format;
    _this6._type = type;
    _this6._key = 'DATA_' + nextDataTextureIndex;
    nextDataTextureIndex++;
    return _this6;
  }

  _createClass(DataTexture, [{
    key: 'format',
    get: function get() {
      return this._format;
    }
  }, {
    key: 'width',
    get: function get() {
      return this._width;
    }
  }, {
    key: 'height',
    get: function get() {
      return this._height;
    }
  }, {
    key: 'textureKey',
    get: function get() {
      return this._key;
    }
  }]);

  return DataTexture;
}(Texture);

export var ColorTexture = function (_DataTexture) {
  _inherits(ColorTexture, _DataTexture);

  function ColorTexture(r, g, b, a) {
    _classCallCheck(this, ColorTexture);

    var colorData = new Uint8Array([r * 255.0, g * 255.0, b * 255.0, a * 255.0]);

    var _this7 = _possibleConstructorReturn(this, (ColorTexture.__proto__ || Object.getPrototypeOf(ColorTexture)).call(this, colorData, 1, 1));

    _this7.mipmap = false;
    _this7._key = 'COLOR_' + colorData[0] + '_' + colorData[1] + '_' + colorData[2] + '_' + colorData[3];
    return _this7;
  }

  return ColorTexture;
}(DataTexture);