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

import { Material, RENDER_ORDER } from '../core/material.js';
import { Node } from '../core/node.js';
import { Primitive, PrimitiveAttribute } from '../core/primitive.js';
import { DataTexture } from '../core/texture.js';
import { Gltf2Node } from '../nodes/gltf2.js';

// This library matches XRInputSource profiles to available controller models for us.
import { fetchProfile } from 'https://cdn.jsdelivr.net/npm/@webxr-input-profiles/motion-controllers@1.0/dist/motion-controllers.module.js';

// The path of the CDN the sample will fetch controller models from.
var DEFAULT_PROFILES_PATH = 'https://cdn.jsdelivr.net/npm/@webxr-input-profiles/assets@1.0/dist/profiles';

var GL = WebGLRenderingContext; // For enums

// Laser texture data, 48x1 RGBA (not premultiplied alpha). This represents a
// "cross section" of the laser beam with a bright core and a feathered edge.
// Borrowed from Chromium source code.
var LASER_TEXTURE_DATA = new Uint8Array([0xff, 0xff, 0xff, 0x01, 0xff, 0xff, 0xff, 0x02, 0xbf, 0xbf, 0xbf, 0x04, 0xcc, 0xcc, 0xcc, 0x05, 0xdb, 0xdb, 0xdb, 0x07, 0xcc, 0xcc, 0xcc, 0x0a, 0xd8, 0xd8, 0xd8, 0x0d, 0xd2, 0xd2, 0xd2, 0x11, 0xce, 0xce, 0xce, 0x15, 0xce, 0xce, 0xce, 0x1a, 0xce, 0xce, 0xce, 0x1f, 0xcd, 0xcd, 0xcd, 0x24, 0xc8, 0xc8, 0xc8, 0x2a, 0xc9, 0xc9, 0xc9, 0x2f, 0xc9, 0xc9, 0xc9, 0x34, 0xc9, 0xc9, 0xc9, 0x39, 0xc9, 0xc9, 0xc9, 0x3d, 0xc8, 0xc8, 0xc8, 0x41, 0xcb, 0xcb, 0xcb, 0x44, 0xee, 0xee, 0xee, 0x87, 0xfa, 0xfa, 0xfa, 0xc8, 0xf9, 0xf9, 0xf9, 0xc9, 0xf9, 0xf9, 0xf9, 0xc9, 0xfa, 0xfa, 0xfa, 0xc9, 0xfa, 0xfa, 0xfa, 0xc9, 0xf9, 0xf9, 0xf9, 0xc9, 0xf9, 0xf9, 0xf9, 0xc9, 0xfa, 0xfa, 0xfa, 0xc8, 0xee, 0xee, 0xee, 0x87, 0xcb, 0xcb, 0xcb, 0x44, 0xc8, 0xc8, 0xc8, 0x41, 0xc9, 0xc9, 0xc9, 0x3d, 0xc9, 0xc9, 0xc9, 0x39, 0xc9, 0xc9, 0xc9, 0x34, 0xc9, 0xc9, 0xc9, 0x2f, 0xc8, 0xc8, 0xc8, 0x2a, 0xcd, 0xcd, 0xcd, 0x24, 0xce, 0xce, 0xce, 0x1f, 0xce, 0xce, 0xce, 0x1a, 0xce, 0xce, 0xce, 0x15, 0xd2, 0xd2, 0xd2, 0x11, 0xd8, 0xd8, 0xd8, 0x0d, 0xcc, 0xcc, 0xcc, 0x0a, 0xdb, 0xdb, 0xdb, 0x07, 0xcc, 0xcc, 0xcc, 0x05, 0xbf, 0xbf, 0xbf, 0x04, 0xff, 0xff, 0xff, 0x02, 0xff, 0xff, 0xff, 0x01]);

var LASER_LENGTH = 1.0;
var LASER_DIAMETER = 0.01;
var LASER_FADE_END = 0.535;
var LASER_FADE_POINT = 0.5335;
var LASER_DEFAULT_COLOR = [1.0, 1.0, 1.0, 0.25];

