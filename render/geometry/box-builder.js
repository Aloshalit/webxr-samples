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

import { GeometryBuilderBase } from './primitive-stream.js';

export var BoxBuilder = function (_GeometryBuilderBase) {
  _inherits(BoxBuilder, _GeometryBuilderBase);

  function BoxBuilder() {
    _classCallCheck(this, BoxBuilder);

    return _possibleConstructorReturn(this, (BoxBuilder.__proto__ || Object.getPrototypeOf(BoxBuilder)).apply(this, arguments));
  }

  _createClass(BoxBuilder, [{
    key: 'pushBox',
    value: function pushBox(min, max) {
      var stream = this.primitiveStream;

      var w = max[0] - min[0];
      var h = max[1] - min[1];
      var d = max[2] - min[2];

      var wh = w * 0.5;
      var hh = h * 0.5;
      var dh = d * 0.5;

      var cx = min[0] + wh;
      var cy = min[1] + hh;
      var cz = min[2] + dh;

      stream.startGeometry();

      // Bottom
      var idx = stream.nextVertexIndex;
      stream.pushTriangle(idx, idx + 1, idx + 2);
      stream.pushTriangle(idx, idx + 2, idx + 3);

      //                 X       Y       Z      U    V    NX    NY   NZ
      stream.pushVertex(-wh + cx, -hh + cy, -dh + cz, 0.0, 1.0, 0.0, -1.0, 0.0);
      stream.pushVertex(+wh + cx, -hh + cy, -dh + cz, 1.0, 1.0, 0.0, -1.0, 0.0);
      stream.pushVertex(+wh + cx, -hh + cy, +dh + cz, 1.0, 0.0, 0.0, -1.0, 0.0);
      stream.pushVertex(-wh + cx, -hh + cy, +dh + cz, 0.0, 0.0, 0.0, -1.0, 0.0);

      // Top
      idx = stream.nextVertexIndex;
      stream.pushTriangle(idx, idx + 2, idx + 1);
      stream.pushTriangle(idx, idx + 3, idx + 2);

      stream.pushVertex(-wh + cx, +hh + cy, -dh + cz, 0.0, 0.0, 0.0, 1.0, 0.0);
      stream.pushVertex(+wh + cx, +hh + cy, -dh + cz, 1.0, 0.0, 0.0, 1.0, 0.0);
      stream.pushVertex(+wh + cx, +hh + cy, +dh + cz, 1.0, 1.0, 0.0, 1.0, 0.0);
      stream.pushVertex(-wh + cx, +hh + cy, +dh + cz, 0.0, 1.0, 0.0, 1.0, 0.0);

      // Left
      idx = stream.nextVertexIndex;
      stream.pushTriangle(idx, idx + 2, idx + 1);
      stream.pushTriangle(idx, idx + 3, idx + 2);

      stream.pushVertex(-wh + cx, -hh + cy, -dh + cz, 0.0, 1.0, -1.0, 0.0, 0.0);
      stream.pushVertex(-wh + cx, +hh + cy, -dh + cz, 0.0, 0.0, -1.0, 0.0, 0.0);
      stream.pushVertex(-wh + cx, +hh + cy, +dh + cz, 1.0, 0.0, -1.0, 0.0, 0.0);
      stream.pushVertex(-wh + cx, -hh + cy, +dh + cz, 1.0, 1.0, -1.0, 0.0, 0.0);

      // Right
      idx = stream.nextVertexIndex;
      stream.pushTriangle(idx, idx + 1, idx + 2);
      stream.pushTriangle(idx, idx + 2, idx + 3);

      stream.pushVertex(+wh + cx, -hh + cy, -dh + cz, 1.0, 1.0, 1.0, 0.0, 0.0);
      stream.pushVertex(+wh + cx, +hh + cy, -dh + cz, 1.0, 0.0, 1.0, 0.0, 0.0);
      stream.pushVertex(+wh + cx, +hh + cy, +dh + cz, 0.0, 0.0, 1.0, 0.0, 0.0);
      stream.pushVertex(+wh + cx, -hh + cy, +dh + cz, 0.0, 1.0, 1.0, 0.0, 0.0);

      // Back
      idx = stream.nextVertexIndex;
      stream.pushTriangle(idx, idx + 2, idx + 1);
      stream.pushTriangle(idx, idx + 3, idx + 2);

      stream.pushVertex(-wh + cx, -hh + cy, -dh + cz, 1.0, 1.0, 0.0, 0.0, -1.0);
      stream.pushVertex(+wh + cx, -hh + cy, -dh + cz, 0.0, 1.0, 0.0, 0.0, -1.0);
      stream.pushVertex(+wh + cx, +hh + cy, -dh + cz, 0.0, 0.0, 0.0, 0.0, -1.0);
      stream.pushVertex(-wh + cx, +hh + cy, -dh + cz, 1.0, 0.0, 0.0, 0.0, -1.0);

      // Front
      idx = stream.nextVertexIndex;
      stream.pushTriangle(idx, idx + 1, idx + 2);
      stream.pushTriangle(idx, idx + 2, idx + 3);

      stream.pushVertex(-wh + cx, -hh + cy, +dh + cz, 0.0, 1.0, 0.0, 0.0, 1.0);
      stream.pushVertex(+wh + cx, -hh + cy, +dh + cz, 1.0, 1.0, 0.0, 0.0, 1.0);
      stream.pushVertex(+wh + cx, +hh + cy, +dh + cz, 1.0, 0.0, 0.0, 0.0, 1.0);
      stream.pushVertex(-wh + cx, +hh + cy, +dh + cz, 0.0, 0.0, 0.0, 0.0, 1.0);

      stream.endGeometry();
    }
  }, {
    key: 'pushCube',
    value: function pushCube() {
      var center = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [0, 0, 0];
      var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1.0;

      var hs = size * 0.5;
      this.pushBox([center[0] - hs, center[1] - hs, center[2] - hs], [center[0] + hs, center[1] + hs, center[2] + hs]);
    }
  }]);

  return BoxBuilder;
}(GeometryBuilderBase);