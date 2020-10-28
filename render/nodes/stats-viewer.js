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
Heavily inspired by Mr. Doobs stats.js, this FPS counter is rendered completely
with WebGL, allowing it to be shown in cases where overlaid HTML elements aren't
usable (like WebXR), or if you want the FPS counter to be rendered as part of
your scene.
*/

import { Material } from '../core/material.js';
import { Node } from '../core/node.js';
import { Primitive, PrimitiveAttribute } from '../core/primitive.js';
import { SevenSegmentText } from './seven-segment-text.js';

var SEGMENTS = 30;
var MAX_FPS = 90;

var StatsMaterial = function (_Material) {
  _inherits(StatsMaterial, _Material);

  function StatsMaterial() {
    _classCallCheck(this, StatsMaterial);

    return _possibleConstructorReturn(this, (StatsMaterial.__proto__ || Object.getPrototypeOf(StatsMaterial)).apply(this, arguments));
  }

  _createClass(StatsMaterial, [{
    key: 'materialName',
    get: function get() {
      return 'STATS_VIEWER';
    }
  }, {
    key: 'vertexSource',
    get: function get() {
      return '\n    attribute vec3 POSITION;\n    attribute vec3 COLOR_0;\n    varying vec4 vColor;\n\n    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {\n      vColor = vec4(COLOR_0, 1.0);\n      return proj * view * model * vec4(POSITION, 1.0);\n    }';
    }
  }, {
    key: 'fragmentSource',
    get: function get() {
      return '\n    precision mediump float;\n    varying vec4 vColor;\n\n    vec4 fragment_main() {\n      return vColor;\n    }';
    }
  }]);

  return StatsMaterial;
}(Material);

function segmentToX(i) {
  return 0.9 / SEGMENTS * i - 0.45;
}

function fpsToY(value) {
  return Math.min(value, MAX_FPS) * (0.7 / MAX_FPS) - 0.45;
}

function fpsToRGB(value) {
  return {
    r: Math.max(0.0, Math.min(1.0, 1.0 - value / 60)),
    g: Math.max(0.0, Math.min(1.0, (value - 15) / (MAX_FPS - 15))),
    b: Math.max(0.0, Math.min(1.0, (value - 15) / (MAX_FPS - 15)))
  };
}

var now = window.performance && performance.now ? performance.now.bind(performance) : Date.now;

