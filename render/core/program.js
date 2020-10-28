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

export var Program = function () {
  function Program(gl, vertSrc, fragSrc, attribMap, defines) {
    _classCallCheck(this, Program);

    this._gl = gl;
    this.program = gl.createProgram();
    this.attrib = null;
    this.uniform = null;
    this.defines = {};

    this._firstUse = true;
    this._nextUseCallbacks = [];

    var definesString = '';
    if (defines) {
      for (var define in defines) {
        this.defines[define] = defines[define];
        definesString += '#define ' + define + ' ' + defines[define] + '\n';
      }
    }

    this._vertShader = gl.createShader(gl.VERTEX_SHADER);
    gl.attachShader(this.program, this._vertShader);
    gl.shaderSource(this._vertShader, definesString + vertSrc);
    gl.compileShader(this._vertShader);

    this._fragShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.attachShader(this.program, this._fragShader);
    gl.shaderSource(this._fragShader, definesString + fragSrc);
    gl.compileShader(this._fragShader);

    if (attribMap) {
      this.attrib = {};
      for (var attribName in attribMap) {
        gl.bindAttribLocation(this.program, attribMap[attribName], attribName);
        this.attrib[attribName] = attribMap[attribName];
      }
    }

    gl.linkProgram(this.program);
  }

  _createClass(Program, [{
    key: 'onNextUse',
    value: function onNextUse(callback) {
      this._nextUseCallbacks.push(callback);
    }
  }, {
    key: 'use',
    value: function use() {
      var gl = this._gl;

      // If this is the first time the program has been used do all the error checking and
      // attrib/uniform querying needed.
      if (this._firstUse) {
        this._firstUse = false;
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
          if (!gl.getShaderParameter(this._vertShader, gl.COMPILE_STATUS)) {
            console.error('Vertex shader compile error: ' + gl.getShaderInfoLog(this._vertShader));
          } else if (!gl.getShaderParameter(this._fragShader, gl.COMPILE_STATUS)) {
            console.error('Fragment shader compile error: ' + gl.getShaderInfoLog(this._fragShader));
          } else {
            console.error('Program link error: ' + gl.getProgramInfoLog(this.program));
          }
          gl.deleteProgram(this.program);
          this.program = null;
        } else {
          if (!this.attrib) {
            this.attrib = {};
            var attribCount = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
            for (var i = 0; i < attribCount; i++) {
              var attribInfo = gl.getActiveAttrib(this.program, i);
              this.attrib[attribInfo.name] = gl.getAttribLocation(this.program, attribInfo.name);
            }
          }

          this.uniform = {};
          var uniformCount = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
          var uniformName = '';
          for (var _i = 0; _i < uniformCount; _i++) {
            var uniformInfo = gl.getActiveUniform(this.program, _i);
            uniformName = uniformInfo.name.replace('[0]', '');
            this.uniform[uniformName] = gl.getUniformLocation(this.program, uniformName);
          }
        }
        gl.deleteShader(this._vertShader);
        gl.deleteShader(this._fragShader);
      }

      gl.useProgram(this.program);

      if (this._nextUseCallbacks.length) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this._nextUseCallbacks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var callback = _step.value;

            callback(this);
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

        this._nextUseCallbacks = [];
      }
    }
  }]);

  return Program;
}();