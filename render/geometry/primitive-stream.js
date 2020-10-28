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

import { Primitive, PrimitiveAttribute } from '../core/primitive.js';
import { mat3, vec3 } from '../math/gl-matrix.js';

var GL = WebGLRenderingContext; // For enums

var tempVec3 = vec3.create();

export var PrimitiveStream = function () {
  function PrimitiveStream(options) {
    _classCallCheck(this, PrimitiveStream);

    this._vertices = [];
    this._indices = [];

    this._geometryStarted = false;

    this._vertexOffset = 0;
    this._vertexIndex = 0;
    this._highIndex = 0;

    this._flipWinding = false;
    this._invertNormals = false;
    this._transform = null;
    this._normalTransform = null;
    this._min = null;
    this._max = null;
  }

  _createClass(PrimitiveStream, [{
    key: 'startGeometry',
    value: function startGeometry() {
      if (this._geometryStarted) {
        throw new Error('Attempted to start a new geometry before the previous one was ended.');
      }

      this._geometryStarted = true;
      this._vertexIndex = 0;
      this._highIndex = 0;
    }
  }, {
    key: 'endGeometry',
    value: function endGeometry() {
      if (!this._geometryStarted) {
        throw new Error('Attempted to end a geometry before one was started.');
      }

      if (this._highIndex >= this._vertexIndex) {
        throw new Error('Geometry contains indices that are out of bounds.\n                       (Contains an index of ' + this._highIndex + ' when the vertex count is ' + this._vertexIndex + ')');
      }

      this._geometryStarted = false;
      this._vertexOffset += this._vertexIndex;

      // TODO: Anything else need to be done to finish processing here?
    }
  }, {
    key: 'pushVertex',
    value: function pushVertex(x, y, z) {
      var u = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
      var v = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
      var nx = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
      var ny = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 0;
      var nz = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 1;

      if (!this._geometryStarted) {
        throw new Error('Cannot push vertices before calling startGeometry().');
      }

      // Transform the incoming vertex if we have a transformation matrix
      if (this._transform) {
        tempVec3[0] = x;
        tempVec3[1] = y;
        tempVec3[2] = z;
        vec3.transformMat4(tempVec3, tempVec3, this._transform);
        x = tempVec3[0];
        y = tempVec3[1];
        z = tempVec3[2];

        tempVec3[0] = nx;
        tempVec3[1] = ny;
        tempVec3[2] = nz;
        vec3.transformMat3(tempVec3, tempVec3, this._normalTransform);
        nx = tempVec3[0];
        ny = tempVec3[1];
        nz = tempVec3[2];
      }

      if (this._invertNormals) {
        nx *= -1.0;
        ny *= -1.0;
        nz *= -1.0;
      }

      this._vertices.push(x, y, z, u, v, nx, ny, nz);

      if (this._min) {
        this._min[0] = Math.min(this._min[0], x);
        this._min[1] = Math.min(this._min[1], y);
        this._min[2] = Math.min(this._min[2], z);
        this._max[0] = Math.max(this._max[0], x);
        this._max[1] = Math.max(this._max[1], y);
        this._max[2] = Math.max(this._max[2], z);
      } else {
        this._min = vec3.fromValues(x, y, z);
        this._max = vec3.fromValues(x, y, z);
      }

      return this._vertexIndex++;
    }
  }, {
    key: 'pushTriangle',
    value: function pushTriangle(idxA, idxB, idxC) {
      if (!this._geometryStarted) {
        throw new Error('Cannot push triangles before calling startGeometry().');
      }

      this._highIndex = Math.max(this._highIndex, idxA, idxB, idxC);

      idxA += this._vertexOffset;
      idxB += this._vertexOffset;
      idxC += this._vertexOffset;

      if (this._flipWinding) {
        this._indices.push(idxC, idxB, idxA);
      } else {
        this._indices.push(idxA, idxB, idxC);
      }
    }
  }, {
    key: 'clear',
    value: function clear() {
      if (this._geometryStarted) {
        throw new Error('Cannot clear before ending the current geometry.');
      }

      this._vertices = [];
      this._indices = [];
      this._vertexOffset = 0;
      this._min = null;
      this._max = null;
    }
  }, {
    key: 'finishPrimitive',
    value: function finishPrimitive(renderer) {
      if (!this._vertexOffset) {
        throw new Error('Attempted to call finishPrimitive() before creating any geometry.');
      }

      var vertexBuffer = renderer.createRenderBuffer(GL.ARRAY_BUFFER, new Float32Array(this._vertices));
      var indexBuffer = renderer.createRenderBuffer(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this._indices));

      var attribs = [new PrimitiveAttribute('POSITION', vertexBuffer, 3, GL.FLOAT, 32, 0), new PrimitiveAttribute('TEXCOORD_0', vertexBuffer, 2, GL.FLOAT, 32, 12), new PrimitiveAttribute('NORMAL', vertexBuffer, 3, GL.FLOAT, 32, 20)];

      var primitive = new Primitive(attribs, this._indices.length);
      primitive.setIndexBuffer(indexBuffer);
      primitive.setBounds(this._min, this._max);

      return primitive;
    }
  }, {
    key: 'flipWinding',
    set: function set(value) {
      if (this._geometryStarted) {
        throw new Error('Cannot change flipWinding before ending the current geometry.');
      }
      this._flipWinding = value;
    },
    get: function get() {
      this._flipWinding;
    }
  }, {
    key: 'invertNormals',
    set: function set(value) {
      if (this._geometryStarted) {
        throw new Error('Cannot change invertNormals before ending the current geometry.');
      }
      this._invertNormals = value;
    },
    get: function get() {
      this._invertNormals;
    }
  }, {
    key: 'transform',
    set: function set(value) {
      if (this._geometryStarted) {
        throw new Error('Cannot change transform before ending the current geometry.');
      }
      this._transform = value;
      if (this._transform) {
        if (!this._normalTransform) {
          this._normalTransform = mat3.create();
        }
        mat3.fromMat4(this._normalTransform, this._transform);
      }
    },
    get: function get() {
      this._transform;
    }
  }, {
    key: 'nextVertexIndex',
    get: function get() {
      return this._vertexIndex;
    }
  }]);

  return PrimitiveStream;
}();

export var GeometryBuilderBase = function () {
  function GeometryBuilderBase(primitiveStream) {
    _classCallCheck(this, GeometryBuilderBase);

    if (primitiveStream) {
      this._stream = primitiveStream;
    } else {
      this._stream = new PrimitiveStream();
    }
  }

  _createClass(GeometryBuilderBase, [{
    key: 'finishPrimitive',
    value: function finishPrimitive(renderer) {
      return this._stream.finishPrimitive(renderer);
    }
  }, {
    key: 'clear',
    value: function clear() {
      this._stream.clear();
    }
  }, {
    key: 'primitiveStream',
    set: function set(value) {
      this._stream = value;
    },
    get: function get() {
      return this._stream;
    }
  }]);

  return GeometryBuilderBase;
}();