var CURSOR_RADIUS = 0.004;
var CURSOR_SHADOW_RADIUS = 0.007;
var CURSOR_SHADOW_INNER_LUMINANCE = 0.5;
var CURSOR_SHADOW_OUTER_LUMINANCE = 0.0;
var CURSOR_SHADOW_INNER_OPACITY = 0.75;
var CURSOR_SHADOW_OUTER_OPACITY = 0.0;
var CURSOR_OPACITY = 0.9;
var CURSOR_SEGMENTS = 16;
var CURSOR_DEFAULT_COLOR = [1.0, 1.0, 1.0, 1.0];
var CURSOR_DEFAULT_HIDDEN_COLOR = [0.5, 0.5, 0.5, 0.25];

var DEFAULT_RESET_OPTIONS = {
  controllers: true,
  lasers: true,
  cursors: true
};

var LaserMaterial = function (_Material) {
  _inherits(LaserMaterial, _Material);

  function LaserMaterial() {
    _classCallCheck(this, LaserMaterial);

    var _this = _possibleConstructorReturn(this, (LaserMaterial.__proto__ || Object.getPrototypeOf(LaserMaterial)).call(this));

    _this.renderOrder = RENDER_ORDER.ADDITIVE;
    _this.state.cullFace = false;
    _this.state.blend = true;
    _this.state.blendFuncSrc = GL.ONE;
    _this.state.blendFuncDst = GL.ONE;
    _this.state.depthMask = false;

    _this.laser = _this.defineSampler('diffuse');
    _this.laser.texture = new DataTexture(LASER_TEXTURE_DATA, 48, 1);
    _this.laserColor = _this.defineUniform('laserColor', LASER_DEFAULT_COLOR);
    return _this;
  }

  _createClass(LaserMaterial, [{
    key: 'materialName',
    get: function get() {
      return 'INPUT_LASER';
    }
  }, {
    key: 'vertexSource',
    get: function get() {
      return '\n    attribute vec3 POSITION;\n    attribute vec2 TEXCOORD_0;\n\n    varying vec2 vTexCoord;\n\n    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {\n      vTexCoord = TEXCOORD_0;\n      return proj * view * model * vec4(POSITION, 1.0);\n    }';
    }
  }, {
    key: 'fragmentSource',
    get: function get() {
      return '\n    precision mediump float;\n\n    uniform vec4 laserColor;\n    uniform sampler2D diffuse;\n    varying vec2 vTexCoord;\n\n    const float fadePoint = ' + LASER_FADE_POINT + ';\n    const float fadeEnd = ' + LASER_FADE_END + ';\n\n    vec4 fragment_main() {\n      vec2 uv = vTexCoord;\n      float front_fade_factor = 1.0 - clamp(1.0 - (uv.y - fadePoint) / (1.0 - fadePoint), 0.0, 1.0);\n      float back_fade_factor = clamp((uv.y - fadePoint) / (fadeEnd - fadePoint), 0.0, 1.0);\n      vec4 color = laserColor * texture2D(diffuse, vTexCoord);\n      float opacity = color.a * front_fade_factor * back_fade_factor;\n      return vec4(color.rgb * opacity, opacity);\n    }';
    }
  }]);

  return LaserMaterial;
}(Material);

var CURSOR_VERTEX_SHADER = '\nattribute vec4 POSITION;\n\nvarying float vLuminance;\nvarying float vOpacity;\n\nvec4 vertex_main(mat4 proj, mat4 view, mat4 model) {\n  vLuminance = POSITION.z;\n  vOpacity = POSITION.w;\n\n  // Billboarded, constant size vertex transform.\n  vec4 screenPos = proj * view * model * vec4(0.0, 0.0, 0.0, 1.0);\n  screenPos /= screenPos.w;\n  screenPos.xy += POSITION.xy;\n  return screenPos;\n}';

var CURSOR_FRAGMENT_SHADER = '\nprecision mediump float;\n\nuniform vec4 cursorColor;\nvarying float vLuminance;\nvarying float vOpacity;\n\nvec4 fragment_main() {\n  vec3 color = cursorColor.rgb * vLuminance;\n  float opacity = cursorColor.a * vOpacity;\n  return vec4(color * opacity, opacity);\n}';

// Cursors are drawn as billboards that always face the camera and are rendered
// as a fixed size no matter how far away they are.

