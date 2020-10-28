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

import { Material } from '../core/material.js';
import { Node } from '../core/node.js';
import { PrimitiveStream } from '../geometry/primitive-stream.js';

var GL = WebGLRenderingContext; // For enums

var SHADOW_SEGMENTS = 32;
var SHADOW_GROUND_OFFSET = 0.01;
var SHADOW_CENTER_ALPHA = 0.7;
var SHADOW_INNER_ALPHA = 0.3;
var SHADOW_OUTER_ALPHA = 0.0;
var SHADOW_INNER_RADIUS = 0.6;
var SHADOW_OUTER_RADIUS = 1.0;

var DropShadowMaterial = function (_Material) {
  _inherits(DropShadowMaterial, _Material);

  function DropShadowMaterial() {
    _classCallCheck(this, DropShadowMaterial);

    var _this = _possibleConstructorReturn(this, (DropShadowMaterial.__proto__ || Object.getPrototypeOf(DropShadowMaterial)).call(this));

    _this.state.blend = true;
    _this.state.blendFuncSrc = GL.ONE;
    _this.state.blendFuncDst = GL.ONE_MINUS_SRC_ALPHA;
    _this.state.depthFunc = GL.LEQUAL;
    _this.state.depthMask = false;
    return _this;
  }

  _createClass(DropShadowMaterial, [{
    key: 'materialName',
    get: function get() {
      return 'DROP_SHADOW_MATERIAL';
    }
  }, {
    key: 'vertexSource',
    get: function get() {
      return '\n    attribute vec3 POSITION;\n    attribute vec2 TEXCOORD_0;\n\n    varying float vShadow;\n\n    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {\n      vShadow = TEXCOORD_0.x;\n      return proj * view * model * vec4(POSITION, 1.0);\n    }';
    }
  }, {
    key: 'fragmentSource',
    get: function get() {
      return '\n    varying float vShadow;\n\n    vec4 fragment_main() {\n      return vec4(0.0, 0.0, 0.0, vShadow);\n    }';
    }
  }]);

  return DropShadowMaterial;
}(Material);

export var DropShadowNode = function (_Node) {
  _inherits(DropShadowNode, _Node);

  function DropShadowNode(iconTexture, callback) {
    _classCallCheck(this, DropShadowNode);

    return _possibleConstructorReturn(this, (DropShadowNode.__proto__ || Object.getPrototypeOf(DropShadowNode)).call(this));
  }

  _createClass(DropShadowNode, [{
    key: 'onRendererChanged',
    value: function onRendererChanged(renderer) {
      var stream = new PrimitiveStream();

      stream.startGeometry();

      // Shadow center
      stream.pushVertex(0, SHADOW_GROUND_OFFSET, 0, SHADOW_CENTER_ALPHA);

      var segRad = Math.PI * 2.0 / SHADOW_SEGMENTS;

      var idx = void 0;
      for (var i = 0; i < SHADOW_SEGMENTS; ++i) {
        idx = stream.nextVertexIndex;

        var rad = i * segRad;
        var x = Math.cos(rad);
        var y = Math.sin(rad);
        stream.pushVertex(x * SHADOW_INNER_RADIUS, SHADOW_GROUND_OFFSET, y * SHADOW_INNER_RADIUS, SHADOW_INNER_ALPHA);
        stream.pushVertex(x * SHADOW_OUTER_RADIUS, SHADOW_GROUND_OFFSET, y * SHADOW_OUTER_RADIUS, SHADOW_OUTER_ALPHA);

        if (i > 0) {
          // Inner circle
          stream.pushTriangle(0, idx, idx - 2);

          // Outer circle
          stream.pushTriangle(idx, idx + 1, idx - 1);
          stream.pushTriangle(idx, idx - 1, idx - 2);
        }
      }

      stream.pushTriangle(0, 1, idx);

      stream.pushTriangle(1, 2, idx + 1);
      stream.pushTriangle(1, idx + 1, idx);

      stream.endGeometry();

      var shadowPrimitive = stream.finishPrimitive(renderer);
      this._shadowRenderPrimitive = renderer.createRenderPrimitive(shadowPrimitive, new DropShadowMaterial());
      this.addRenderPrimitive(this._shadowRenderPrimitive);
    }
  }]);

  return DropShadowNode;
}(Node);