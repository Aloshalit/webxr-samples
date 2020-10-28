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

import { WebXRButton } from './util/webxr-button.js';
import { Scene } from './render/scenes/scene.js';
import { Renderer, createWebGLContext } from './render/core/renderer.js';
import { InlineViewerHelper } from './util/inline-viewer-helper.js';

export var WebXRSampleApp = function () {
  function WebXRSampleApp(options) {
    var _this = this;

    _classCallCheck(this, WebXRSampleApp);

    // Application options and defaults
    if (!options) {
      options = {};
    }

    this.options = {
      inline: 'inline' in options ? options.inline : true,
      immersiveMode: options.immersiveMode || 'immersive-vr',
      referenceSpace: options.referenceSpace || 'local',
      defaultInputHandling: 'defaultInputHandling' in options ? options.defaultInputHandling : true
    };

    this.gl = null;
    this.renderer = null;
    this.scene = new Scene();

    this.xrButton = new WebXRButton({
      onRequestSession: function onRequestSession() {
        return _this.onRequestSession();
      },
      onEndSession: function onEndSession(session) {
        _this.onEndSession(session);
      }
    });

    this.immersiveRefSpace = null;
    this.inlineViewerHelper = null;

    this.frameCallback = function (time, frame) {
      var session = frame.session;
      var refSpace = _this.getSessionReferenceSpace(session);

      session.requestAnimationFrame(_this.frameCallback);
      _this.scene.startFrame();

      _this.onXRFrame(time, frame, refSpace);

      _this.scene.endFrame();
    };
  }

  _createClass(WebXRSampleApp, [{
    key: 'getSessionReferenceSpace',
    value: function getSessionReferenceSpace(session) {
      return session.isImmersive ? this.immersiveRefSpace : this.inlineViewerHelper.referenceSpace;
    }
  }, {
    key: 'run',
    value: function run() {
      this.onInitXR();
    }
  }, {
    key: 'onInitXR',
    value: function onInitXR() {
      var _this2 = this;

      if (navigator.xr) {
        navigator.xr.isSessionSupported('immersive-vr').then(function (supported) {
          _this2.xrButton.enabled = supported;
        });

        // Request an inline session if needed.
        if (this.options.inline) {
          navigator.xr.requestSession('inline').then(function (session) {
            _this2.onSessionStarted(session);
          });
        }
      }
    }
  }, {
    key: 'onCreateGL',
    value: function onCreateGL() {
      return createWebGLContext({
        xrCompatible: true
      });
    }
  }, {
    key: 'onInitRenderer',
    value: function onInitRenderer() {
      if (this.gl) return;

      this.gl = this.onCreateGL();

      if (this.gl) {
        var canvas = this.gl.canvas;
        if (canvas instanceof HTMLCanvasElement) {
          var onResize = function onResize() {
            canvas.width = canvas.clientWidth * window.devicePixelRatio;
            canvas.height = canvas.clientHeight * window.devicePixelRatio;
          };

          document.body.append(this.gl.canvas);

          window.addEventListener('resize', onResize);
          onResize();
        }

        this.renderer = new Renderer(this.gl);
        this.scene.setRenderer(this.renderer);
      }
    }
  }, {
    key: 'onRequestSession',
    value: function onRequestSession() {
      var _this3 = this;

      // Called when the button gets clicked. Requests an immersive session.
      return navigator.xr.requestSession(this.options.immersiveMode, {
        requiredFeatures: [this.options.referenceSpace]
      }).then(function (session) {
        _this3.xrButton.setSession(session);
        session.isImmersive = true;
        _this3.onSessionStarted(session);
      });
    }
  }, {
    key: 'onEndSession',
    value: function onEndSession(session) {
      session.end();
    }
  }, {
    key: 'onSessionStarted',
    value: function onSessionStarted(session) {
      var _this4 = this;

      session.addEventListener('end', function (event) {
        _this4.onSessionEnded(event.session);
      });

      if (this.options.defaultInputHandling) {
        session.addEventListener('select', function (event) {
          var refSpace = _this4.getSessionReferenceSpace(event.frame.session);
          _this4.scene.handleSelect(event.inputSource, event.frame, refSpace);
        });
      }

      this.onInitRenderer();

      this.scene.inputRenderer.useProfileControllerMeshes(session);

      session.updateRenderState({
        baseLayer: new XRWebGLLayer(session, this.gl)
      });

      this.onRequestReferenceSpace(session).then(function (refSpace) {
        if (session.isImmersive) {
          _this4.immersiveRefSpace = refSpace;
        } else {
          _this4.inlineViewerHelper = new InlineViewerHelper(_this4.gl.canvas, refSpace);
          if (_this4.options.referenceSpace == 'local-floor' || _this4.options.referenceSpace == 'bounded-floor') {
            _this4.inlineViewerHelper.setHeight(1.6);
          }
        }

        session.requestAnimationFrame(_this4.frameCallback);
      });
    }
  }, {
    key: 'onRequestReferenceSpace',
    value: function onRequestReferenceSpace(session) {
      if (this.options.referenceSpace && session.isImmersive) {
        return session.requestReferenceSpace(this.options.referenceSpace);
      } else {
        return session.requestReferenceSpace('viewer');
      }
    }
  }, {
    key: 'onSessionEnded',
    value: function onSessionEnded(session) {
      if (session == this.xrButton.session) {
        this.xrButton.setSession(null);
      }
    }

    // Override to customize frame handling

  }, {
    key: 'onXRFrame',
    value: function onXRFrame(time, frame, refSpace) {
      var pose = frame.getViewerPose(refSpace);
      if (this.options.defaultInputHandling) {
        this.scene.updateInputSources(frame, refSpace);
      }
      this.scene.drawXRFrame(frame, pose);
    }
  }]);

  return WebXRSampleApp;
}();