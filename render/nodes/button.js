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

var BUTTON_SIZE = 0.1;
var BUTTON_CORNER_RADIUS = 0.025;
var BUTTON_CORNER_SEGMENTS = 8;
var BUTTON_ICON_SIZE = 0.07;
var BUTTON_LAYER_DISTANCE = 0.005;
var BUTTON_COLOR = 0.75;
var BUTTON_ALPHA = 0.85;
var BUTTON_HOVER_COLOR = 0.9;
var BUTTON_HOVER_ALPHA = 1.0;
var BUTTON_HOVER_SCALE = 1.1;
var BUTTON_HOVER_TRANSITION_TIME_MS = 200;

var ButtonMaterial = function (_Material) {
  _inherits(ButtonMaterial, _Material);

  function ButtonMaterial() {
    _classCallCheck(this, ButtonMaterial);

    var _this = _possibleConstructorReturn(this, (ButtonMaterial.__proto__ || Object.getPrototypeOf(ButtonMaterial)).call(this));

    _this.state.blend = true;

    _this.defineUniform('hoverAmount', 0);
    return _this;
  }

  _createClass(ButtonMaterial, [{
    key: 'materialName',
    get: function get() {
      return 'BUTTON_MATERIAL';
    }
  }, {
    key: 'vertexSource',
    get: function get() {
      return '\n    attribute vec3 POSITION;\n\n    uniform float hoverAmount;\n\n    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {\n      float scale = mix(1.0, ' + BUTTON_HOVER_SCALE + ', hoverAmount);\n      vec4 pos = vec4(POSITION.x * scale, POSITION.y * scale, POSITION.z * (scale + (hoverAmount * 0.2)), 1.0);\n      return proj * view * model * pos;\n    }';
    }
  }, {
    key: 'fragmentSource',
    get: function get() {
      return '\n    uniform float hoverAmount;\n\n    const vec4 default_color = vec4(' + BUTTON_COLOR + ', ' + BUTTON_COLOR + ', ' + BUTTON_COLOR + ', ' + BUTTON_ALPHA + ');\n    const vec4 hover_color = vec4(' + BUTTON_HOVER_COLOR + ', ' + BUTTON_HOVER_COLOR + ',\n                                  ' + BUTTON_HOVER_COLOR + ', ' + BUTTON_HOVER_ALPHA + ');\n\n    vec4 fragment_main() {\n      return mix(default_color, hover_color, hoverAmount);\n    }';
    }
  }]);

  return ButtonMaterial;
}(Material);

var ButtonIconMaterial = function (_Material2) {
  _inherits(ButtonIconMaterial, _Material2);

  function ButtonIconMaterial() {
    _classCallCheck(this, ButtonIconMaterial);

    var _this2 = _possibleConstructorReturn(this, (ButtonIconMaterial.__proto__ || Object.getPrototypeOf(ButtonIconMaterial)).call(this));

    _this2.state.blend = true;

    _this2.defineUniform('hoverAmount', 0);
    _this2.icon = _this2.defineSampler('icon');
    return _this2;
  }

  _createClass(ButtonIconMaterial, [{
    key: 'materialName',
    get: function get() {
      return 'BUTTON_ICON_MATERIAL';
    }
  }, {
    key: 'vertexSource',
    get: function get() {
      return '\n    attribute vec3 POSITION;\n    attribute vec2 TEXCOORD_0;\n\n    uniform float hoverAmount;\n\n    varying vec2 vTexCoord;\n\n    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {\n      vTexCoord = TEXCOORD_0;\n      float scale = mix(1.0, ' + BUTTON_HOVER_SCALE + ', hoverAmount);\n      vec4 pos = vec4(POSITION.x * scale, POSITION.y * scale, POSITION.z * (scale + (hoverAmount * 0.2)), 1.0);\n      return proj * view * model * pos;\n    }';
    }
  }, {
    key: 'fragmentSource',
    get: function get() {
      return '\n    uniform sampler2D icon;\n    varying vec2 vTexCoord;\n\n    vec4 fragment_main() {\n      return texture2D(icon, vTexCoord);\n    }';
    }
  }]);

  return ButtonIconMaterial;
}(Material);

