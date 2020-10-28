var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Copyright 2019 The Immersive Web Community Group
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
Provides a simple method for tracking which XRReferenceSpace is associated with
which XRSession. Also handles the necessary logic for enabling mouse/touch-based
view rotation for inline sessions if desired.
*/

import { quat } from '../render/math/gl-matrix.js';

var LOOK_SPEED = 0.0025;

export var InlineViewerHelper = function () {
  function InlineViewerHelper(canvas, referenceSpace) {
    var _this = this;

    _classCallCheck(this, InlineViewerHelper);

    this.lookYaw = 0;
    this.lookPitch = 0;
    this.viewerHeight = 0;

    this.canvas = canvas;
    this.baseRefSpace = referenceSpace;
    this.refSpace = referenceSpace;

    this.dirty = false;

    canvas.style.cursor = 'grab';

    canvas.addEventListener('mousemove', function (event) {
      // Only rotate when the left button is pressed
      if (event.buttons & 1) {
        _this.rotateView(event.movementX, event.movementY);
      }
    });

    // Keep track of touch-related state so that users can touch and drag on
    // the canvas to adjust the viewer pose in an inline session.
    var primaryTouch = undefined;
    var prevTouchX = undefined;
    var prevTouchY = undefined;

    canvas.addEventListener("touchstart", function (event) {
      if (primaryTouch == undefined) {
        var touch = event.changedTouches[0];
        primaryTouch = touch.identifier;
        prevTouchX = touch.pageX;
        prevTouchY = touch.pageY;
      }
    });

    canvas.addEventListener("touchend", function (event) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = event.changedTouches[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var touch = _step.value;

          if (primaryTouch == touch.identifier) {
            primaryTouch = undefined;
            _this.rotateView(touch.pageX - prevTouchX, touch.pageY - prevTouchY);
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
    });

    canvas.addEventListener("touchcancel", function (event) {
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = event.changedTouches[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var touch = _step2.value;

          if (primaryTouch == touch.identifier) {
            primaryTouch = undefined;
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
    });

    canvas.addEventListener("touchmove", function (event) {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = event.changedTouches[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var touch = _step3.value;

          if (primaryTouch == touch.identifier) {
            _this.rotateView(touch.pageX - prevTouchX, touch.pageY - prevTouchY);
            prevTouchX = touch.pageX;
            prevTouchY = touch.pageY;
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
    });
  }

  _createClass(InlineViewerHelper, [{
    key: 'setHeight',
    value: function setHeight(value) {
      if (this.viewerHeight != value) {
        this.viewerHeight = value;
      }
      this.dirty = true;
    }
  }, {
    key: 'rotateView',
    value: function rotateView(dx, dy) {
      this.lookYaw += dx * LOOK_SPEED;
      this.lookPitch += dy * LOOK_SPEED;
      if (this.lookPitch < -Math.PI * 0.5) {
        this.lookPitch = -Math.PI * 0.5;
      }
      if (this.lookPitch > Math.PI * 0.5) {
        this.lookPitch = Math.PI * 0.5;
      }
      this.dirty = true;
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.lookYaw = 0;
      this.lookPitch = 0;
      this.refSpace = this.baseRefSpace;
      this.dirty = false;
    }

    // XRReferenceSpace offset is immutable, so return a new reference space
    // that has an updated orientation.

  }, {
    key: 'referenceSpace',
    get: function get() {
      if (this.dirty) {
        // Represent the rotational component of the reference space as a
        // quaternion.
        var invOrient = quat.create();
        quat.rotateX(invOrient, invOrient, -this.lookPitch);
        quat.rotateY(invOrient, invOrient, -this.lookYaw);
        var xform = new XRRigidTransform({}, { x: invOrient[0], y: invOrient[1], z: invOrient[2], w: invOrient[3] });
        this.refSpace = this.baseRefSpace.getOffsetReferenceSpace(xform);
        xform = new XRRigidTransform({ y: -this.viewerHeight });
        this.refSpace = this.refSpace.getOffsetReferenceSpace(xform);
        this.dirty = false;
      }
      return this.refSpace;
    }
  }]);

  return InlineViewerHelper;
}();