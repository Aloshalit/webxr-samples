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

var GL = WebGLRenderingContext; // For enums

export var CAP = {
  // Enable caps
  CULL_FACE: 0x001,
  BLEND: 0x002,
  DEPTH_TEST: 0x004,
  STENCIL_TEST: 0x008,
  COLOR_MASK: 0x010,
  DEPTH_MASK: 0x020,
  STENCIL_MASK: 0x040
};

export var MAT_STATE = {
  CAPS_RANGE: 0x000000FF,
  BLEND_SRC_SHIFT: 8,
  BLEND_SRC_RANGE: 0x00000F00,
  BLEND_DST_SHIFT: 12,
  BLEND_DST_RANGE: 0x0000F000,
  BLEND_FUNC_RANGE: 0x0000FF00,
  DEPTH_FUNC_SHIFT: 16,
  DEPTH_FUNC_RANGE: 0x000F0000
};

export var RENDER_ORDER = {
  // Render opaque objects first.
  OPAQUE: 0,

  // Render the sky after all opaque object to save fill rate.
  SKY: 1,

  // Render transparent objects next so that the opaqe objects show through.
  TRANSPARENT: 2,

  // Finally render purely additive effects like pointer rays so that they
  // can render without depth mask.
  ADDITIVE: 3,

  // Render order will be picked based on the material properties.
  DEFAULT: 4
};

export function stateToBlendFunc(state, mask, shift) {
  var value = (state & mask) >> shift;
  switch (value) {
    case 0:
    case 1:
      return value;
    default:
      return value - 2 + GL.SRC_COLOR;
  }
}

export var MaterialState = function () {
  function MaterialState() {
    _classCallCheck(this, MaterialState);

    this._state = CAP.CULL_FACE | CAP.DEPTH_TEST | CAP.COLOR_MASK | CAP.DEPTH_MASK;

    // Use a fairly commonly desired blend func as the default.
    this.blendFuncSrc = GL.SRC_ALPHA;
    this.blendFuncDst = GL.ONE_MINUS_SRC_ALPHA;

    this.depthFunc = GL.LESS;
  }

  _createClass(MaterialState, [{
    key: "cullFace",
    get: function get() {
      return !!(this._state & CAP.CULL_FACE);
    },
    set: function set(value) {
      if (value) {
        this._state |= CAP.CULL_FACE;
      } else {
        this._state &= ~CAP.CULL_FACE;
      }
    }
  }, {
    key: "blend",
    get: function get() {
      return !!(this._state & CAP.BLEND);
    },
    set: function set(value) {
      if (value) {
        this._state |= CAP.BLEND;
      } else {
        this._state &= ~CAP.BLEND;
      }
    }
  }, {
    key: "depthTest",
    get: function get() {
      return !!(this._state & CAP.DEPTH_TEST);
    },
    set: function set(value) {
      if (value) {
        this._state |= CAP.DEPTH_TEST;
      } else {
        this._state &= ~CAP.DEPTH_TEST;
      }
    }
  }, {
    key: "stencilTest",
    get: function get() {
      return !!(this._state & CAP.STENCIL_TEST);
    },
    set: function set(value) {
      if (value) {
        this._state |= CAP.STENCIL_TEST;
      } else {
        this._state &= ~CAP.STENCIL_TEST;
      }
    }
  }, {
    key: "colorMask",
    get: function get() {
      return !!(this._state & CAP.COLOR_MASK);
    },
    set: function set(value) {
      if (value) {
        this._state |= CAP.COLOR_MASK;
      } else {
        this._state &= ~CAP.COLOR_MASK;
      }
    }
  }, {
    key: "depthMask",
    get: function get() {
      return !!(this._state & CAP.DEPTH_MASK);
    },
    set: function set(value) {
      if (value) {
        this._state |= CAP.DEPTH_MASK;
      } else {
        this._state &= ~CAP.DEPTH_MASK;
      }
    }
  }, {
    key: "depthFunc",
    get: function get() {
      return ((this._state & MAT_STATE.DEPTH_FUNC_RANGE) >> MAT_STATE.DEPTH_FUNC_SHIFT) + GL.NEVER;
    },
    set: function set(value) {
      value = value - GL.NEVER;
      this._state &= ~MAT_STATE.DEPTH_FUNC_RANGE;
      this._state |= value << MAT_STATE.DEPTH_FUNC_SHIFT;
    }
  }, {
    key: "stencilMask",
    get: function get() {
      return !!(this._state & CAP.STENCIL_MASK);
    },
    set: function set(value) {
      if (value) {
        this._state |= CAP.STENCIL_MASK;
      } else {
        this._state &= ~CAP.STENCIL_MASK;
      }
    }
  }, {
    key: "blendFuncSrc",
    get: function get() {
      return stateToBlendFunc(this._state, MAT_STATE.BLEND_SRC_RANGE, MAT_STATE.BLEND_SRC_SHIFT);
    },
    set: function set(value) {
      switch (value) {
        case 0:
        case 1:
          break;
        default:
          value = value - GL.SRC_COLOR + 2;
      }
      this._state &= ~MAT_STATE.BLEND_SRC_RANGE;
      this._state |= value << MAT_STATE.BLEND_SRC_SHIFT;
    }
  }, {
    key: "blendFuncDst",
    get: function get() {
      return stateToBlendFunc(this._state, MAT_STATE.BLEND_DST_RANGE, MAT_STATE.BLEND_DST_SHIFT);
    },
    set: function set(value) {
      switch (value) {
        case 0:
        case 1:
          break;
        default:
          value = value - GL.SRC_COLOR + 2;
      }
      this._state &= ~MAT_STATE.BLEND_DST_RANGE;
      this._state |= value << MAT_STATE.BLEND_DST_SHIFT;
    }
  }]);

  return MaterialState;
}();

