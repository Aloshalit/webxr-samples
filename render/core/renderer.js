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

import { CAP, MAT_STATE, RENDER_ORDER, stateToBlendFunc } from './material.js';
import { Node } from './node.js';
import { Program } from './program.js';
import { DataTexture, VideoTexture } from './texture.js';
import { mat4, vec3 } from '../math/gl-matrix.js';

export var ATTRIB = {
  POSITION: 1,
  NORMAL: 2,
  TANGENT: 3,
  TEXCOORD_0: 4,
  TEXCOORD_1: 5,
  COLOR_0: 6
};

export var ATTRIB_MASK = {
  POSITION: 0x0001,
  NORMAL: 0x0002,
  TANGENT: 0x0004,
  TEXCOORD_0: 0x0008,
  TEXCOORD_1: 0x0010,
  COLOR_0: 0x0020
};

var GL = WebGLRenderingContext; // For enums

var DEF_LIGHT_DIR = new Float32Array([0, 0.5, -3]);
var DEF_LIGHT_COLOR = new Float32Array([3.0, 3.0, 3.0]);

var PRECISION_REGEX = new RegExp('precision (lowp|mediump|highp) float;');

var VERTEX_SHADER_SINGLE_ENTRY = '\nuniform mat4 PROJECTION_MATRIX, VIEW_MATRIX, MODEL_MATRIX;\n\nvoid main() {\n  gl_Position = vertex_main(PROJECTION_MATRIX, VIEW_MATRIX, MODEL_MATRIX);\n}\n';

var VERTEX_SHADER_MULTI_ENTRY = '\n#ERROR Multiview rendering is not implemented\nvoid main() {\n  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);\n}\n';

var FRAGMENT_SHADER_ENTRY = '\nvoid main() {\n  gl_FragColor = fragment_main();\n}\n';

function isPowerOfTwo(n) {
  return (n & n - 1) === 0;
}

// Creates a WebGL context and initializes it with some common default state.
export function createWebGLContext(glAttribs) {
  glAttribs = glAttribs || { alpha: false };

  var webglCanvas = document.createElement('canvas');
  var contextTypes = glAttribs.webgl2 ? ['webgl2'] : ['webgl', 'experimental-webgl'];
  var context = null;

  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = contextTypes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var contextType = _step.value;

      context = webglCanvas.getContext(contextType, glAttribs);
      if (context) {
        break;
      }
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

  if (!context) {
    var webglType = glAttribs.webgl2 ? 'WebGL 2' : 'WebGL';
    console.error('This browser does not support ' + webglType + '.');
    return null;
  }

  return context;
}

export var RenderView = function () {
  function RenderView(projectionMatrix, viewTransform) {
    var viewport = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var eye = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'left';

    _classCallCheck(this, RenderView);

    this.projectionMatrix = projectionMatrix;
    this.viewport = viewport;
    // If an eye isn't given the left eye is assumed.
    this._eye = eye;
    this._eyeIndex = eye == 'left' ? 0 : 1;

    // Compute the view matrix
    if (viewTransform instanceof Float32Array) {
      this._viewMatrix = mat4.clone(viewTransform);
      this.viewTransform = new XRRigidTransform(); // TODO
    } else {
      this.viewTransform = viewTransform;
      this._viewMatrix = viewTransform.inverse.matrix;

      // Alternative view matrix code path
      /*this._viewMatrix = mat4.create();
      let q = viewTransform.orientation;
      let t = viewTransform.position;
      mat4.fromRotationTranslation(
          this._viewMatrix,
          [q.x, q.y, q.z, q.w],
          [t.x, t.y, t.z]
      );
      mat4.invert(this._viewMatrix, this._viewMatrix);*/
    }
  }

  _createClass(RenderView, [{
    key: 'viewMatrix',
    get: function get() {
      return this._viewMatrix;
    }
  }, {
    key: 'eye',
    get: function get() {
      return this._eye;
    },
    set: function set(value) {
      this._eye = value;
      this._eyeIndex = value == 'left' ? 0 : 1;
    }
  }, {
    key: 'eyeIndex',
    get: function get() {
      return this._eyeIndex;
    }
  }]);

  return RenderView;
}();