export var ButtonNode = function (_Node) {
  _inherits(ButtonNode, _Node);

  function ButtonNode(iconTexture, callback) {
    _classCallCheck(this, ButtonNode);

    // All buttons are selectable by default.
    var _this3 = _possibleConstructorReturn(this, (ButtonNode.__proto__ || Object.getPrototypeOf(ButtonNode)).call(this));

    _this3.selectable = true;

    _this3._selectHandler = callback;
    _this3._iconTexture = iconTexture;
    _this3._hovered = false;
    _this3._hoverT = 0;
    return _this3;
  }

  _createClass(ButtonNode, [{
    key: 'onRendererChanged',
    value: function onRendererChanged(renderer) {
      var stream = new PrimitiveStream();

      var hd = BUTTON_LAYER_DISTANCE * 0.5;

      // Build a rounded rect for the background.
      var hs = BUTTON_SIZE * 0.5;
      var ihs = hs - BUTTON_CORNER_RADIUS;
      stream.startGeometry();

      // Rounded corners and sides
      var segments = BUTTON_CORNER_SEGMENTS * 4;
      for (var i = 0; i < segments; ++i) {
        var rad = i * (Math.PI * 2.0 / segments);
        var x = Math.cos(rad) * BUTTON_CORNER_RADIUS;
        var y = Math.sin(rad) * BUTTON_CORNER_RADIUS;
        var section = Math.floor(i / BUTTON_CORNER_SEGMENTS);
        switch (section) {
          case 0:
            x += ihs;
            y += ihs;
            break;
          case 1:
            x -= ihs;
            y += ihs;
            break;
          case 2:
            x -= ihs;
            y -= ihs;
            break;
          case 3:
            x += ihs;
            y -= ihs;
            break;
        }

        stream.pushVertex(x, y, -hd, 0, 0, 0, 0, 1);

        if (i > 1) {
          stream.pushTriangle(0, i - 1, i);
        }
      }

      stream.endGeometry();

      var buttonPrimitive = stream.finishPrimitive(renderer);
      this._buttonRenderPrimitive = renderer.createRenderPrimitive(buttonPrimitive, new ButtonMaterial());
      this.addRenderPrimitive(this._buttonRenderPrimitive);

      // Build a simple textured quad for the foreground.
      hs = BUTTON_ICON_SIZE * 0.5;
      stream.clear();
      stream.startGeometry();

      stream.pushVertex(-hs, hs, hd, 0, 0, 0, 0, 1);
      stream.pushVertex(-hs, -hs, hd, 0, 1, 0, 0, 1);
      stream.pushVertex(hs, -hs, hd, 1, 1, 0, 0, 1);
      stream.pushVertex(hs, hs, hd, 1, 0, 0, 0, 1);

      stream.pushTriangle(0, 1, 2);
      stream.pushTriangle(0, 2, 3);

      stream.endGeometry();

      var iconPrimitive = stream.finishPrimitive(renderer);
      var iconMaterial = new ButtonIconMaterial();
      iconMaterial.icon.texture = this._iconTexture;
      this._iconRenderPrimitive = renderer.createRenderPrimitive(iconPrimitive, iconMaterial);
      this.addRenderPrimitive(this._iconRenderPrimitive);
    }
  }, {
    key: 'onHoverStart',
    value: function onHoverStart() {
      this._hovered = true;
    }
  }, {
    key: 'onHoverEnd',
    value: function onHoverEnd() {
      this._hovered = false;
    }
  }, {
    key: '_updateHoverState',
    value: function _updateHoverState() {
      var t = this._hoverT / BUTTON_HOVER_TRANSITION_TIME_MS;
      // Cubic Ease In/Out
      // TODO: Get a better animation system
      var hoverAmount = t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      this._buttonRenderPrimitive.uniforms.hoverAmount.value = hoverAmount;
      this._iconRenderPrimitive.uniforms.hoverAmount.value = hoverAmount;
    }
  }, {
    key: 'onUpdate',
    value: function onUpdate(timestamp, frameDelta) {
      if (this._hovered && this._hoverT < BUTTON_HOVER_TRANSITION_TIME_MS) {
        this._hoverT = Math.min(BUTTON_HOVER_TRANSITION_TIME_MS, this._hoverT + frameDelta);
        this._updateHoverState();
      } else if (!this._hovered && this._hoverT > 0) {
        this._hoverT = Math.max(0.0, this._hoverT - frameDelta);
        this._updateHoverState();
      }
    }
  }, {
    key: 'iconTexture',
    get: function get() {
      return this._iconTexture;
    },
    set: function set(value) {
      if (this._iconTexture == value) {
        return;
      }

      this._iconTexture = value;
      this._iconRenderPrimitive.samplers.icon.texture = value;
    }
  }]);

  return ButtonNode;
}(Node);