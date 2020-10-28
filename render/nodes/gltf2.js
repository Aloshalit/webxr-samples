var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

import { Node } from '../core/node.js';
import { Gltf2Loader } from '../loaders/gltf2.js';

// Using a weak map here allows us to cache a loader per-renderer without
// modifying the renderer object or leaking memory when it's garbage collected.
var gltfLoaderMap = new WeakMap();

export var Gltf2Node = function (_Node) {
  _inherits(Gltf2Node, _Node);

  function Gltf2Node(options) {
    _classCallCheck(this, Gltf2Node);

    var _this = _possibleConstructorReturn(this, (Gltf2Node.__proto__ || Object.getPrototypeOf(Gltf2Node)).call(this));

    _this._url = options.url;

    _this._promise = null;
    _this._resolver = null;
    _this._rejecter = null;
    return _this;
  }

  _createClass(Gltf2Node, [{
    key: 'onRendererChanged',
    value: function onRendererChanged(renderer) {
      var _this2 = this;

      var loader = gltfLoaderMap.get(renderer);
      if (!loader) {
        loader = new Gltf2Loader(renderer);
        gltfLoaderMap.set(renderer, loader);
      }

      // Do we have a previously resolved promise? If so clear it.
      if (!this._resolver && this._promise) {
        this._promise = null;
      }

      this._ensurePromise();

      loader.loadFromUrl(this._url).then(function (sceneNode) {
        _this2.addNode(sceneNode);
        _this2._resolver(sceneNode.waitForComplete());
        _this2._resolver = null;
        _this2._rejecter = null;
      }).catch(function (err) {
        _this2._rejecter(err);
        _this2._resolver = null;
        _this2._rejecter = null;
      });
    }
  }, {
    key: '_ensurePromise',
    value: function _ensurePromise() {
      var _this3 = this;

      if (!this._promise) {
        this._promise = new Promise(function (resolve, reject) {
          _this3._resolver = resolve;
          _this3._rejecter = reject;
        });
      }
      return this._promise;
    }
  }, {
    key: 'waitForComplete',
    value: function waitForComplete() {
      return this._ensurePromise();
    }
  }]);

  return Gltf2Node;
}(Node);