var RenderBuffer = function () {
  function RenderBuffer(target, usage, buffer) {
    var _this = this;

    var length = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    _classCallCheck(this, RenderBuffer);

    this._target = target;
    this._usage = usage;
    this._length = length;
    if (buffer instanceof Promise) {
      this._buffer = null;
      this._promise = buffer.then(function (buffer) {
        _this._buffer = buffer;
        return _this;
      });
    } else {
      this._buffer = buffer;
      this._promise = Promise.resolve(this);
    }
  }

  _createClass(RenderBuffer, [{
    key: 'waitForComplete',
    value: function waitForComplete() {
      return this._promise;
    }
  }]);

  return RenderBuffer;
}();

var RenderPrimitiveAttribute = function RenderPrimitiveAttribute(primitiveAttribute) {
  _classCallCheck(this, RenderPrimitiveAttribute);

  this._attrib_index = ATTRIB[primitiveAttribute.name];
  this._componentCount = primitiveAttribute.componentCount;
  this._componentType = primitiveAttribute.componentType;
  this._stride = primitiveAttribute.stride;
  this._byteOffset = primitiveAttribute.byteOffset;
  this._normalized = primitiveAttribute.normalized;
};

var RenderPrimitiveAttributeBuffer = function RenderPrimitiveAttributeBuffer(buffer) {
  _classCallCheck(this, RenderPrimitiveAttributeBuffer);

  this._buffer = buffer;
  this._attributes = [];
};

