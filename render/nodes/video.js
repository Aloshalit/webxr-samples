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
Node for displaying 2D or stereo videos on a quad.
*/

import { Material } from '../core/material.js';
import { Primitive, PrimitiveAttribute } from '../core/primitive.js';
import { Node } from '../core/node.js';
import { VideoTexture } from '../core/texture.js';

var GL = WebGLRenderingContext; // For enums

var VideoMaterial = function (_Material) {
  _inherits(VideoMaterial, _Material);

  function VideoMaterial() {
    _classCallCheck(this, VideoMaterial);

    var _this = _possibleConstructorReturn(this, (VideoMaterial.__proto__ || Object.getPrototypeOf(VideoMaterial)).call(this));

    _this.image = _this.defineSampler('diffuse');

    _this.texCoordScaleOffset = _this.defineUniform('texCoordScaleOffset', [1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 0.0], 4);
    return _this;
  }

  _createClass(VideoMaterial, [{
    key: 'materialName',
    get: function get() {
      return 'VIDEO_PLAYER';
    }
  }, {
    key: 'vertexSource',
    get: function get() {
      return '\n    uniform int EYE_INDEX;\n    uniform vec4 texCoordScaleOffset[2];\n    attribute vec3 POSITION;\n    attribute vec2 TEXCOORD_0;\n    varying vec2 vTexCoord;\n\n    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {\n      vec4 scaleOffset = texCoordScaleOffset[EYE_INDEX];\n      vTexCoord = (TEXCOORD_0 * scaleOffset.xy) + scaleOffset.zw;\n      vec4 out_vec = proj * view * model * vec4(POSITION, 1.0);\n      return out_vec;\n    }';
    }
  }, {
    key: 'fragmentSource',
    get: function get() {
      return '\n    uniform sampler2D diffuse;\n    varying vec2 vTexCoord;\n\n    vec4 fragment_main() {\n      return texture2D(diffuse, vTexCoord);\n    }';
    }
  }]);

  return VideoMaterial;
}(Material);

export var VideoNode = function (_Node) {
  _inherits(VideoNode, _Node);

  function VideoNode(options) {
    _classCallCheck(this, VideoNode);

    var _this2 = _possibleConstructorReturn(this, (VideoNode.__proto__ || Object.getPrototypeOf(VideoNode)).call(this));

    _this2._video = options.video;
    _this2._displayMode = options.displayMode || 'mono';

    _this2._video_texture = new VideoTexture(_this2._video);
    return _this2;
  }

  _createClass(VideoNode, [{
    key: 'onRendererChanged',
    value: function onRendererChanged(renderer) {
      var vertices = [-1.0, 1.0, 0.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0, -1.0, 0.0, 1.0, 1.0, -1.0, -1.0, 0.0, 0.0, 1.0];
      var indices = [0, 2, 1, 0, 3, 2];

      var vertexBuffer = renderer.createRenderBuffer(GL.ARRAY_BUFFER, new Float32Array(vertices));
      var indexBuffer = renderer.createRenderBuffer(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices));

      var attribs = [new PrimitiveAttribute('POSITION', vertexBuffer, 3, GL.FLOAT, 20, 0), new PrimitiveAttribute('TEXCOORD_0', vertexBuffer, 2, GL.FLOAT, 20, 12)];

      var primitive = new Primitive(attribs, indices.length);
      primitive.setIndexBuffer(indexBuffer);
      primitive.setBounds([-1.0, -1.0, 0.0], [1.0, 1.0, 0.015]);

      var material = new VideoMaterial();
      material.image.texture = this._video_texture;

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
  }, {
    key: 'aspectRatio',
    get: function get() {
      var width = this._video.videoWidth;
      var height = this._video.videoHeight;

      switch (this._displayMode) {
        case 'stereoTopBottom':
          height *= 0.5;break;
        case 'stereoLeftRight':
          width *= 0.5;break;
      }

      if (!height || !width) {
        return 1;
      }

      return width / height;
    }
  }]);

  return VideoNode;
}(Node);