var CursorMaterial = function (_Material2) {
  _inherits(CursorMaterial, _Material2);

  function CursorMaterial() {
    _classCallCheck(this, CursorMaterial);

    var _this2 = _possibleConstructorReturn(this, (CursorMaterial.__proto__ || Object.getPrototypeOf(CursorMaterial)).call(this));

    _this2.renderOrder = RENDER_ORDER.ADDITIVE;
    _this2.state.cullFace = false;
    _this2.state.blend = true;
    _this2.state.blendFuncSrc = GL.ONE;
    _this2.state.depthMask = false;

    _this2.cursorColor = _this2.defineUniform('cursorColor', CURSOR_DEFAULT_COLOR);
    return _this2;
  }

  _createClass(CursorMaterial, [{
    key: 'materialName',
    get: function get() {
      return 'INPUT_CURSOR';
    }
  }, {
    key: 'vertexSource',
    get: function get() {
      return CURSOR_VERTEX_SHADER;
    }
  }, {
    key: 'fragmentSource',
    get: function get() {
      return CURSOR_FRAGMENT_SHADER;
    }
  }]);

  return CursorMaterial;
}(Material);

var CursorHiddenMaterial = function (_Material3) {
  _inherits(CursorHiddenMaterial, _Material3);

  function CursorHiddenMaterial() {
    _classCallCheck(this, CursorHiddenMaterial);

    var _this3 = _possibleConstructorReturn(this, (CursorHiddenMaterial.__proto__ || Object.getPrototypeOf(CursorHiddenMaterial)).call(this));

    _this3.renderOrder = RENDER_ORDER.ADDITIVE;
    _this3.state.cullFace = false;
    _this3.state.blend = true;
    _this3.state.blendFuncSrc = GL.ONE;
    _this3.state.depthFunc = GL.GEQUAL;
    _this3.state.depthMask = false;

    _this3.cursorColor = _this3.defineUniform('cursorColor', CURSOR_DEFAULT_HIDDEN_COLOR);
    return _this3;
  }

  // TODO: Rename to "program_name"


  _createClass(CursorHiddenMaterial, [{
    key: 'materialName',
    get: function get() {
      return 'INPUT_CURSOR_2';
    }
  }, {
    key: 'vertexSource',
    get: function get() {
      return CURSOR_VERTEX_SHADER;
    }
  }, {
    key: 'fragmentSource',
    get: function get() {
      return CURSOR_FRAGMENT_SHADER;
    }
  }]);

  return CursorHiddenMaterial;
}(Material);

