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
Node for displaying 360 equirect images as a skybox.
*/

import { Material, RENDER_ORDER } from '../core/material.js';
import { Primitive, PrimitiveAttribute } from '../core/primitive.js';
import { Node } from '../core/node.js';
import { UrlTexture } from '../core/texture.js';

var GL = WebGLRenderingContext; // For enums

var SkyboxMaterial = function (_Material) {
  _inherits(SkyboxMaterial, _Material);

  function SkyboxMaterial() {
    _classCallCheck(this, SkyboxMaterial);

    var _this = _possibleConstructorReturn(this, (SkyboxMaterial.__proto__ || Object.getPrototypeOf(SkyboxMaterial)).call(this));

    _this.renderOrder = RENDER_ORDER.SKY;
    _this.state.depthFunc = GL.LEQUAL;
    _this.state.depthMask = false;

    _this.image = _this.defineSampler('diffuse');

    _this.texCoordScaleOffset = _this.defineUniform('texCoordScaleOffset', [1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0], 4);
    return _this;
  }

  _createClass(SkyboxMaterial, [{
    key: 'materialName',
    get: function get() {
      return 'SKYBOX';
    }
  }, {
    key: 'vertexSource',
    get: function get() {
      return '\n    uniform int EYE_INDEX;\n    uniform vec4 texCoordScaleOffset[2];\n    attribute vec3 POSITION;\n    attribute vec2 TEXCOORD_0;\n    varying vec2 vTexCoord;\n\n    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {\n      vec4 scaleOffset = texCoordScaleOffset[EYE_INDEX];\n      vTexCoord = (TEXCOORD_0 * scaleOffset.xy) + scaleOffset.zw;\n      // Drop the translation portion of the view matrix\n      view[3].xyz = vec3(0.0, 0.0, 0.0);\n      vec4 out_vec = proj * view * model * vec4(POSITION, 1.0);\n\n      // Returning the W component for both Z and W forces the geometry depth to\n      // the far plane. When combined with a depth func of LEQUAL this makes the\n      // sky write to any depth fragment that has not been written to yet.\n      return out_vec.xyww;\n    }';
    }
  }, {
    key: 'fragmentSource',
    get: function get() {
      return '\n    uniform sampler2D diffuse;\n    varying vec2 vTexCoord;\n\n    vec4 fragment_main() {\n      return texture2D(diffuse, vTexCoord);\n    }';
    }
  }]);

  return SkyboxMaterial;
}(Material);

export var SkyboxNode = function (_Node) {
  _inherits(SkyboxNode, _Node);

  function SkyboxNode(options) {
    _classCallCheck(this, SkyboxNode);

    var _this2 = _possibleConstructorReturn(this, (SkyboxNode.__proto__ || Object.getPrototypeOf(SkyboxNode)).call(this));

    _this2._url = options.url;
    _this2._displayMode = options.displayMode || 'mono';
    _this2._rotationY = options.rotationY || 0;
    return _this2;
  }

  _createClass(SkyboxNode, [{
    key: 'onRendererChanged',
    value: function onRendererChanged(renderer) {
      var vertices = [];
      var indices = [];

      var latSegments = 40;
      var lonSegments = 40;

      // Create the vertices/indices
      for (var i = 0; i <= latSegments; ++i) {
        var theta = i * Math.PI / latSegments;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        var idxOffsetA = i * (lonSegments + 1);
        var idxOffsetB = (i + 1) * (lonSegments + 1);

        for (var j = 0; j <= lonSegments; ++j) {
          var phi = j * 2 * Math.PI / lonSegments + this._rotationY;
          var x = Math.sin(phi) * sinTheta;
          var y = cosTheta;
          var z = -Math.cos(phi) * sinTheta;
          var u = j / lonSegments;
          var v = i / latSegments;

          // Vertex shader will force the geometry to the far plane, so the
          // radius of the sphere is immaterial.
          vertices.push(x, y, z, u, v);

          if (i < latSegments && j < lonSegments) {
            var idxA = idxOffsetA + j;
            var idxB = idxOffsetB + j;

            indices.push(idxA, idxB, idxA + 1, idxB, idxB + 1, idxA + 1);
          }
        }
      }

      var vertexBuffer = renderer.createRenderBuffer(GL.ARRAY_BUFFER, new Float32Array(vertices));
      var indexBuffer = renderer.createRenderBuffer(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices));

      var attribs = [new PrimitiveAttribute('POSITION', vertexBuffer, 3, GL.FLOAT, 20, 0), new PrimitiveAttribute('TEXCOORD_0', vertexBuffer, 2, GL.FLOAT, 20, 12)];

      var primitive = new Primitive(attribs, indices.length);
      primitive.setIndexBuffer(indexBuffer);

      var material = new SkyboxMaterial();
      material.image.texture = new UrlTexture(this._url);

      switch (this._displayMode) {
        case 'mono':
          material.texCoordScaleOffset.value = [1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0];
          break;
        case 'stereoTopBottom':
          material.texCoordScaleOffset.value = [1.0, 0.5, 0.0, 0.0, 1.0, 0.5, 0.0, 0.5];
          break;
        case 'stereoLeftRight':
          material.texCoordScaleOffset.value = [0.5, 1.0, 0.0, 0.0, 0.5, 1.0, 0.5, 0.0];
          break;
      }

      var renderPrimitive = renderer.createRenderPrimitive(primitive, material);
      this.addRenderPrimitive(renderPrimitive);
    }
  }]);

  return SkyboxNode;
}(Node);