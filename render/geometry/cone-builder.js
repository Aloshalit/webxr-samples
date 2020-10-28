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

export var ConeBuilder = function (_GeometryBuilderBase) {
    _inherits(ConeBuilder, _GeometryBuilderBase);

    function ConeBuilder() {
        _classCallCheck(this, ConeBuilder);

        return _possibleConstructorReturn(this, (ConeBuilder.__proto__ || Object.getPrototypeOf(ConeBuilder)).apply(this, arguments));
    }

    _createClass(ConeBuilder, [{
        key: 'pushCone',
        value: function pushCone() {
            var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0.5;

            var stream = this.primitiveStream;
            var coneSegments = 64;

            stream.startGeometry();

            // Cone side vertices
            for (var i = 0; i < coneSegments; ++i) {
                var idx = stream.nextVertexIndex;

                stream.pushTriangle(idx, idx + 1, idx + 2);

                var rad = Math.PI * 2 / coneSegments * i;
                var rad2 = Math.PI * 2 / coneSegments * (i + 1);

                stream.pushVertex(Math.sin(rad) * (size / 2), -size, Math.cos(rad) * (size / 2), i / coneSegments, 0.0, Math.sin(rad), 0.25, Math.cos(rad));

                stream.pushVertex(Math.sin(rad2) * (size / 2), -size, Math.cos(rad2) * (size / 2), i / coneSegments, 0.0, Math.sin(rad2), 0.25, Math.cos(rad2));

                stream.pushVertex(0, size, 0, i / coneSegments, 1.0, Math.sin((rad + rad2) / 2), 0.25, Math.cos((rad + rad2) / 2));
            }

            // Base triangles
            var baseCenterIndex = stream.nextVertexIndex;
            stream.pushVertex(0, -size, 0, 0.5, 0.5, 0, -1, 0);
            for (var _i = 0; _i < coneSegments; ++_i) {
                var _idx = stream.nextVertexIndex;
                stream.pushTriangle(baseCenterIndex, _idx, _idx + 1);
                var _rad = Math.PI * 2 / coneSegments * _i;
                var _rad2 = Math.PI * 2 / coneSegments * (_i + 1);
                stream.pushVertex(Math.sin(_rad2) * (size / 2.0), -size, Math.cos(_rad2) * (size / 2.0), (Math.sin(_rad2) + 1.0) * 0.5, (Math.cos(_rad2) + 1.0) * 0.5, 0, -1, 0);
                stream.pushVertex(Math.sin(_rad) * (size / 2.0), -size, Math.cos(_rad) * (size / 2.0), (Math.sin(_rad) + 1.0) * 0.5, (Math.cos(_rad) + 1.0) * 0.5, 0, -1, 0);
            }

            stream.endGeometry();
        }
    }]);

    return ConeBuilder;
}(GeometryBuilderBase);