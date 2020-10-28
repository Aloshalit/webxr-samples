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

/*
This file renders a passed in XRBoundedReferenceSpace object and attempts
to render geometry on the floor to indicate where the bounds is.
The bounds `geometry` is a series of DOMPointReadOnlys in
clockwise-order.
*/

import { Material, RENDER_ORDER } from '../core/material.js';
import { Node } from '../core/node.js';
import { Primitive, PrimitiveAttribute } from '../core/primitive.js';

var GL = WebGLRenderingContext; // For enums

var BOUNDS_HEIGHT = 0.5; // Meters

var BoundsMaterial = function (_Material) {
  _inherits(BoundsMaterial, _Material);

  function BoundsMaterial() {
    _classCallCheck(this, BoundsMaterial);

    var _this = _possibleConstructorReturn(this, (BoundsMaterial.__proto__ || Object.getPrototypeOf(BoundsMaterial)).call(this));

    _this.renderOrder = RENDER_ORDER.ADDITIVE;
    _this.state.blend = true;
    _this.state.blendFuncSrc = GL.SRC_ALPHA;
    _this.state.blendFuncDst = GL.ONE;
    _this.state.depthTest = false;
    _this.state.cullFace = false;
    return _this;
  }

  _createClass(BoundsMaterial, [{
    key: 'materialName',
    get: function get() {
      return 'BOUNDS_RENDERER';
    }
  }, {
    key: 'vertexSource',
    get: function get() {
      return '\n    attribute vec3 POSITION;\n    varying vec3 v_pos;\n    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {\n      v_pos = POSITION;\n      return proj * view * model * vec4(POSITION, 1.0);\n    }';
    }
  }, {
    key: 'fragmentSource',
    get: function get() {
      return '\n    precision mediump float;\n    varying vec3 v_pos;\n    vec4 fragment_main() {\n      return vec4(0.25, 1.0, 0.5, (' + BOUNDS_HEIGHT + ' - v_pos.y) / ' + BOUNDS_HEIGHT + ');\n    }';
    }
  }]);

  return BoundsMaterial;
}(Material);

export var BoundsRenderer = function (_Node) {
  _inherits(BoundsRenderer, _Node);

  function BoundsRenderer(boundedRefSpace) {
    _classCallCheck(this, BoundsRenderer);

    var _this2 = _possibleConstructorReturn(this, (BoundsRenderer.__proto__ || Object.getPrototypeOf(BoundsRenderer)).call(this));

    _this2._boundedRefSpace = boundedRefSpace;
    return _this2;
  }

  _createClass(BoundsRenderer, [{
    key: 'onRendererChanged',
    value: function onRendererChanged(renderer) {
      this.boundedRefSpace = this._boundedRefSpace;
    }
  }, {
    key: 'boundedRefSpace',
    get: function get() {
      return this._boundedRefSpace;
    },
    set: function set(refSpace) {
      if (this._boundedRefSpace) {
        this.clearRenderPrimitives();
      }
      this._boundedRefSpace = refSpace;
      if (!refSpace || refSpace.boundsGeometry.length === 0 || !this._renderer) {
        return;
      }

      var geometry = refSpace.boundsGeometry;

      var verts = [];
      var indices = [];

      // Tessellate the bounding points from XRStageBounds and connect
      // each point to a neighbor and 0,0,0.
      var pointCount = geometry.length;
      var lastIndex = -1;
      for (var i = 0; i < pointCount; i++) {
        var point = geometry[i];
        verts.push(point.x, 0, point.z);
        verts.push(point.x, BOUNDS_HEIGHT, point.z);

        lastIndex += 2;
        if (i > 0) {
          indices.push(lastIndex, lastIndex - 1, lastIndex - 2);
          indices.push(lastIndex - 2, lastIndex - 1, lastIndex - 3);
        }
      }

      if (pointCount > 1) {
        indices.push(1, 0, lastIndex);
        indices.push(lastIndex, 0, lastIndex - 1);
      }

      var vertexBuffer = this._renderer.createRenderBuffer(GL.ARRAY_BUFFER, new Float32Array(verts));
      var indexBuffer = this._renderer.createRenderBuffer(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices));

      var attribs = [new PrimitiveAttribute('POSITION', vertexBuffer, 3, GL.FLOAT, 12, 0)];

      var primitive = new Primitive(attribs, indices.length);
      primitive.setIndexBuffer(indexBuffer);

      var renderPrimitive = this._renderer.createRenderPrimitive(primitive, new BoundsMaterial());
      this.addRenderPrimitive(renderPrimitive);
    }
  }]);

  return BoundsRenderer;
}(Node);