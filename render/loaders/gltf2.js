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

import { PbrMaterial } from '../materials/pbr.js';
import { Node } from '../core/node.js';
import { Primitive, PrimitiveAttribute } from '../core/primitive.js';
import { ImageTexture, ColorTexture } from '../core/texture.js';

var GL = WebGLRenderingContext; // For enums

var GLB_MAGIC = 0x46546C67;
var CHUNK_TYPE = {
  JSON: 0x4E4F534A,
  BIN: 0x004E4942
};

function isAbsoluteUri(uri) {
  var absRegEx = new RegExp('^' + window.location.protocol, 'i');
  return !!uri.match(absRegEx);
}

function isDataUri(uri) {
  var dataRegEx = /^data:/;
  return !!uri.match(dataRegEx);
}

function resolveUri(uri, baseUrl) {
  if (isAbsoluteUri(uri) || isDataUri(uri)) {
    return uri;
  }
  return baseUrl + uri;
}

function getComponentCount(type) {
  switch (type) {
    case 'SCALAR':
      return 1;
    case 'VEC2':
      return 2;
    case 'VEC3':
      return 3;
    case 'VEC4':
      return 4;
    default:
      return 0;
  }
}

/**
 * Gltf2SceneLoader
 * Loads glTF 2.0 scenes into a renderable node tree.
 */