export var InputRenderer = function (_Node) {
  _inherits(InputRenderer, _Node);

  function InputRenderer() {
    _classCallCheck(this, InputRenderer);

    var _this4 = _possibleConstructorReturn(this, (InputRenderer.__proto__ || Object.getPrototypeOf(InputRenderer)).call(this));

    _this4._maxInputElements = 32;

    _this4._controllers = null;
    _this4._lasers = null;
    _this4._cursors = null;

    _this4._activeControllers = 0;
    _this4._activeLasers = 0;
    _this4._activeCursors = 0;
    return _this4;
  }

  _createClass(InputRenderer, [{
    key: 'onRendererChanged',
    value: function onRendererChanged(renderer) {
      this._controllers = null;
      this._lasers = null;
      this._cursors = null;

      this._activeControllers = 0;
      this._activeLasers = 0;
      this._activeCursors = 0;
    }
  }, {
    key: 'useProfileControllerMeshes',
    value: function useProfileControllerMeshes(session) {
      var _this5 = this;

      // As input sources are connected if they are tracked-pointer devices
      // look up which meshes should be associated with their profile and
      // load as the controller model for that hand.
      session.addEventListener('inputsourceschange', function (event) {
        var _loop = function _loop(inputSource) {
          if (inputSource.targetRayMode == 'tracked-pointer') {
            fetchProfile(inputSource, DEFAULT_PROFILES_PATH).then(function (_ref) {
              var profile = _ref.profile,
                  assetPath = _ref.assetPath;

              _this5.setControllerMesh(new Gltf2Node({ url: assetPath }), inputSource.handedness);
            });
          }
        };

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = event.added[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var inputSource = _step.value;

            _loop(inputSource);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      });
    }
  }, {
    key: 'setControllerMesh',
    value: function setControllerMesh(controllerNode) {
      var handedness = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'right';

      if (!this._controllers) {
        this._controllers = {};
      }
      this._controllers[handedness] = { nodes: [controllerNode], activeCount: 0 };
      controllerNode.visible = false;
      // FIXME: Temporary fix to initialize for cloning.
      this.addNode(controllerNode);
    }
  }, {
    key: 'addController',
    value: function addController(gripMatrix) {
      var handedness = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'right';

      if (!this._controllers) {
        return;
      }
      var controller = this._controllers[handedness];

      if (!controller) {
        return;
      }

      var controllerNode = null;
      if (controller.activeCount < controller.nodes.length) {
        controllerNode = controller.nodes[controller.activeCount];
      } else {
        controllerNode = controller.nodes[0].clone();
        this.addNode(controllerNode);
        controller.nodes.push(controllerNode);
      }
      controller.activeCount = (controller.activeCount + 1) % this._maxInputElements;

      controllerNode.matrix = gripMatrix;
      controllerNode.visible = true;
    }
  }, {
    key: 'addLaserPointer',
    value: function addLaserPointer(rigidTransform) {
      // Create the laser pointer mesh if needed.
      if (!this._lasers && this._renderer) {
        this._lasers = [this._createLaserMesh()];
        this.addNode(this._lasers[0]);
      }

      var laser = null;
      if (this._activeLasers < this._lasers.length) {
        laser = this._lasers[this._activeLasers];
      } else {
        laser = this._lasers[0].clone();
        this.addNode(laser);
        this._lasers.push(laser);
      }
      this._activeLasers = (this._activeLasers + 1) % this._maxInputElements;

      laser.matrix = rigidTransform.matrix;
      laser.visible = true;
    }
  }, {
    key: 'addCursor',
    value: function addCursor(cursorPos) {
      // Create the cursor mesh if needed.
      if (!this._cursors && this._renderer) {
        this._cursors = [this._createCursorMesh()];
        this.addNode(this._cursors[0]);
      }

      var cursor = null;
      if (this._activeCursors < this._cursors.length) {
        cursor = this._cursors[this._activeCursors];
      } else {
        cursor = this._cursors[0].clone();
        this.addNode(cursor);
        this._cursors.push(cursor);
      }
      this._activeCursors = (this._activeCursors + 1) % this._maxInputElements;

      cursor.translation = cursorPos;
      cursor.visible = true;
    }
  }, {
    key: 'reset',
    value: function reset(options) {
      if (!options) {
        options = DEFAULT_RESET_OPTIONS;
      }
      if (this._controllers && options.controllers) {
        for (var handedness in this._controllers) {
          var controller = this._controllers[handedness];
          controller.activeCount = 0;
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = controller.nodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var controllerNode = _step2.value;

              controllerNode.visible = false;
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }
      }
      if (this._lasers && options.lasers) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = this._lasers[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var laser = _step3.value;

            laser.visible = false;
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        this._activeLasers = 0;
      }
      if (this._cursors && options.cursors) {
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = this._cursors[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var cursor = _step4.value;

            cursor.visible = false;
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }

        this._activeCursors = 0;
      }
    }
  }, {
    key: '_createLaserMesh',
    value: function _createLaserMesh() {
      var gl = this._renderer._gl;

      var lr = LASER_DIAMETER * 0.5;
      var ll = LASER_LENGTH;

      // Laser is rendered as cross-shaped beam
      var laserVerts = [
      // X    Y   Z    U    V
      0.0, lr, 0.0, 0.0, 1.0, 0.0, lr, -ll, 0.0, 0.0, 0.0, -lr, 0.0, 1.0, 1.0, 0.0, -lr, -ll, 1.0, 0.0, lr, 0.0, 0.0, 0.0, 1.0, lr, 0.0, -ll, 0.0, 0.0, -lr, 0.0, 0.0, 1.0, 1.0, -lr, 0.0, -ll, 1.0, 0.0, 0.0, -lr, 0.0, 0.0, 1.0, 0.0, -lr, -ll, 0.0, 0.0, 0.0, lr, 0.0, 1.0, 1.0, 0.0, lr, -ll, 1.0, 0.0, -lr, 0.0, 0.0, 0.0, 1.0, -lr, 0.0, -ll, 0.0, 0.0, lr, 0.0, 0.0, 1.0, 1.0, lr, 0.0, -ll, 1.0, 0.0];
      var laserIndices = [0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13, 14, 13, 15, 14];

      var laserVertexBuffer = this._renderer.createRenderBuffer(gl.ARRAY_BUFFER, new Float32Array(laserVerts));
      var laserIndexBuffer = this._renderer.createRenderBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(laserIndices));

      var laserIndexCount = laserIndices.length;

      var laserAttribs = [new PrimitiveAttribute('POSITION', laserVertexBuffer, 3, gl.FLOAT, 20, 0), new PrimitiveAttribute('TEXCOORD_0', laserVertexBuffer, 2, gl.FLOAT, 20, 12)];

      var laserPrimitive = new Primitive(laserAttribs, laserIndexCount);
      laserPrimitive.setIndexBuffer(laserIndexBuffer);

      var laserMaterial = new LaserMaterial();

      var laserRenderPrimitive = this._renderer.createRenderPrimitive(laserPrimitive, laserMaterial);
      var meshNode = new Node();
      meshNode.addRenderPrimitive(laserRenderPrimitive);
      return meshNode;
    }
  }, {
    key: '_createCursorMesh',
    value: function _createCursorMesh() {
      var gl = this._renderer._gl;

      // Cursor is a circular white dot with a dark "shadow" skirt around the edge
      // that fades from black to transparent as it moves out from the center.
      // Cursor verts are packed as [X, Y, Luminance, Opacity]
      var cursorVerts = [];
      var cursorIndices = [];

      var segRad = 2.0 * Math.PI / CURSOR_SEGMENTS;

      // Cursor center
      for (var i = 0; i < CURSOR_SEGMENTS; ++i) {
        var rad = i * segRad;
        var x = Math.cos(rad);
        var y = Math.sin(rad);
        cursorVerts.push(x * CURSOR_RADIUS, y * CURSOR_RADIUS, 1.0, CURSOR_OPACITY);

        if (i > 1) {
          cursorIndices.push(0, i - 1, i);
        }
      }

      var indexOffset = CURSOR_SEGMENTS;

      // Cursor Skirt
      for (var _i = 0; _i < CURSOR_SEGMENTS; ++_i) {
        var _rad = _i * segRad;
        var _x3 = Math.cos(_rad);
        var _y = Math.sin(_rad);
        cursorVerts.push(_x3 * CURSOR_RADIUS, _y * CURSOR_RADIUS, CURSOR_SHADOW_INNER_LUMINANCE, CURSOR_SHADOW_INNER_OPACITY);
        cursorVerts.push(_x3 * CURSOR_SHADOW_RADIUS, _y * CURSOR_SHADOW_RADIUS, CURSOR_SHADOW_OUTER_LUMINANCE, CURSOR_SHADOW_OUTER_OPACITY);

        if (_i > 0) {
          var _idx = indexOffset + _i * 2;
          cursorIndices.push(_idx - 2, _idx - 1, _idx);
          cursorIndices.push(_idx - 1, _idx + 1, _idx);
        }
      }

      var idx = indexOffset + CURSOR_SEGMENTS * 2;
      cursorIndices.push(idx - 2, idx - 1, indexOffset);
      cursorIndices.push(idx - 1, indexOffset + 1, indexOffset);

      var cursorVertexBuffer = this._renderer.createRenderBuffer(gl.ARRAY_BUFFER, new Float32Array(cursorVerts));
      var cursorIndexBuffer = this._renderer.createRenderBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cursorIndices));

      var cursorIndexCount = cursorIndices.length;

      var cursorAttribs = [new PrimitiveAttribute('POSITION', cursorVertexBuffer, 4, gl.FLOAT, 16, 0)];

      var cursorPrimitive = new Primitive(cursorAttribs, cursorIndexCount);
      cursorPrimitive.setIndexBuffer(cursorIndexBuffer);

      var cursorMaterial = new CursorMaterial();
      var cursorHiddenMaterial = new CursorHiddenMaterial();

      // Cursor renders two parts: The bright opaque cursor for areas where it's
      // not obscured and a more transparent, darker version for areas where it's
      // behind another object.
      var cursorRenderPrimitive = this._renderer.createRenderPrimitive(cursorPrimitive, cursorMaterial);
      var cursorHiddenRenderPrimitive = this._renderer.createRenderPrimitive(cursorPrimitive, cursorHiddenMaterial);
      var meshNode = new Node();
      meshNode.addRenderPrimitive(cursorRenderPrimitive);
      meshNode.addRenderPrimitive(cursorHiddenRenderPrimitive);
      return meshNode;
    }
  }]);

  return InputRenderer;
}(Node);