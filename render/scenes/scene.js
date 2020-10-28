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

import { RenderView } from '../core/renderer.js';
import { InputRenderer } from '../nodes/input-renderer.js';
import { StatsViewer } from '../nodes/stats-viewer.js';
import { Node } from '../core/node.js';
import { vec3, quat } from '../math/gl-matrix.js';
import { Ray } from '../math/ray.js';

export var WebXRView = function (_RenderView) {
  _inherits(WebXRView, _RenderView);

  function WebXRView(view, layer) {
    _classCallCheck(this, WebXRView);

    return _possibleConstructorReturn(this, (WebXRView.__proto__ || Object.getPrototypeOf(WebXRView)).call(this, view ? view.projectionMatrix : null, view ? view.transform : null, layer && view ? layer.getViewport(view) : null, view ? view.eye : 'left'));
  }

  return WebXRView;
}(RenderView);

export var Scene = function (_Node) {
  _inherits(Scene, _Node);

  function Scene() {
    _classCallCheck(this, Scene);

    var _this2 = _possibleConstructorReturn(this, (Scene.__proto__ || Object.getPrototypeOf(Scene)).call(this));

    _this2._timestamp = -1;
    _this2._frameDelta = 0;
    _this2._statsStanding = false;
    _this2._stats = null;
    _this2._statsEnabled = false;
    _this2.enableStats(true); // Ensure the stats are added correctly by default.

    _this2._inputRenderer = null;
    _this2._resetInputEndFrame = true;

    _this2._lastTimestamp = 0;

    _this2._hoverFrame = 0;
    _this2._hoveredNodes = [];

    _this2.clear = true;
    return _this2;
  }

  _createClass(Scene, [{
    key: 'setRenderer',
    value: function setRenderer(renderer) {
      this._setRenderer(renderer);
    }
  }, {
    key: 'loseRenderer',
    value: function loseRenderer() {
      if (this._renderer) {
        this._stats = null;
        this._renderer = null;
        this._inputRenderer = null;
      }
    }
  }, {
    key: 'updateInputSources',


    // Helper function that automatically adds the appropriate visual elements for
    // all input sources.
    value: function updateInputSources(frame, refSpace) {
      var newHoveredNodes = [];
      var lastHoverFrame = this._hoverFrame;
      this._hoverFrame++;

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = frame.session.inputSources[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var inputSource = _step.value;

          var targetRayPose = frame.getPose(inputSource.targetRaySpace, refSpace);

          if (!targetRayPose) {
            continue;
          }

          if (inputSource.targetRayMode == 'tracked-pointer') {
            // If we have a pointer matrix and the pointer origin is the users
            // hand (as opposed to their head or the screen) use it to render
            // a ray coming out of the input device to indicate the pointer
            // direction.
            this.inputRenderer.addLaserPointer(targetRayPose.transform);
          }

          // If we have a pointer matrix we can also use it to render a cursor
          // for both handheld and gaze-based input sources.

          // Check and see if the pointer is pointing at any selectable objects.
          var hitResult = this.hitTest(targetRayPose.transform);

          if (hitResult) {
            // Render a cursor at the intersection point.
            this.inputRenderer.addCursor(hitResult.intersection);

            if (hitResult.node._hoverFrameId != lastHoverFrame) {
              hitResult.node.onHoverStart();
            }
            hitResult.node._hoverFrameId = this._hoverFrame;
            newHoveredNodes.push(hitResult.node);
          } else {
            // Statically render the cursor 1 meters down the ray since we didn't
            // hit anything selectable.
            var targetRay = new Ray(targetRayPose.transform.matrix);
            var cursorDistance = 1.0;
            var cursorPos = vec3.fromValues(targetRay.origin[0], //x
            targetRay.origin[1], //y
            targetRay.origin[2] //z
            );
            vec3.add(cursorPos, cursorPos, [targetRay.direction[0] * cursorDistance, targetRay.direction[1] * cursorDistance, targetRay.direction[2] * cursorDistance]);
            // let cursorPos = vec3.fromValues(0, 0, -1.0);
            // vec3.transformMat4(cursorPos, cursorPos, inputPose.targetRay);
            this.inputRenderer.addCursor(cursorPos);
          }

          if (inputSource.gripSpace) {
            var gripPose = frame.getPose(inputSource.gripSpace, refSpace);

            // Any time that we have a grip matrix, we'll render a controller.
            if (gripPose) {
              this.inputRenderer.addController(gripPose.transform.matrix, inputSource.handedness);
            }
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

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this._hoveredNodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var hoverNode = _step2.value;

          if (hoverNode._hoverFrameId != this._hoverFrame) {
            hoverNode.onHoverEnd();
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

      this._hoveredNodes = newHoveredNodes;
    }
  }, {
    key: 'handleSelect',
    value: function handleSelect(inputSource, frame, refSpace) {
      var targetRayPose = frame.getPose(inputSource.targetRaySpace, refSpace);

      if (!targetRayPose) {
        return;
      }

      this.handleSelectPointer(targetRayPose.transform);
    }
  }, {
    key: 'handleSelectPointer',
    value: function handleSelectPointer(rigidTransform) {
      if (rigidTransform) {
        // Check and see if the pointer is pointing at any selectable objects.
        var hitResult = this.hitTest(rigidTransform);

        if (hitResult) {
          // Render a cursor at the intersection point.
          hitResult.node.handleSelect();
        }
      }
    }
  }, {
    key: 'enableStats',
    value: function enableStats(enable) {
      if (enable == this._statsEnabled) {
        return;
      }

      this._statsEnabled = enable;

      if (enable) {
        this._stats = new StatsViewer();
        this._stats.selectable = true;
        this.addNode(this._stats);

        if (this._statsStanding) {
          this._stats.translation = [0, 1.4, -0.75];
        } else {
          this._stats.translation = [0, -0.3, -0.5];
        }
        this._stats.scale = [0.3, 0.3, 0.3];
        quat.fromEuler(this._stats.rotation, -45.0, 0.0, 0.0);
      } else if (!enable) {
        if (this._stats) {
          this.removeNode(this._stats);
          this._stats = null;
        }
      }
    }
  }, {
    key: 'standingStats',
    value: function standingStats(enable) {
      this._statsStanding = enable;
      if (this._stats) {
        if (this._statsStanding) {
          this._stats.translation = [0, 1.4, -0.75];
        } else {
          this._stats.translation = [0, -0.3, -0.5];
        }
        this._stats.scale = [0.3, 0.3, 0.3];
        quat.fromEuler(this._stats.rotation, -45.0, 0.0, 0.0);
      }
    }
  }, {
    key: 'draw',
    value: function draw(projectionMatrix, viewTransform, eye) {
      var view = new RenderView(projectionMatrix, viewTransform);
      if (eye) {
        view.eye = eye;
      }

      this.drawViewArray([view]);
    }

    /** Draws the scene into the base layer of the XRFrame's session */

  }, {
    key: 'drawXRFrame',
    value: function drawXRFrame(xrFrame, pose) {
      if (!this._renderer || !pose) {
        return;
      }

      var gl = this._renderer.gl;
      var session = xrFrame.session;
      // Assumed to be a XRWebGLLayer for now.
      var layer = session.renderState.baseLayer;

      if (!gl) {
        return;
      }

      gl.bindFramebuffer(gl.FRAMEBUFFER, layer.framebuffer);

      if (this.clear) {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      }

      var views = [];
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = pose.views[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var view = _step3.value;

          views.push(new WebXRView(view, layer));
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

      this.drawViewArray(views);
    }
  }, {
    key: 'drawViewArray',
    value: function drawViewArray(views) {
      // Don't draw when we don't have a valid context
      if (!this._renderer) {
        return;
      }

      this._renderer.drawViews(views, this);
    }
  }, {
    key: 'startFrame',
    value: function startFrame() {
      var prevTimestamp = this._timestamp;
      this._timestamp = performance.now();
      if (this._stats) {
        this._stats.begin();
      }

      if (prevTimestamp >= 0) {
        this._frameDelta = this._timestamp - prevTimestamp;
      } else {
        this._frameDelta = 0;
      }

      this._update(this._timestamp, this._frameDelta);

      return this._frameDelta;
    }
  }, {
    key: 'endFrame',
    value: function endFrame() {
      if (this._inputRenderer && this._resetInputEndFrame) {
        this._inputRenderer.reset();
      }

      if (this._stats) {
        this._stats.end();
      }
    }

    // Override to load scene resources on construction or context restore.

  }, {
    key: 'onLoadScene',
    value: function onLoadScene(renderer) {
      return Promise.resolve();
    }
  }, {
    key: 'inputRenderer',
    get: function get() {
      if (!this._inputRenderer) {
        this._inputRenderer = new InputRenderer();
        this.addNode(this._inputRenderer);
      }
      return this._inputRenderer;
    }
  }]);

  return Scene;
}(Node);