export var Gltf2Loader = function () {
  function Gltf2Loader(renderer) {
    _classCallCheck(this, Gltf2Loader);

    this.renderer = renderer;
    this._gl = renderer._gl;
  }

  _createClass(Gltf2Loader, [{
    key: 'loadFromUrl',
    value: function loadFromUrl(url) {
      var _this = this;

      return fetch(url).then(function (response) {
        var i = url.lastIndexOf('/');
        var baseUrl = i !== 0 ? url.substring(0, i + 1) : '';

        if (url.endsWith('.gltf')) {
          return response.json().then(function (json) {
            return _this.loadFromJson(json, baseUrl);
          });
        } else if (url.endsWith('.glb')) {
          return response.arrayBuffer().then(function (arrayBuffer) {
            return _this.loadFromBinary(arrayBuffer, baseUrl);
          });
        } else {
          throw new Error('Unrecognized file extension');
        }
      });
    }
  }, {
    key: 'loadFromBinary',
    value: function loadFromBinary(arrayBuffer, baseUrl) {
      var headerView = new DataView(arrayBuffer, 0, 12);
      var magic = headerView.getUint32(0, true);
      var version = headerView.getUint32(4, true);
      var length = headerView.getUint32(8, true);

      if (magic != GLB_MAGIC) {
        throw new Error('Invalid magic string in binary header.');
      }

      if (version != 2) {
        throw new Error('Incompatible version in binary header.');
      }

      var chunks = {};
      var chunkOffset = 12;
      while (chunkOffset < length) {
        var chunkHeaderView = new DataView(arrayBuffer, chunkOffset, 8);
        var chunkLength = chunkHeaderView.getUint32(0, true);
        var chunkType = chunkHeaderView.getUint32(4, true);
        chunks[chunkType] = arrayBuffer.slice(chunkOffset + 8, chunkOffset + 8 + chunkLength);
        chunkOffset += chunkLength + 8;
      }

      if (!chunks[CHUNK_TYPE.JSON]) {
        throw new Error('File contained no json chunk.');
      }

      var decoder = new TextDecoder('utf-8');
      var jsonString = decoder.decode(chunks[CHUNK_TYPE.JSON]);
      var json = JSON.parse(jsonString);
      return this.loadFromJson(json, baseUrl, chunks[CHUNK_TYPE.BIN]);
    }
  }, {
    key: 'loadFromJson',
    value: function loadFromJson(json, baseUrl, binaryChunk) {
      if (!json.asset) {
        throw new Error('Missing asset description.');
      }

      if (json.asset.minVersion != '2.0' && json.asset.version != '2.0') {
        throw new Error('Incompatible asset version.');
      }

      var buffers = [];
      if (binaryChunk) {
        buffers[0] = new Gltf2Resource({}, baseUrl, binaryChunk);
      } else {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = json.buffers[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var buffer = _step.value;

            buffers.push(new Gltf2Resource(buffer, baseUrl));
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

      var bufferViews = [];
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = json.bufferViews[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var bufferView = _step2.value;

          bufferViews.push(new Gltf2BufferView(bufferView, buffers));
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

      var images = [];
      if (json.images) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = json.images[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var image = _step3.value;

            images.push(new Gltf2Resource(image, baseUrl));
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
      }

      var textures = [];
      if (json.textures) {
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = json.textures[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var texture = _step4.value;

            var _image = images[texture.source];
            var glTexture = _image.texture(bufferViews);
            if (texture.sampler) {
              var sampler = sampler[texture.sampler];
              glTexture.sampler.minFilter = sampler.minFilter;
              glTexture.sampler.magFilter = sampler.magFilter;
              glTexture.sampler.wrapS = sampler.wrapS;
              glTexture.sampler.wrapT = sampler.wrapT;
            }
            textures.push(glTexture);
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

      function getTexture(textureInfo) {
        if (!textureInfo) {
          return null;
        }
        return textures[textureInfo.index];
      }

      var materials = [];
      if (json.materials) {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = json.materials[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var material = _step5.value;

            var glMaterial = new PbrMaterial();
            var pbr = material.pbrMetallicRoughness || {};

            glMaterial.baseColorFactor.value = pbr.baseColorFactor || [1, 1, 1, 1];
            glMaterial.baseColor.texture = getTexture(pbr.baseColorTexture);
            glMaterial.metallicRoughnessFactor.value = [pbr.metallicFactor || 1.0, pbr.roughnessFactor || 1.0];
            glMaterial.metallicRoughness.texture = getTexture(pbr.metallicRoughnessTexture);
            glMaterial.normal.texture = getTexture(material.normalTexture);
            glMaterial.occlusion.texture = getTexture(material.occlusionTexture);
            glMaterial.occlusionStrength.value = material.occlusionTexture && material.occlusionTexture.strength ? material.occlusionTexture.strength : 1.0;
            glMaterial.emissiveFactor.value = material.emissiveFactor || [0, 0, 0];
            glMaterial.emissive.texture = getTexture(material.emissiveTexture);
            if (!glMaterial.emissive.texture && material.emissiveFactor) {
              glMaterial.emissive.texture = new ColorTexture(1.0, 1.0, 1.0, 1.0);
            }

            switch (material.alphaMode) {
              case 'BLEND':
                glMaterial.state.blend = true;
                break;
              case 'MASK':
                // Not really supported.
                glMaterial.state.blend = true;
                break;
              default:
                // Includes 'OPAQUE'
                glMaterial.state.blend = false;
            }

            // glMaterial.alpha_mode = material.alphaMode;
            // glMaterial.alpha_cutoff = material.alphaCutoff;
            glMaterial.state.cullFace = !material.doubleSided;

            materials.push(glMaterial);
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

      var accessors = json.accessors;

      var meshes = [];
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = json.meshes[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var mesh = _step6.value;

          var glMesh = new Gltf2Mesh();
          meshes.push(glMesh);

          var _iteratorNormalCompletion8 = true;
          var _didIteratorError8 = false;
          var _iteratorError8 = undefined;

          try {
            for (var _iterator8 = mesh.primitives[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
              var primitive = _step8.value;

              var _material = null;
              if ('material' in primitive) {
                _material = materials[primitive.material];
              } else {
                // Create a "default" material if the primitive has none.
                _material = new PbrMaterial();
              }

              var attributes = [];
              var elementCount = 0;
              /* let glPrimitive = new Gltf2Primitive(primitive, material);
              glMesh.primitives.push(glPrimitive); */

              var min = null;
              var max = null;

              for (var name in primitive.attributes) {
                var accessor = accessors[primitive.attributes[name]];
                var _bufferView = bufferViews[accessor.bufferView];
                elementCount = accessor.count;

                var glAttribute = new PrimitiveAttribute(name, _bufferView.renderBuffer(this.renderer, GL.ARRAY_BUFFER), getComponentCount(accessor.type), accessor.componentType, _bufferView.byteStride || 0, accessor.byteOffset || 0);
                glAttribute.normalized = accessor.normalized || false;

                if (name == 'POSITION') {
                  min = accessor.min;
                  max = accessor.max;
                }

                attributes.push(glAttribute);
              }

              var glPrimitive = new Primitive(attributes, elementCount, primitive.mode);

              if ('indices' in primitive) {
                var _accessor = accessors[primitive.indices];
                var _bufferView2 = bufferViews[_accessor.bufferView];

                glPrimitive.setIndexBuffer(_bufferView2.renderBuffer(this.renderer, GL.ELEMENT_ARRAY_BUFFER), _accessor.byteOffset || 0, _accessor.componentType);
                glPrimitive.indexType = _accessor.componentType;
                glPrimitive.indexByteOffset = _accessor.byteOffset || 0;
                glPrimitive.elementCount = _accessor.count;
              }

              if (min && max) {
                glPrimitive.setBounds(min, max);
              }

              // After all the attributes have been processed, get a program that is
              // appropriate for both the material and the primitive attributes.
              glMesh.primitives.push(this.renderer.createRenderPrimitive(glPrimitive, _material));
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

      var sceneNode = new Node();
      var scene = json.scenes[json.scene];
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = scene.nodes[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var nodeId = _step7.value;

          var node = json.nodes[nodeId];
          sceneNode.addNode(this.processNodes(node, json.nodes, meshes));
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

      return sceneNode;
    }
  }, {
    key: 'processNodes',
    value: function processNodes(node, nodes, meshes) {
      var glNode = new Node();
      glNode.name = node.name;

      if ('mesh' in node) {
        var mesh = meshes[node.mesh];
        var _iteratorNormalCompletion9 = true;
        var _didIteratorError9 = false;
        var _iteratorError9 = undefined;

        try {
          for (var _iterator9 = mesh.primitives[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
            var primitive = _step9.value;

            glNode.addRenderPrimitive(primitive);
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

      if (node.matrix) {
        glNode.matrix = new Float32Array(node.matrix);
      } else if (node.translation || node.rotation || node.scale) {
        if (node.translation) {
          glNode.translation = new Float32Array(node.translation);
        }

        if (node.rotation) {
          glNode.rotation = new Float32Array(node.rotation);
        }

        if (node.scale) {
          glNode.scale = new Float32Array(node.scale);
        }
      }

      if (node.children) {
        var _iteratorNormalCompletion10 = true;
        var _didIteratorError10 = false;
        var _iteratorError10 = undefined;

        try {
          for (var _iterator10 = node.children[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
            var nodeId = _step10.value;

            var _node = nodes[nodeId];
            glNode.addNode(this.processNodes(_node, nodes, meshes));
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
      }

      return glNode;
    }
  }]);

  return Gltf2Loader;
}();

var Gltf2Mesh = function Gltf2Mesh() {
  _classCallCheck(this, Gltf2Mesh);

  this.primitives = [];
};

var Gltf2BufferView = function () {
  function Gltf2BufferView(json, buffers) {
    _classCallCheck(this, Gltf2BufferView);

    this.buffer = buffers[json.buffer];
    this.byteOffset = json.byteOffset || 0;
    this.byteLength = json.byteLength || null;
    this.byteStride = json.byteStride;

    this._viewPromise = null;
    this._renderBuffer = null;
  }

  _createClass(Gltf2BufferView, [{
    key: 'dataView',
    value: function dataView() {
      var _this2 = this;

      if (!this._viewPromise) {
        this._viewPromise = this.buffer.arrayBuffer().then(function (arrayBuffer) {
          return new DataView(arrayBuffer, _this2.byteOffset, _this2.byteLength);
        });
      }
      return this._viewPromise;
    }
  }, {
    key: 'renderBuffer',
    value: function renderBuffer(renderer, target) {
      if (!this._renderBuffer) {
        this._renderBuffer = renderer.createRenderBuffer(target, this.dataView());
      }
      return this._renderBuffer;
    }
  }]);

  return Gltf2BufferView;
}();

var Gltf2Resource = function () {
  function Gltf2Resource(json, baseUrl, arrayBuffer) {
    _classCallCheck(this, Gltf2Resource);

    this.json = json;
    this.baseUrl = baseUrl;

    this._dataPromise = null;
    this._texture = null;
    if (arrayBuffer) {
      this._dataPromise = Promise.resolve(arrayBuffer);
    }
  }

  _createClass(Gltf2Resource, [{
    key: 'arrayBuffer',
    value: function arrayBuffer() {
      if (!this._dataPromise) {
        if (isDataUri(this.json.uri)) {
          var base64String = this.json.uri.replace('data:application/octet-stream;base64,', '');
          var binaryArray = Uint8Array.from(atob(base64String), function (c) {
            return c.charCodeAt(0);
          });
          this._dataPromise = Promise.resolve(binaryArray.buffer);
          return this._dataPromise;
        }

        this._dataPromise = fetch(resolveUri(this.json.uri, this.baseUrl)).then(function (response) {
          return response.arrayBuffer();
        });
      }
      return this._dataPromise;
    }
  }, {
    key: 'texture',
    value: function texture(bufferViews) {
      var _this3 = this;

      if (!this._texture) {
        var img = new Image();
        this._texture = new ImageTexture(img);

        if (this.json.uri) {
          if (isDataUri(this.json.uri)) {
            img.src = this.json.uri;
          } else {
            img.src = '' + this.baseUrl + this.json.uri;
          }
        } else {
          this._texture.genDataKey();
          var view = bufferViews[this.json.bufferView];
          view.dataView().then(function (dataView) {
            var blob = new Blob([dataView], { type: _this3.json.mimeType });
            img.src = window.URL.createObjectURL(blob);
          });
        }
      }
      return this._texture;
    }
  }]);

  return Gltf2Resource;
}();