var MaterialSampler = function () {
  function MaterialSampler(uniformName) {
    _classCallCheck(this, MaterialSampler);

    this._uniformName = uniformName;
    this._texture = null;
  }

  _createClass(MaterialSampler, [{
    key: "texture",
    get: function get() {
      return this._texture;
    },
    set: function set(value) {
      this._texture = value;
    }
  }]);

  return MaterialSampler;
}();

var MaterialUniform = function () {
  function MaterialUniform(uniformName, defaultValue, length) {
    _classCallCheck(this, MaterialUniform);

    this._uniformName = uniformName;
    this._value = defaultValue;
    this._length = length;
    if (!this._length) {
      if (defaultValue instanceof Array) {
        this._length = defaultValue.length;
      } else {
        this._length = 1;
      }
    }
  }

  _createClass(MaterialUniform, [{
    key: "value",
    get: function get() {
      return this._value;
    },
    set: function set(value) {
      this._value = value;
    }
  }]);

  return MaterialUniform;
}();

export var Material = function () {
  function Material() {
    _classCallCheck(this, Material);

    this.state = new MaterialState();
    this.renderOrder = RENDER_ORDER.DEFAULT;
    this._samplers = [];
    this._uniforms = [];
  }

  _createClass(Material, [{
    key: "defineSampler",
    value: function defineSampler(uniformName) {
      var sampler = new MaterialSampler(uniformName);
      this._samplers.push(sampler);
      return sampler;
    }
  }, {
    key: "defineUniform",
    value: function defineUniform(uniformName) {
      var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var length = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

      var uniform = new MaterialUniform(uniformName, defaultValue, length);
      this._uniforms.push(uniform);
      return uniform;
    }
  }, {
    key: "getProgramDefines",
    value: function getProgramDefines(renderPrimitive) {
      return {};
    }
  }, {
    key: "materialName",
    get: function get() {
      return null;
    }
  }, {
    key: "vertexSource",
    get: function get() {
      return null;
    }
  }, {
    key: "fragmentSource",
    get: function get() {
      return null;
    }
  }]);

  return Material;
}();