export var StatsViewer = function (_Node) {
  _inherits(StatsViewer, _Node);

  function StatsViewer() {
    _classCallCheck(this, StatsViewer);

    var _this2 = _possibleConstructorReturn(this, (StatsViewer.__proto__ || Object.getPrototypeOf(StatsViewer)).call(this));

    _this2._performanceMonitoring = false;

    _this2._startTime = now();
    _this2._prevFrameTime = _this2._startTime;
    _this2._prevGraphUpdateTime = _this2._startTime;
    _this2._frames = 0;
    _this2._fpsAverage = 0;
    _this2._fpsMin = 0;
    _this2._fpsStep = _this2._performanceMonitoring ? 1000 : 250;
    _this2._lastSegment = 0;

    _this2._fpsVertexBuffer = null;
    _this2._fpsRenderPrimitive = null;
    _this2._fpsNode = null;

    _this2._sevenSegmentNode = new SevenSegmentText();
    // Hard coded because it doesn't change:
    // Scale by 0.075 in X and Y
    // Translate into upper left corner w/ z = 0.02
    _this2._sevenSegmentNode.matrix = new Float32Array([0.075, 0, 0, 0, 0, 0.075, 0, 0, 0, 0, 1, 0, -0.3625, 0.3625, 0.02, 1]);
    return _this2;
  }

  _createClass(StatsViewer, [{
    key: 'onRendererChanged',
    value: function onRendererChanged(renderer) {
      this.clearNodes();

      var gl = renderer.gl;

      var fpsVerts = [];
      var fpsIndices = [];

      // Graph geometry
      for (var i = 0; i < SEGMENTS; ++i) {
        // Bar top
        fpsVerts.push(segmentToX(i), fpsToY(0), 0.02, 0.0, 1.0, 1.0);
        fpsVerts.push(segmentToX(i + 1), fpsToY(0), 0.02, 0.0, 1.0, 1.0);

        // Bar bottom
        fpsVerts.push(segmentToX(i), fpsToY(0), 0.02, 0.0, 1.0, 1.0);
        fpsVerts.push(segmentToX(i + 1), fpsToY(0), 0.02, 0.0, 1.0, 1.0);

        var idx = i * 4;
        fpsIndices.push(idx, idx + 3, idx + 1, idx + 3, idx, idx + 2);
      }

      function addBGSquare(left, bottom, right, top, z, r, g, b) {
        var idx = fpsVerts.length / 6;

        fpsVerts.push(left, bottom, z, r, g, b);
        fpsVerts.push(right, top, z, r, g, b);
        fpsVerts.push(left, top, z, r, g, b);
        fpsVerts.push(right, bottom, z, r, g, b);

        fpsIndices.push(idx, idx + 1, idx + 2, idx, idx + 3, idx + 1);
      }

      // Panel Background
      addBGSquare(-0.5, -0.5, 0.5, 0.5, 0.0, 0.0, 0.0, 0.125);

      // FPS Background
      addBGSquare(-0.45, -0.45, 0.45, 0.25, 0.01, 0.0, 0.0, 0.4);

      // 30 FPS line
      addBGSquare(-0.45, fpsToY(30), 0.45, fpsToY(32), 0.015, 0.5, 0.0, 0.5);

      // 60 FPS line
      addBGSquare(-0.45, fpsToY(60), 0.45, fpsToY(62), 0.015, 0.2, 0.0, 0.75);

      this._fpsVertexBuffer = renderer.createRenderBuffer(gl.ARRAY_BUFFER, new Float32Array(fpsVerts), gl.DYNAMIC_DRAW);
      var fpsIndexBuffer = renderer.createRenderBuffer(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(fpsIndices));

      var fpsAttribs = [new PrimitiveAttribute('POSITION', this._fpsVertexBuffer, 3, gl.FLOAT, 24, 0), new PrimitiveAttribute('COLOR_0', this._fpsVertexBuffer, 3, gl.FLOAT, 24, 12)];

      var fpsPrimitive = new Primitive(fpsAttribs, fpsIndices.length);
      fpsPrimitive.setIndexBuffer(fpsIndexBuffer);
      fpsPrimitive.setBounds([-0.5, -0.5, 0.0], [0.5, 0.5, 0.015]);

      this._fpsRenderPrimitive = renderer.createRenderPrimitive(fpsPrimitive, new StatsMaterial());
      this._fpsNode = new Node();
      this._fpsNode.addRenderPrimitive(this._fpsRenderPrimitive);

      this.addNode(this._fpsNode);
      this.addNode(this._sevenSegmentNode);
    }
  }, {
    key: 'begin',
    value: function begin() {
      this._startTime = now();
    }
  }, {
    key: 'end',
    value: function end() {
      var time = now();

      var frameFps = 1000 / (time - this._prevFrameTime);
      this._prevFrameTime = time;
      this._fpsMin = this._frames ? Math.min(this._fpsMin, frameFps) : frameFps;
      this._frames++;

      if (time > this._prevGraphUpdateTime + this._fpsStep) {
        var intervalTime = time - this._prevGraphUpdateTime;
        this._fpsAverage = Math.round(1000 / (intervalTime / this._frames));

        // Draw both average and minimum FPS for this period
        // so that dropped frames are more clearly visible.
        this._updateGraph(this._fpsMin, this._fpsAverage);
        if (this._performanceMonitoring) {
          console.log('Average FPS: ' + this._fpsAverage + ' Min FPS: ' + this._fpsMin);
        }

        this._prevGraphUpdateTime = time;
        this._frames = 0;
        this._fpsMin = 0;
      }
    }
  }, {
    key: '_updateGraph',
    value: function _updateGraph(valueLow, valueHigh) {
      var color = fpsToRGB(valueLow);
      // Draw a range from the low to high value. Artificially widen the
      // range a bit to ensure that near-equal values still remain
      // visible - the logic here should match that used by the
      // "60 FPS line" setup below. Hitting 60fps consistently will
      // keep the top half of the 60fps background line visible.
      var y0 = fpsToY(valueLow - 1);
      var y1 = fpsToY(valueHigh + 1);

      // Update the current segment with the new FPS value
      var updateVerts = [segmentToX(this._lastSegment), y1, 0.02, color.r, color.g, color.b, segmentToX(this._lastSegment + 1), y1, 0.02, color.r, color.g, color.b, segmentToX(this._lastSegment), y0, 0.02, color.r, color.g, color.b, segmentToX(this._lastSegment + 1), y0, 0.02, color.r, color.g, color.b];

      // Re-shape the next segment into the green "progress" line
      color.r = 0.2;
      color.g = 1.0;
      color.b = 0.2;

      if (this._lastSegment == SEGMENTS - 1) {
        // If we're updating the last segment we need to do two bufferSubDatas
        // to update the segment and turn the first segment into the progress line.
        this._renderer.updateRenderBuffer(this._fpsVertexBuffer, new Float32Array(updateVerts), this._lastSegment * 24 * 4);
        updateVerts = [segmentToX(0), fpsToY(MAX_FPS), 0.02, color.r, color.g, color.b, segmentToX(.25), fpsToY(MAX_FPS), 0.02, color.r, color.g, color.b, segmentToX(0), fpsToY(0), 0.02, color.r, color.g, color.b, segmentToX(.25), fpsToY(0), 0.02, color.r, color.g, color.b];
        this._renderer.updateRenderBuffer(this._fpsVertexBuffer, new Float32Array(updateVerts), 0);
      } else {
        updateVerts.push(segmentToX(this._lastSegment + 1), fpsToY(MAX_FPS), 0.02, color.r, color.g, color.b, segmentToX(this._lastSegment + 1.25), fpsToY(MAX_FPS), 0.02, color.r, color.g, color.b, segmentToX(this._lastSegment + 1), fpsToY(0), 0.02, color.r, color.g, color.b, segmentToX(this._lastSegment + 1.25), fpsToY(0), 0.02, color.r, color.g, color.b);
        this._renderer.updateRenderBuffer(this._fpsVertexBuffer, new Float32Array(updateVerts), this._lastSegment * 24 * 4);
      }

      this._lastSegment = (this._lastSegment + 1) % SEGMENTS;

      this._sevenSegmentNode.text = this._fpsAverage + ' FP5';
    }
  }, {
    key: 'performanceMonitoring',
    get: function get() {
      return this._performanceMonitoring;
    },
    set: function set(value) {
      this._performanceMonitoring = value;
      this._fpsStep = value ? 1000 : 250;
    }
  }]);

  return StatsViewer;
}(Node);