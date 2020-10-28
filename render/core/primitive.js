var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

import { vec3 } from '../math/gl-matrix.js';

export var PrimitiveAttribute = function PrimitiveAttribute(name, buffer, componentCount, componentType, stride, byteOffset) {
  _classCallCheck(this, PrimitiveAttribute);

  this.name = name;
  this.buffer = buffer;
  this.componentCount = componentCount || 3;
  this.componentType = componentType || 5126; // gl.FLOAT;
  this.stride = stride || 0;
  this.byteOffset = byteOffset || 0;
  this.normalized = false;
};

export var Primitive = function () {
  function Primitive(attributes, elementCount, mode) {
    _classCallCheck(this, Primitive);

    this.attributes = attributes || [];
    this.elementCount = elementCount || 0;
    this.mode = mode || 4; // gl.TRIANGLES;
    this.indexBuffer = null;
    this.indexByteOffset = 0;
    this.indexType = 0;
    this._min = null;
    this._max = null;
  }

  _createClass(Primitive, [{
    key: 'setIndexBuffer',
    value: function setIndexBuffer(indexBuffer, byteOffset, indexType) {
      this.indexBuffer = indexBuffer;
      this.indexByteOffset = byteOffset || 0;
      this.indexType = indexType || 5123; // gl.UNSIGNED_SHORT;
    }
  }, {
    key: 'setBounds',
    value: function setBounds(min, max) {
      this._min = vec3.clone(min);
      this._max = vec3.clone(max);
    }
  }]);

  return Primitive;
}();