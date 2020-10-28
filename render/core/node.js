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

import { Ray } from '../math/ray.js';
import { mat4, vec3, quat } from '../math/gl-matrix.js';

var DEFAULT_TRANSLATION = new Float32Array([0, 0, 0]);
var DEFAULT_ROTATION = new Float32Array([0, 0, 0, 1]);
var DEFAULT_SCALE = new Float32Array([1, 1, 1]);

var tmpRayMatrix = mat4.create();

export var Node = function () {
  function Node() {
    _classCallCheck(this, Node);

    this.name = null; // Only for debugging
    this.children = [];
    this.parent = null;
    this.visible = true;
    this.selectable = false;

    this._matrix = null;

    this._dirtyTRS = false;
    this._translation = null;
    this._rotation = null;
    this._scale = null;

    this._dirtyWorldMatrix = false;
    this._worldMatrix = null;

    this._activeFrameId = -1;
    this._hoverFrameId = -1;
    this._renderPrimitives = null;
    this._renderer = null;

    this._selectHandler = null;
  }

  _createClass(Node, [{
    key: '_setRenderer',
    value: function _setRenderer(renderer) {
      if (this._renderer == renderer) {
        return;
      }

      if (this._renderer) {
        // Changing the renderer removes any previously attached renderPrimitives
        // from a different renderer.
        this.clearRenderPrimitives();
      }

      this._renderer = renderer;
      if (renderer) {
        this.onRendererChanged(renderer);

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var child = _step.value;

            child._setRenderer(renderer);
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
      }
    }
  }, {
    key: 'onRendererChanged',
    value: function onRendererChanged(renderer) {}
    // Override in other node types to respond to changes in the renderer.


    // Create a clone of this node and all of it's children. Does not duplicate
    // RenderPrimitives, the cloned nodes will be treated as new instances of the
    // geometry.

  }, {
    key: 'clone',
    value: function clone() {
      var _this = this;

      var cloneNode = new Node();
      cloneNode.name = this.name;
      cloneNode.visible = this.visible;
      cloneNode._renderer = this._renderer;

      cloneNode._dirtyTRS = this._dirtyTRS;

      if (this._translation) {
        cloneNode._translation = vec3.create();
        vec3.copy(cloneNode._translation, this._translation);
      }

      if (this._rotation) {
        cloneNode._rotation = quat.create();
        quat.copy(cloneNode._rotation, this._rotation);
      }

      if (this._scale) {
        cloneNode._scale = vec3.create();
        vec3.copy(cloneNode._scale, this._scale);
      }

      // Only copy the matrices if they're not already dirty.
      if (!cloneNode._dirtyTRS && this._matrix) {
        cloneNode._matrix = mat4.create();
        mat4.copy(cloneNode._matrix, this._matrix);
      }

      cloneNode._dirtyWorldMatrix = this._dirtyWorldMatrix;
      if (!cloneNode._dirtyWorldMatrix && this._worldMatrix) {
        cloneNode._worldMatrix = mat4.create();
        mat4.copy(cloneNode._worldMatrix, this._worldMatrix);
      }

      this.waitForComplete().then(function () {
        if (_this._renderPrimitives) {
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = _this._renderPrimitives[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var primitive = _step2.value;

              cloneNode.addRenderPrimitive(primitive);
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
        }

        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = _this.children[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var child = _step3.value;

            cloneNode.addNode(child.clone());
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

      return cloneNode;
    }
  }, {
    key: 'markActive',
    value: function markActive(frameId) {
      if (this.visible && this._renderPrimitives) {
        this._activeFrameId = frameId;
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = this._renderPrimitives[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var primitive = _step4.value;

            primitive.markActive(frameId);
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }
      }

      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = this.children[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var child = _step5.value;

          if (child.visible) {
            child.markActive(frameId);
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }
    }
  }, {
    key: 'addNode',
    value: function addNode(value) {
      if (!value || value.parent == this) {
        return;
      }

      if (value.parent) {
        value.parent.removeNode(value);
      }
      value.parent = this;

      this.children.push(value);

      if (this._renderer) {
        value._setRenderer(this._renderer);
      }
    }
  }, {
    key: 'removeNode',
    value: function removeNode(value) {
      var i = this.children.indexOf(value);
      if (i > -1) {
        this.children.splice(i, 1);
        value.parent = null;
      }
    }
  }, {
    key: 'clearNodes',
    value: function clearNodes() {
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = this.children[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var child = _step6.value;

          child.parent = null;
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      this.children = [];
    }
  }, {
    key: 'setMatrixDirty',
    value: function setMatrixDirty() {
      if (!this._dirtyWorldMatrix) {
        this._dirtyWorldMatrix = true;
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = this.children[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var child = _step7.value;

            child.setMatrixDirty();
          }
        } catch (err) {
          _didIteratorError7 = true;
          _iteratorError7 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion7 && _iterator7.return) {
              _iterator7.return();
            }
          } finally {
            if (_didIteratorError7) {
              throw _iteratorError7;
            }
          }
        }
      }
    }
  }, {
    key: '_updateLocalMatrix',
    value: function _updateLocalMatrix() {
      if (!this._matrix) {
        this._matrix = mat4.create();
      }

      if (this._dirtyTRS) {
        this._dirtyTRS = false;
        mat4.fromRotationTranslationScale(this._matrix, this._rotation || DEFAULT_ROTATION, this._translation || DEFAULT_TRANSLATION, this._scale || DEFAULT_SCALE);
      }

      return this._matrix;
    }
  }, {
    key: 'waitForComplete',
    value: function waitForComplete() {
      var _this2 = this;

      var childPromises = [];
      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = this.children[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var child = _step8.value;

          childPromises.push(child.waitForComplete());
        }
      } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion8 && _iterator8.return) {
            _iterator8.return();
          }
        } finally {
          if (_didIteratorError8) {
            throw _iteratorError8;
          }
        }
      }

      if (this._renderPrimitives) {
        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
          for (var _iterator9 = this._renderPrimitives[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            var primitive = _step9.value;

            childPromises.push(primitive.waitForComplete());
          }
        } catch (err) {
          _didIteratorError9 = true;
          _iteratorError9 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion9 && _iterator9.return) {
              _iterator9.return();
            }
          } finally {
            if (_didIteratorError9) {
              throw _iteratorError9;
            }
          }
        }
      }
      return Promise.all(childPromises).then(function () {
        return _this2;
      });
    }
  }, {
    key: 'addRenderPrimitive',
    value: function addRenderPrimitive(primitive) {
      if (!this._renderPrimitives) {
        this._renderPrimitives = [primitive];
      } else {
        this._renderPrimitives.push(primitive);
      }
      primitive._instances.push(this);
    }
  }, {
    key: 'removeRenderPrimitive',
    value: function removeRenderPrimitive(primitive) {
      if (!this._renderPrimitives) {
        return;
      }

      var index = this._renderPrimitives._instances.indexOf(primitive);
      if (index > -1) {
        this._renderPrimitives._instances.splice(index, 1);

        index = primitive._instances.indexOf(this);
        if (index > -1) {
          primitive._instances.splice(index, 1);
        }

        if (!this._renderPrimitives.length) {
          this._renderPrimitives = null;
        }
      }
    }
  }, {
    key: 'clearRenderPrimitives',
    value: function clearRenderPrimitives() {
      if (this._renderPrimitives) {
        var _iteratorNormalCompletion10 = true;
        var _didIteratorError10 = false;
        var _iteratorError10 = undefined;

        try {
          for (var _iterator10 = this._renderPrimitives[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
            var primitive = _step10.value;

            var index = primitive._instances.indexOf(this);
            if (index > -1) {
              primitive._instances.splice(index, 1);
            }
          }
        } catch (err) {
          _didIteratorError10 = true;
          _iteratorError10 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion10 && _iterator10.return) {
              _iterator10.return();
            }
          } finally {
            if (_didIteratorError10) {
              throw _iteratorError10;
            }
          }
        }

        this._renderPrimitives = null;
      }
    }
  }, {
    key: '_hitTestSelectableNode',
    value: function _hitTestSelectableNode(rigidTransform) {
      if (this._renderPrimitives) {
        var localRay = null;
        var _iteratorNormalCompletion11 = true;
        var _didIteratorError11 = false;
        var _iteratorError11 = undefined;

        try {
          for (var _iterator11 = this._renderPrimitives[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
            var primitive = _step11.value;

            if (primitive._min) {
              if (!localRay) {
                mat4.invert(tmpRayMatrix, this.worldMatrix);
                mat4.multiply(tmpRayMatrix, tmpRayMatrix, rigidTransform.matrix);
                localRay = new Ray(tmpRayMatrix);
              }
              var intersection = localRay.intersectsAABB(primitive._min, primitive._max);
              if (intersection) {
                vec3.transformMat4(intersection, intersection, this.worldMatrix);
                return intersection;
              }
            }
          }
        } catch (err) {
          _didIteratorError11 = true;
          _iteratorError11 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion11 && _iterator11.return) {
              _iterator11.return();
            }
          } finally {
            if (_didIteratorError11) {
              throw _iteratorError11;
            }
          }
        }
      }
      var _iteratorNormalCompletion12 = true;
      var _didIteratorError12 = false;
      var _iteratorError12 = undefined;

      try {
        for (var _iterator12 = this.children[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
          var child = _step12.value;

          var _intersection = child._hitTestSelectableNode(rigidTransform);
          if (_intersection) {
            return _intersection;
          }
        }
      } catch (err) {
        _didIteratorError12 = true;
        _iteratorError12 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion12 && _iterator12.return) {
            _iterator12.return();
          }
        } finally {
          if (_didIteratorError12) {
            throw _iteratorError12;
          }
        }
      }

      return null;
    }
  }, {
    key: 'hitTest',
    value: function hitTest(rigidTransform) {
      if (this.selectable && this.visible) {
        var intersection = this._hitTestSelectableNode(rigidTransform);

        if (intersection) {
          var ray = new Ray(rigidTransform.matrix);
          var origin = vec3.fromValues(ray.origin.x, ray.origin.y, ray.origin.z);
          return {
            node: this,
            intersection: intersection,
            distance: vec3.distance(origin, intersection)
          };
        }
        return null;
      }

      var result = null;
      var _iteratorNormalCompletion13 = true;
      var _didIteratorError13 = false;
      var _iteratorError13 = undefined;

      try {
        for (var _iterator13 = this.children[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
          var child = _step13.value;

          var childResult = child.hitTest(rigidTransform);
          if (childResult) {
            if (!result || result.distance > childResult.distance) {
              result = childResult;
            }
          }
        }
      } catch (err) {
        _didIteratorError13 = true;
        _iteratorError13 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion13 && _iterator13.return) {
            _iterator13.return();
          }
        } finally {
          if (_didIteratorError13) {
            throw _iteratorError13;
          }
        }
      }

      return result;
    }
  }, {
    key: 'onSelect',
    value: function onSelect(value) {
      this._selectHandler = value;
    }
  }, {
    key: 'handleSelect',


    // Called when a selectable node is selected.
    value: function handleSelect() {
      if (this._selectHandler) {
        this._selectHandler();
      }
    }

    // Called when a selectable element is pointed at.

  }, {
    key: 'onHoverStart',
    value: function onHoverStart() {}

    // Called when a selectable element is no longer pointed at.

  }, {
    key: 'onHoverEnd',
    value: function onHoverEnd() {}
  }, {
    key: '_update',
    value: function _update(timestamp, frameDelta) {
      this.onUpdate(timestamp, frameDelta);

      var _iteratorNormalCompletion14 = true;
      var _didIteratorError14 = false;
      var _iteratorError14 = undefined;

      try {
        for (var _iterator14 = this.children[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
          var child = _step14.value;

          child._update(timestamp, frameDelta);
        }
      } catch (err) {
        _didIteratorError14 = true;
        _iteratorError14 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion14 && _iterator14.return) {
            _iterator14.return();
          }
        } finally {
          if (_didIteratorError14) {
            throw _iteratorError14;
          }
        }
      }
    }

    // Called every frame so that the nodes can animate themselves

  }, {
    key: 'onUpdate',
    value: function onUpdate(timestamp, frameDelta) {}
  }, {
    key: 'matrix',
    set: function set(value) {
      if (value) {
        if (!this._matrix) {
          this._matrix = mat4.create();
        }
        mat4.copy(this._matrix, value);
      } else {
        this._matrix = null;
      }
      this.setMatrixDirty();
      this._dirtyTRS = false;
      this._translation = null;
      this._rotation = null;
      this._scale = null;
    },
    get: function get() {
      this.setMatrixDirty();

      return this._updateLocalMatrix();
    }
  }, {
    key: 'worldMatrix',
    get: function get() {
      if (!this._worldMatrix) {
        this._dirtyWorldMatrix = true;
        this._worldMatrix = mat4.create();
      }

      if (this._dirtyWorldMatrix || this._dirtyTRS) {
        if (this.parent) {
          // TODO: Some optimizations that could be done here if the node matrix
          // is an identity matrix.
          mat4.mul(this._worldMatrix, this.parent.worldMatrix, this._updateLocalMatrix());
        } else {
          mat4.copy(this._worldMatrix, this._updateLocalMatrix());
        }
        this._dirtyWorldMatrix = false;
      }

      return this._worldMatrix;
    }

    // TODO: Decompose matrix when fetching these?

  }, {
    key: 'translation',
    set: function set(value) {
      if (value != null) {
        this._dirtyTRS = true;
        this.setMatrixDirty();
      }
      this._translation = value;
    },
    get: function get() {
      this._dirtyTRS = true;
      this.setMatrixDirty();
      if (!this._translation) {
        this._translation = vec3.clone(DEFAULT_TRANSLATION);
      }
      return this._translation;
    }
  }, {
    key: 'rotation',
    set: function set(value) {
      if (value != null) {
        this._dirtyTRS = true;
        this.setMatrixDirty();
      }
      this._rotation = value;
    },
    get: function get() {
      this._dirtyTRS = true;
      this.setMatrixDirty();
      if (!this._rotation) {
        this._rotation = quat.clone(DEFAULT_ROTATION);
      }
      return this._rotation;
    }
  }, {
    key: 'scale',
    set: function set(value) {
      if (value != null) {
        this._dirtyTRS = true;
        this.setMatrixDirty();
      }
      this._scale = value;
    },
    get: function get() {
      this._dirtyTRS = true;
      this.setMatrixDirty();
      if (!this._scale) {
        this._scale = vec3.clone(DEFAULT_SCALE);
      }
      return this._scale;
    }
  }, {
    key: 'renderPrimitives',
    get: function get() {
      return this._renderPrimitives;
    }
  }, {
    key: 'selectHandler',
    get: function get() {
      return this._selectHandler;
    }
  }]);

  return Node;
}();