var RenderPrimitive = function () {
  function RenderPrimitive(primitive) {
    _classCallCheck(this, RenderPrimitive);

    this._activeFrameId = 0;
    this._instances = [];
    this._material = null;

    this.setPrimitive(primitive);
  }

  _createClass(RenderPrimitive, [{
    key: 'setPrimitive',
    value: function setPrimitive(primitive) {
      this._mode = primitive.mode;
      this._elementCount = primitive.elementCount;
      this._promise = null;
      this._vao = null;
      this._complete = false;
      this._attributeBuffers = [];
      this._attributeMask = 0;

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = primitive.attributes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var attribute = _step2.value;

          this._attributeMask |= ATTRIB_MASK[attribute.name];
          var renderAttribute = new RenderPrimitiveAttribute(attribute);
          var foundBuffer = false;
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = this._attributeBuffers[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var attributeBuffer = _step3.value;

              if (attributeBuffer._buffer == attribute.buffer) {
                attributeBuffer._attributes.push(renderAttribute);
                foundBuffer = true;
                break;
              }
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

          if (!foundBuffer) {
            var _attributeBuffer = new RenderPrimitiveAttributeBuffer(attribute.buffer);
            _attributeBuffer._attributes.push(renderAttribute);
            this._attributeBuffers.push(_attributeBuffer);
          }
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

      this._indexBuffer = null;
      this._indexByteOffset = 0;
      this._indexType = 0;

      if (primitive.indexBuffer) {
        this._indexByteOffset = primitive.indexByteOffset;
        this._indexType = primitive.indexType;
        this._indexBuffer = primitive.indexBuffer;
      }

      if (primitive._min) {
        this._min = vec3.clone(primitive._min);
        this._max = vec3.clone(primitive._max);
      } else {
        this._min = null;
        this._max = null;
      }

      if (this._material != null) {
        this.waitForComplete(); // To flip the _complete flag.
      }
    }
  }, {
    key: 'setRenderMaterial',
    value: function setRenderMaterial(material) {
      this._material = material;
      this._promise = null;
      this._complete = false;

      if (this._material != null) {
        this.waitForComplete(); // To flip the _complete flag.
      }
    }
  }, {
    key: 'markActive',
    value: function markActive(frameId) {
      if (this._complete && this._activeFrameId != frameId) {
        if (this._material) {
          if (!this._material.markActive(frameId)) {
            return;
          }
        }
        this._activeFrameId = frameId;
      }
    }
  }, {
    key: 'waitForComplete',
    value: function waitForComplete() {
      var _this2 = this;

      if (!this._promise) {
        if (!this._material) {
          return Promise.reject('RenderPrimitive does not have a material');
        }

        var completionPromises = [];

        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = this._attributeBuffers[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var attributeBuffer = _step4.value;

            if (!attributeBuffer._buffer._buffer) {
              completionPromises.push(attributeBuffer._buffer._promise);
            }
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

        if (this._indexBuffer && !this._indexBuffer._buffer) {
          completionPromises.push(this._indexBuffer._promise);
        }

        this._promise = Promise.all(completionPromises).then(function () {
          _this2._complete = true;
          return _this2;
        });
      }
      return this._promise;
    }
  }, {
    key: 'samplers',
    get: function get() {
      return this._material._samplerDictionary;
    }
  }, {
    key: 'uniforms',
    get: function get() {
      return this._material._uniform_dictionary;
    }
  }]);

  return RenderPrimitive;
}();

export var RenderTexture = function () {
  function RenderTexture(texture) {
    _classCallCheck(this, RenderTexture);

    this._texture = texture;
    this._complete = false;
    this._activeFrameId = 0;
    this._activeCallback = null;
  }

  _createClass(RenderTexture, [{
    key: 'markActive',
    value: function markActive(frameId) {
      if (this._activeCallback && this._activeFrameId != frameId) {
        this._activeFrameId = frameId;
        this._activeCallback(this);
      }
    }
  }]);

  return RenderTexture;
}();

var inverseMatrix = mat4.create();

function setCap(gl, glEnum, cap, prevState, state) {
  var change = (state & cap) - (prevState & cap);
  if (!change) {
    return;
  }

  if (change > 0) {
    gl.enable(glEnum);
  } else {
    gl.disable(glEnum);
  }
}

var RenderMaterialSampler = function () {
  function RenderMaterialSampler(renderer, materialSampler, index) {
    _classCallCheck(this, RenderMaterialSampler);

    this._renderer = renderer;
    this._uniformName = materialSampler._uniformName;
    this._renderTexture = renderer._getRenderTexture(materialSampler._texture);
    this._index = index;
  }

  _createClass(RenderMaterialSampler, [{
    key: 'texture',
    set: function set(value) {
      this._renderTexture = this._renderer._getRenderTexture(value);
    }
  }]);

  return RenderMaterialSampler;
}();

var RenderMaterialUniform = function () {
  function RenderMaterialUniform(materialUniform) {
    _classCallCheck(this, RenderMaterialUniform);

    this._uniformName = materialUniform._uniformName;
    this._uniform = null;
    this._length = materialUniform._length;
    if (materialUniform._value instanceof Array) {
      this._value = new Float32Array(materialUniform._value);
    } else {
      this._value = new Float32Array([materialUniform._value]);
    }
  }

  _createClass(RenderMaterialUniform, [{
    key: 'value',
    set: function set(value) {
      if (this._value.length == 1) {
        this._value[0] = value;
      } else {
        for (var i = 0; i < this._value.length; ++i) {
          this._value[i] = value[i];
        }
      }
    }
  }]);

  return RenderMaterialUniform;
}();

var RenderMaterial = function () {
  function RenderMaterial(renderer, material, program) {
    _classCallCheck(this, RenderMaterial);

    this._program = program;
    this._state = material.state._state;
    this._activeFrameId = 0;
    this._completeForActiveFrame = false;

    this._samplerDictionary = {};
    this._samplers = [];
    for (var i = 0; i < material._samplers.length; ++i) {
      var renderSampler = new RenderMaterialSampler(renderer, material._samplers[i], i);
      this._samplers.push(renderSampler);
      this._samplerDictionary[renderSampler._uniformName] = renderSampler;
    }

    this._uniform_dictionary = {};
    this._uniforms = [];
    var _iteratorNormalCompletion5 = true;
    var _didIteratorError5 = false;
    var _iteratorError5 = undefined;

    try {
      for (var _iterator5 = material._uniforms[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
        var uniform = _step5.value;

        var renderUniform = new RenderMaterialUniform(uniform);
        this._uniforms.push(renderUniform);
        this._uniform_dictionary[renderUniform._uniformName] = renderUniform;
      }
    } catch (err) {
      _didIteratorError5 = true;
      _iteratorError5 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion5 && _iterator5.return) {
          _iterator5.return();
        }
      } finally {
        if (_didIteratorError5) {
          throw _iteratorError5;
        }
      }
    }

    this._firstBind = true;

    this._renderOrder = material.renderOrder;
    if (this._renderOrder == RENDER_ORDER.DEFAULT) {
      if (this._state & CAP.BLEND) {
        this._renderOrder = RENDER_ORDER.TRANSPARENT;
      } else {
        this._renderOrder = RENDER_ORDER.OPAQUE;
      }
    }
  }

  _createClass(RenderMaterial, [{
    key: 'bind',
    value: function bind(gl) {
      // First time we do a binding, cache the uniform locations and remove
      // unused uniforms from the list.
      if (this._firstBind) {
        for (var i = 0; i < this._samplers.length;) {
          var sampler = this._samplers[i];
          if (!this._program.uniform[sampler._uniformName]) {
            this._samplers.splice(i, 1);
            continue;
          }
          ++i;
        }

        for (var _i = 0; _i < this._uniforms.length;) {
          var uniform = this._uniforms[_i];
          uniform._uniform = this._program.uniform[uniform._uniformName];
          if (!uniform._uniform) {
            this._uniforms.splice(_i, 1);
            continue;
          }
          ++_i;
        }
        this._firstBind = false;
      }

      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = this._samplers[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var _sampler = _step6.value;

          gl.activeTexture(gl.TEXTURE0 + _sampler._index);
          if (_sampler._renderTexture && _sampler._renderTexture._complete) {
            gl.bindTexture(gl.TEXTURE_2D, _sampler._renderTexture._texture);
          } else {
            gl.bindTexture(gl.TEXTURE_2D, null);
          }
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = this._uniforms[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var _uniform = _step7.value;

          switch (_uniform._length) {
            case 1:
              gl.uniform1fv(_uniform._uniform, _uniform._value);break;
            case 2:
              gl.uniform2fv(_uniform._uniform, _uniform._value);break;
            case 3:
              gl.uniform3fv(_uniform._uniform, _uniform._value);break;
            case 4:
              gl.uniform4fv(_uniform._uniform, _uniform._value);break;
          }
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }
    }
  }, {
    key: 'markActive',
    value: function markActive(frameId) {
      if (this._activeFrameId != frameId) {
        this._activeFrameId = frameId;
        this._completeForActiveFrame = true;
        for (var i = 0; i < this._samplers.length; ++i) {
          var sampler = this._samplers[i];
          if (sampler._renderTexture) {
            if (!sampler._renderTexture._complete) {
              this._completeForActiveFrame = false;
              break;
            }
            sampler._renderTexture.markActive(frameId);
          }
        }
      }
      return this._completeForActiveFrame;
    }

    // Material State fetchers

  }, {
    key: '_capsDiff',


    // Only really for use from the renderer
    value: function _capsDiff(otherState) {
      return otherState & MAT_STATE.CAPS_RANGE ^ this._state & MAT_STATE.CAPS_RANGE;
    }
  }, {
    key: '_blendDiff',
    value: function _blendDiff(otherState) {
      if (!(this._state & CAP.BLEND)) {
        return 0;
      }
      return otherState & MAT_STATE.BLEND_FUNC_RANGE ^ this._state & MAT_STATE.BLEND_FUNC_RANGE;
    }
  }, {
    key: '_depthFuncDiff',
    value: function _depthFuncDiff(otherState) {
      if (!(this._state & CAP.DEPTH_TEST)) {
        return 0;
      }
      return otherState & MAT_STATE.DEPTH_FUNC_RANGE ^ this._state & MAT_STATE.DEPTH_FUNC_RANGE;
    }
  }, {
    key: 'cullFace',
    get: function get() {
      return !!(this._state & CAP.CULL_FACE);
    }
  }, {
    key: 'blend',
    get: function get() {
      return !!(this._state & CAP.BLEND);
    }
  }, {
    key: 'depthTest',
    get: function get() {
      return !!(this._state & CAP.DEPTH_TEST);
    }
  }, {
    key: 'stencilTest',
    get: function get() {
      return !!(this._state & CAP.STENCIL_TEST);
    }
  }, {
    key: 'colorMask',
    get: function get() {
      return !!(this._state & CAP.COLOR_MASK);
    }
  }, {
    key: 'depthMask',
    get: function get() {
      return !!(this._state & CAP.DEPTH_MASK);
    }
  }, {
    key: 'stencilMask',
    get: function get() {
      return !!(this._state & CAP.STENCIL_MASK);
    }
  }, {
    key: 'depthFunc',
    get: function get() {
      return ((this._state & MAT_STATE.DEPTH_FUNC_RANGE) >> MAT_STATE.DEPTH_FUNC_SHIFT) + GL.NEVER;
    }
  }, {
    key: 'blendFuncSrc',
    get: function get() {
      return stateToBlendFunc(this._state, MAT_STATE.BLEND_SRC_RANGE, MAT_STATE.BLEND_SRC_SHIFT);
    }
  }, {
    key: 'blendFuncDst',
    get: function get() {
      return stateToBlendFunc(this._state, MAT_STATE.BLEND_DST_RANGE, MAT_STATE.BLEND_DST_SHIFT);
    }
  }]);

  return RenderMaterial;
}();

export var Renderer = function () {
  function Renderer(gl) {
    _classCallCheck(this, Renderer);

    this._gl = gl || createWebGLContext();
    this._frameId = 0;
    this._programCache = {};
    this._textureCache = {};
    this._renderPrimitives = Array(RENDER_ORDER.DEFAULT);
    this._cameraPositions = [];

    this._vaoExt = gl.getExtension('OES_vertex_array_object');

    var fragHighPrecision = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
    this._defaultFragPrecision = fragHighPrecision.precision > 0 ? 'highp' : 'mediump';

    this._depthMaskNeedsReset = false;
    this._colorMaskNeedsReset = false;

    this._globalLightColor = vec3.clone(DEF_LIGHT_COLOR);
    this._globalLightDir = vec3.clone(DEF_LIGHT_DIR);
  }

  _createClass(Renderer, [{
    key: 'createRenderBuffer',
    value: function createRenderBuffer(target, data) {
      var usage = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : GL.STATIC_DRAW;

      var gl = this._gl;
      var glBuffer = gl.createBuffer();

      if (data instanceof Promise) {
        var renderBuffer = new RenderBuffer(target, usage, data.then(function (data) {
          gl.bindBuffer(target, glBuffer);
          gl.bufferData(target, data, usage);
          renderBuffer._length = data.byteLength;
          return glBuffer;
        }));
        return renderBuffer;
      } else {
        gl.bindBuffer(target, glBuffer);
        gl.bufferData(target, data, usage);
        return new RenderBuffer(target, usage, glBuffer, data.byteLength);
      }
    }
  }, {
    key: 'updateRenderBuffer',
    value: function updateRenderBuffer(buffer, data) {
      var _this3 = this;

      var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      if (buffer._buffer) {
        var gl = this._gl;
        gl.bindBuffer(buffer._target, buffer._buffer);
        if (offset == 0 && buffer._length == data.byteLength) {
          gl.bufferData(buffer._target, data, buffer._usage);
        } else {
          gl.bufferSubData(buffer._target, offset, data);
        }
      } else {
        buffer.waitForComplete().then(function (buffer) {
          _this3.updateRenderBuffer(buffer, data, offset);
        });
      }
    }
  }, {
    key: 'createRenderPrimitive',
    value: function createRenderPrimitive(primitive, material) {
      var renderPrimitive = new RenderPrimitive(primitive);

      var program = this._getMaterialProgram(material, renderPrimitive);
      var renderMaterial = new RenderMaterial(this, material, program);
      renderPrimitive.setRenderMaterial(renderMaterial);

      if (!this._renderPrimitives[renderMaterial._renderOrder]) {
        this._renderPrimitives[renderMaterial._renderOrder] = [];
      }

      this._renderPrimitives[renderMaterial._renderOrder].push(renderPrimitive);

      return renderPrimitive;
    }
  }, {
    key: 'createMesh',
    value: function createMesh(primitive, material) {
      var meshNode = new Node();
      meshNode.addRenderPrimitive(this.createRenderPrimitive(primitive, material));
      return meshNode;
    }
  }, {
    key: 'drawViews',
    value: function drawViews(views, rootNode) {
      if (!rootNode) {
        return;
      }

      var gl = this._gl;
      this._frameId++;

      rootNode.markActive(this._frameId);

      // If there's only one view then flip the algorithm a bit so that we're only
      // setting the viewport once.
      if (views.length == 1 && views[0].viewport) {
        var vp = views[0].viewport;
        this._gl.viewport(vp.x, vp.y, vp.width, vp.height);
      }

      // Get the positions of the 'camera' for each view matrix.
      for (var i = 0; i < views.length; ++i) {
        if (this._cameraPositions.length <= i) {
          this._cameraPositions.push(vec3.create());
        }
        var p = views[i].viewTransform.position;
        this._cameraPositions[i][0] = p.x;
        this._cameraPositions[i][1] = p.y;
        this._cameraPositions[i][2] = p.z;

        /*mat4.invert(inverseMatrix, views[i].viewMatrix);
        let cameraPosition = this._cameraPositions[i];
        vec3.set(cameraPosition, 0, 0, 0);
        vec3.transformMat4(cameraPosition, cameraPosition, inverseMatrix);*/
      }

      // Draw each set of render primitives in order
      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = this._renderPrimitives[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var renderPrimitives = _step8.value;

          if (renderPrimitives && renderPrimitives.length) {
            this._drawRenderPrimitiveSet(views, renderPrimitives);
          }
        }
      } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion8 && _iterator8.return) {
            _iterator8.return();
          }
        } finally {
          if (_didIteratorError8) {
            throw _iteratorError8;
          }
        }
      }

      if (this._vaoExt) {
        this._vaoExt.bindVertexArrayOES(null);
      }

      if (this._depthMaskNeedsReset) {
        gl.depthMask(true);
      }
      if (this._colorMaskNeedsReset) {
        gl.colorMask(true, true, true, true);
      }
    }
  }, {
    key: '_drawRenderPrimitiveSet',
    value: function _drawRenderPrimitiveSet(views, renderPrimitives) {
      var gl = this._gl;
      var program = null;
      var material = null;
      var attribMask = 0;

      // Loop through every primitive known to the renderer.
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = renderPrimitives[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          var primitive = _step9.value;

          // Skip over those that haven't been marked as active for this frame.
          if (primitive._activeFrameId != this._frameId) {
            continue;
          }

          // Bind the primitive material's program if it's different than the one we
          // were using for the previous primitive.
          // TODO: The ording of this could be more efficient.
          if (program != primitive._material._program) {
            program = primitive._material._program;
            program.use();

            if (program.uniform.LIGHT_DIRECTION) {
              gl.uniform3fv(program.uniform.LIGHT_DIRECTION, this._globalLightDir);
            }

            if (program.uniform.LIGHT_COLOR) {
              gl.uniform3fv(program.uniform.LIGHT_COLOR, this._globalLightColor);
            }

            if (views.length == 1) {
              gl.uniformMatrix4fv(program.uniform.PROJECTION_MATRIX, false, views[0].projectionMatrix);
              gl.uniformMatrix4fv(program.uniform.VIEW_MATRIX, false, views[0].viewMatrix);
              gl.uniform3fv(program.uniform.CAMERA_POSITION, this._cameraPositions[0]);
              gl.uniform1i(program.uniform.EYE_INDEX, views[0].eyeIndex);
            }
          }

          if (material != primitive._material) {
            this._bindMaterialState(primitive._material, material);
            primitive._material.bind(gl, program, material);
            material = primitive._material;
          }

          if (this._vaoExt) {
            if (primitive._vao) {
              this._vaoExt.bindVertexArrayOES(primitive._vao);
            } else {
              primitive._vao = this._vaoExt.createVertexArrayOES();
              this._vaoExt.bindVertexArrayOES(primitive._vao);
              this._bindPrimitive(primitive);
            }
          } else {
            this._bindPrimitive(primitive, attribMask);
            attribMask = primitive._attributeMask;
          }

          for (var i = 0; i < views.length; ++i) {
            var view = views[i];
            if (views.length > 1) {
              if (view.viewport) {
                var vp = view.viewport;
                gl.viewport(vp.x, vp.y, vp.width, vp.height);
              }
              gl.uniformMatrix4fv(program.uniform.PROJECTION_MATRIX, false, view.projectionMatrix);
              gl.uniformMatrix4fv(program.uniform.VIEW_MATRIX, false, view.viewMatrix);
              gl.uniform3fv(program.uniform.CAMERA_POSITION, this._cameraPositions[i]);
              gl.uniform1i(program.uniform.EYE_INDEX, view.eyeIndex);
            }

            var _iteratorNormalCompletion10 = true;
            var _didIteratorError10 = false;
            var _iteratorError10 = undefined;

            try {
              for (var _iterator10 = primitive._instances[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
                var instance = _step10.value;

                if (instance._activeFrameId != this._frameId) {
                  continue;
                }

                gl.uniformMatrix4fv(program.uniform.MODEL_MATRIX, false, instance.worldMatrix);

                if (primitive._indexBuffer) {
                  gl.drawElements(primitive._mode, primitive._elementCount, primitive._indexType, primitive._indexByteOffset);
                } else {
                  gl.drawArrays(primitive._mode, 0, primitive._elementCount);
                }
              }
            } catch (err) {
              _didIteratorError10 = true;
              _iteratorError10 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion10 && _iterator10.return) {
                  _iterator10.return();
                }
              } finally {
                if (_didIteratorError10) {
                  throw _iteratorError10;
                }
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError9 = true;
        _iteratorError9 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion9 && _iterator9.return) {
            _iterator9.return();
          }
        } finally {
          if (_didIteratorError9) {
            throw _iteratorError9;
          }
        }
      }
    }
  }, {
    key: '_getRenderTexture',
    value: function _getRenderTexture(texture) {
      var _this4 = this;

      if (!texture) {
        return null;
      }

      var key = texture.textureKey;
      if (!key) {
        throw new Error('Texure does not have a valid key');
      }

      if (key in this._textureCache) {
        return this._textureCache[key];
      } else {
        var gl = this._gl;
        var textureHandle = gl.createTexture();

        var renderTexture = new RenderTexture(textureHandle);
        this._textureCache[key] = renderTexture;

        if (texture instanceof DataTexture) {
          gl.bindTexture(gl.TEXTURE_2D, textureHandle);
          gl.texImage2D(gl.TEXTURE_2D, 0, texture.format, texture.width, texture.height, 0, texture.format, texture._type, texture._data);
          this._setSamplerParameters(texture);
          renderTexture._complete = true;
        } else {
          texture.waitForComplete().then(function () {
            gl.bindTexture(gl.TEXTURE_2D, textureHandle);
            gl.texImage2D(gl.TEXTURE_2D, 0, texture.format, texture.format, gl.UNSIGNED_BYTE, texture.source);
            _this4._setSamplerParameters(texture);
            renderTexture._complete = true;

            if (texture instanceof VideoTexture) {
              // Once the video starts playing, set a callback to update it's
              // contents each frame.
              texture._video.addEventListener('playing', function () {
                renderTexture._activeCallback = function () {
                  if (!texture._video.paused && !texture._video.waiting) {
                    gl.bindTexture(gl.TEXTURE_2D, textureHandle);
                    gl.texImage2D(gl.TEXTURE_2D, 0, texture.format, texture.format, gl.UNSIGNED_BYTE, texture.source);
                  }
                };
              });
            }
          });
        }

        return renderTexture;
      }
    }
  }, {
    key: '_setSamplerParameters',
    value: function _setSamplerParameters(texture) {
      var gl = this._gl;

      var sampler = texture.sampler;
      var powerOfTwo = isPowerOfTwo(texture.width) && isPowerOfTwo(texture.height);
      var mipmap = powerOfTwo && texture.mipmap;
      if (mipmap) {
        gl.generateMipmap(gl.TEXTURE_2D);
      }

      var minFilter = sampler.minFilter || (mipmap ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
      var wrapS = sampler.wrapS || (powerOfTwo ? gl.REPEAT : gl.CLAMP_TO_EDGE);
      var wrapT = sampler.wrapT || (powerOfTwo ? gl.REPEAT : gl.CLAMP_TO_EDGE);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, sampler.magFilter || gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);
    }
  }, {
    key: '_getProgramKey',
    value: function _getProgramKey(name, defines) {
      var key = name + ':';

      for (var define in defines) {
        key += define + '=' + defines[define] + ',';
      }

      return key;
    }
  }, {
    key: '_getMaterialProgram',
    value: function _getMaterialProgram(material, renderPrimitive) {
      var _this5 = this;

      var materialName = material.materialName;
      var vertexSource = material.vertexSource;
      var fragmentSource = material.fragmentSource;

      // These should always be defined for every material
      if (materialName == null) {
        throw new Error('Material does not have a name');
      }
      if (vertexSource == null) {
        throw new Error('Material "' + materialName + '" does not have a vertex source');
      }
      if (fragmentSource == null) {
        throw new Error('Material "' + materialName + '" does not have a fragment source');
      }

      var defines = material.getProgramDefines(renderPrimitive);
      var key = this._getProgramKey(materialName, defines);

      if (key in this._programCache) {
        return this._programCache[key];
      } else {
        var multiview = false; // Handle this dynamically later
        var fullVertexSource = vertexSource;
        fullVertexSource += multiview ? VERTEX_SHADER_MULTI_ENTRY : VERTEX_SHADER_SINGLE_ENTRY;

        var precisionMatch = fragmentSource.match(PRECISION_REGEX);
        var fragPrecisionHeader = precisionMatch ? '' : 'precision ' + this._defaultFragPrecision + ' float;\n';

        var fullFragmentSource = fragPrecisionHeader + fragmentSource;
        fullFragmentSource += FRAGMENT_SHADER_ENTRY;

        var program = new Program(this._gl, fullVertexSource, fullFragmentSource, ATTRIB, defines);
        this._programCache[key] = program;

        program.onNextUse(function (program) {
          // Bind the samplers to the right texture index. This is constant for
          // the lifetime of the program.
          for (var i = 0; i < material._samplers.length; ++i) {
            var sampler = material._samplers[i];
            var uniform = program.uniform[sampler._uniformName];
            if (uniform) {
              _this5._gl.uniform1i(uniform, i);
            }
          }
        });

        return program;
      }
    }
  }, {
    key: '_bindPrimitive',
    value: function _bindPrimitive(primitive, attribMask) {
      var gl = this._gl;

      // If the active attributes have changed then update the active set.
      if (attribMask != primitive._attributeMask) {
        for (var attrib in ATTRIB) {
          if (primitive._attributeMask & ATTRIB_MASK[attrib]) {
            gl.enableVertexAttribArray(ATTRIB[attrib]);
          } else {
            gl.disableVertexAttribArray(ATTRIB[attrib]);
          }
        }
      }

      // Bind the primitive attributes and indices.
      var _iteratorNormalCompletion11 = true;
      var _didIteratorError11 = false;
      var _iteratorError11 = undefined;

      try {
        for (var _iterator11 = primitive._attributeBuffers[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
          var attributeBuffer = _step11.value;

          gl.bindBuffer(gl.ARRAY_BUFFER, attributeBuffer._buffer._buffer);
          var _iteratorNormalCompletion12 = true;
          var _didIteratorError12 = false;
          var _iteratorError12 = undefined;

          try {
            for (var _iterator12 = attributeBuffer._attributes[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
              var _attrib = _step12.value;

              gl.vertexAttribPointer(_attrib._attrib_index, _attrib._componentCount, _attrib._componentType, _attrib._normalized, _attrib._stride, _attrib._byteOffset);
            }
          } catch (err) {
            _didIteratorError12 = true;
            _iteratorError12 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion12 && _iterator12.return) {
                _iterator12.return();
              }
            } finally {
              if (_didIteratorError12) {
                throw _iteratorError12;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError11 = true;
        _iteratorError11 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion11 && _iterator11.return) {
            _iterator11.return();
          }
        } finally {
          if (_didIteratorError11) {
            throw _iteratorError11;
          }
        }
      }

      if (primitive._indexBuffer) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, primitive._indexBuffer._buffer);
      } else {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
      }
    }
  }, {
    key: '_bindMaterialState',
    value: function _bindMaterialState(material) {
      var prevMaterial = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      var gl = this._gl;

      var state = material._state;
      var prevState = prevMaterial ? prevMaterial._state : ~state;

      // Return early if both materials use identical state
      if (state == prevState) {
        return;
      }

      // Any caps bits changed?
      if (material._capsDiff(prevState)) {
        setCap(gl, gl.CULL_FACE, CAP.CULL_FACE, prevState, state);
        setCap(gl, gl.BLEND, CAP.BLEND, prevState, state);
        setCap(gl, gl.DEPTH_TEST, CAP.DEPTH_TEST, prevState, state);
        setCap(gl, gl.STENCIL_TEST, CAP.STENCIL_TEST, prevState, state);

        var colorMaskChange = (state & CAP.COLOR_MASK) - (prevState & CAP.COLOR_MASK);
        if (colorMaskChange) {
          var mask = colorMaskChange > 1;
          this._colorMaskNeedsReset = !mask;
          gl.colorMask(mask, mask, mask, mask);
        }

        var depthMaskChange = (state & CAP.DEPTH_MASK) - (prevState & CAP.DEPTH_MASK);
        if (depthMaskChange) {
          this._depthMaskNeedsReset = !(depthMaskChange > 1);
          gl.depthMask(depthMaskChange > 1);
        }

        var stencilMaskChange = (state & CAP.STENCIL_MASK) - (prevState & CAP.STENCIL_MASK);
        if (stencilMaskChange) {
          gl.stencilMask(stencilMaskChange > 1);
        }
      }

      // Blending enabled and blend func changed?
      if (material._blendDiff(prevState)) {
        gl.blendFunc(material.blendFuncSrc, material.blendFuncDst);
      }

      // Depth testing enabled and depth func changed?
      if (material._depthFuncDiff(prevState)) {
        gl.depthFunc(material.depthFunc);
      }
    }
  }, {
    key: 'gl',
    get: function get() {
      return this._gl;
    }
  }, {
    key: 'globalLightColor',
    set: function set(value) {
      vec3.copy(this._globalLightColor, value);
    },
    get: function get() {
      return vec3.clone(this._globalLightColor);
    }
  }, {
    key: 'globalLightDir',
    set: function set(value) {
      vec3.copy(this._globalLightDir, value);
    },
    get: function get() {
      return vec3.clone(this._globalLightDir);
    }
  }]);

  return Renderer;
}();