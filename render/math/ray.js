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

import { mat3, vec3 } from './gl-matrix.js';

var normalMat = mat3.create();

var RAY_INTERSECTION_OFFSET = 0.02;

export var Ray = function () {
  function Ray() {
    var matrix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

    _classCallCheck(this, Ray);

    this.origin = vec3.create();

    this._dir = vec3.create();
    this._dir[2] = -1.0;

    if (matrix) {
      vec3.transformMat4(this.origin, this.origin, matrix);
      mat3.fromMat4(normalMat, matrix);
      vec3.transformMat3(this._dir, this._dir, normalMat);
    }

    // To force the inverse and sign calculations.
    this.direction = this._dir;
  }

  _createClass(Ray, [{
    key: 'intersectsAABB',


    // Borrowed from:
    // eslint-disable-next-line max-len
    // https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-box-intersection
    value: function intersectsAABB(min, max) {
      var r = this;

      var bounds = [min, max];

      var tmin = (bounds[r.sign[0]][0] - r.origin[0]) * r.inv_dir[0];
      var tmax = (bounds[1 - r.sign[0]][0] - r.origin[0]) * r.inv_dir[0];
      var tymin = (bounds[r.sign[1]][1] - r.origin[1]) * r.inv_dir[1];
      var tymax = (bounds[1 - r.sign[1]][1] - r.origin[1]) * r.inv_dir[1];

      if (tmin > tymax || tymin > tmax) {
        return null;
      }
      if (tymin > tmin) {
        tmin = tymin;
      }
      if (tymax < tmax) {
        tmax = tymax;
      }

      var tzmin = (bounds[r.sign[2]][2] - r.origin[2]) * r.inv_dir[2];
      var tzmax = (bounds[1 - r.sign[2]][2] - r.origin[2]) * r.inv_dir[2];

      if (tmin > tzmax || tzmin > tmax) {
        return null;
      }
      if (tzmin > tmin) {
        tmin = tzmin;
      }
      if (tzmax < tmax) {
        tmax = tzmax;
      }

      var t = -1;
      if (tmin > 0 && tmax > 0) {
        t = Math.min(tmin, tmax);
      } else if (tmin > 0) {
        t = tmin;
      } else if (tmax > 0) {
        t = tmax;
      } else {
        // Intersection is behind the ray origin.
        return null;
      }

      // Push ray intersection point back along the ray a bit so that cursors
      // don't accidentally intersect with the hit surface.
      t -= RAY_INTERSECTION_OFFSET;

      // Return the point where the ray first intersected with the AABB.
      var intersectionPoint = vec3.clone(this._dir);
      vec3.scale(intersectionPoint, intersectionPoint, t);
      vec3.add(intersectionPoint, intersectionPoint, this.origin);
      return intersectionPoint;
    }
  }, {
    key: 'direction',
    get: function get() {
      return this._dir;
    },
    set: function set(value) {
      this._dir = vec3.copy(this._dir, value);
      vec3.normalize(this._dir, this._dir);

      this.inv_dir = vec3.fromValues(1.0 / this._dir[0], 1.0 / this._dir[1], 1.0 / this._dir[2]);

      this.sign = [this.inv_dir[0] < 0 ? 1 : 0, this.inv_dir[1] < 0 ? 1 : 0, this.inv_dir[2] < 0 ? 1 : 0];
    }
  }]);

  return Ray;
}();