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

import { Material } from '../core/material.js';
import { Node } from '../core/node.js';
import { UrlTexture } from '../core/texture.js';
import { BoxBuilder } from '../geometry/box-builder.js';
import { mat4 } from '../math/gl-matrix.js';

var CubeSeaMaterial = function (_Material) {
  _inherits(CubeSeaMaterial, _Material);

  function CubeSeaMaterial() {
    var heavy = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    _classCallCheck(this, CubeSeaMaterial);

    var _this = _possibleConstructorReturn(this, (CubeSeaMaterial.__proto__ || Object.getPrototypeOf(CubeSeaMaterial)).call(this));

    _this.heavy = heavy;

    _this.baseColor = _this.defineSampler('baseColor');
    return _this;
  }

  _createClass(CubeSeaMaterial, [{
    key: 'materialName',
    get: function get() {
      return 'CUBE_SEA';
    }
  }, {
    key: 'vertexSource',
    get: function get() {
      return '\n    attribute vec3 POSITION;\n    attribute vec2 TEXCOORD_0;\n    attribute vec3 NORMAL;\n\n    varying vec2 vTexCoord;\n    varying vec3 vLight;\n\n    const vec3 lightDir = vec3(0.75, 0.5, 1.0);\n    const vec3 ambientColor = vec3(0.5, 0.5, 0.5);\n    const vec3 lightColor = vec3(0.75, 0.75, 0.75);\n\n    vec4 vertex_main(mat4 proj, mat4 view, mat4 model) {\n      vec3 normalRotated = vec3(model * vec4(NORMAL, 0.0));\n      float lightFactor = max(dot(normalize(lightDir), normalRotated), 0.0);\n      vLight = ambientColor + (lightColor * lightFactor);\n      vTexCoord = TEXCOORD_0;\n      return proj * view * model * vec4(POSITION, 1.0);\n    }';
    }
  }, {
    key: 'fragmentSource',
    get: function get() {
      if (!this.heavy) {
        return '\n      precision mediump float;\n      uniform sampler2D baseColor;\n      varying vec2 vTexCoord;\n      varying vec3 vLight;\n\n      vec4 fragment_main() {\n        return vec4(vLight, 1.0) * texture2D(baseColor, vTexCoord);\n      }';
      } else {
        // Used when we want to stress the GPU a bit more.
        // Stolen with love from https://www.clicktorelease.com/code/codevember-2016/4/
        return '\n      precision mediump float;\n\n      uniform sampler2D diffuse;\n      varying vec2 vTexCoord;\n      varying vec3 vLight;\n\n      vec2 dimensions = vec2(64, 64);\n      float seed = 0.42;\n\n      vec2 hash( vec2 p ) {\n        p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));\n        return fract(sin(p)*18.5453);\n      }\n\n      vec3 hash3( vec2 p ) {\n          vec3 q = vec3( dot(p,vec2(127.1,311.7)),\n                 dot(p,vec2(269.5,183.3)),\n                 dot(p,vec2(419.2,371.9)) );\n        return fract(sin(q)*43758.5453);\n      }\n\n      float iqnoise( in vec2 x, float u, float v ) {\n        vec2 p = floor(x);\n        vec2 f = fract(x);\n        float k = 1.0+63.0*pow(1.0-v,4.0);\n        float va = 0.0;\n        float wt = 0.0;\n        for( int j=-2; j<=2; j++ )\n          for( int i=-2; i<=2; i++ ) {\n            vec2 g = vec2( float(i),float(j) );\n            vec3 o = hash3( p + g )*vec3(u,u,1.0);\n            vec2 r = g - f + o.xy;\n            float d = dot(r,r);\n            float ww = pow( 1.0-smoothstep(0.0,1.414,sqrt(d)), k );\n            va += o.z*ww;\n            wt += ww;\n          }\n        return va/wt;\n      }\n\n      // return distance, and cell id\n      vec2 voronoi( in vec2 x ) {\n        vec2 n = floor( x );\n        vec2 f = fract( x );\n        vec3 m = vec3( 8.0 );\n        for( int j=-1; j<=1; j++ )\n          for( int i=-1; i<=1; i++ ) {\n            vec2  g = vec2( float(i), float(j) );\n            vec2  o = hash( n + g );\n            vec2  r = g - f + (0.5+0.5*sin(seed+6.2831*o));\n            float d = dot( r, r );\n            if( d<m.x )\n              m = vec3( d, o );\n          }\n        return vec2( sqrt(m.x), m.y+m.z );\n      }\n\n      vec4 fragment_main() {\n        vec2 uv = ( vTexCoord );\n        uv *= vec2( 10., 10. );\n        uv += seed;\n        vec2 p = 0.5 - 0.5*sin( 0.*vec2(1.01,1.71) );\n\n        vec2 c = voronoi( uv );\n        vec3 col = vec3( c.y / 2. );\n\n        float f = iqnoise( 1. * uv + c.y, p.x, p.y );\n        col *= 1.0 + .25 * vec3( f );\n\n        return vec4(vLight, 1.0) * texture2D(diffuse, vTexCoord) * vec4( col, 1. );\n      }';
      }
    }
  }]);

  return CubeSeaMaterial;
}(Material);

export var CubeSeaNode = function (_Node) {
  _inherits(CubeSeaNode, _Node);

  function CubeSeaNode() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, CubeSeaNode);

    // Test variables
    // If true, use a very heavyweight shader to stress the GPU.
    var _this2 = _possibleConstructorReturn(this, (CubeSeaNode.__proto__ || Object.getPrototypeOf(CubeSeaNode)).call(this));

    _this2.heavyGpu = !!options.heavyGpu;

    // Number and size of the static cubes. Warning, large values
    // don't render right due to overflow of the int16 indices.
    _this2.cubeCount = options.cubeCount || (_this2.heavyGpu ? 12 : 10);
    _this2.cubeScale = options.cubeScale || 1.0;

    // Draw only half the world cubes. Helps test variable render cost
    // when combined with heavyGpu.
    _this2.halfOnly = !!options.halfOnly;

    // Automatically spin the world cubes. Intended for automated testing,
    // not recommended for viewing in a headset.
    _this2.autoRotate = !!options.autoRotate;

    _this2._texture = new UrlTexture(options.imageUrl || 'media/textures/cube-sea.png');

    _this2._material = new CubeSeaMaterial(_this2.heavyGpu);
    _this2._material.baseColor.texture = _this2._texture;

    _this2._renderPrimitive = null;
    return _this2;
  }

  _createClass(CubeSeaNode, [{
    key: 'onRendererChanged',
    value: function onRendererChanged(renderer) {
      this._renderPrimitive = null;

      var boxBuilder = new BoxBuilder();

      // Build the spinning "hero" cubes
      boxBuilder.pushCube([0, 0.25, -0.8], 0.1);
      boxBuilder.pushCube([0.8, 0.25, 0], 0.1);
      boxBuilder.pushCube([0, 0.25, 0.8], 0.1);
      boxBuilder.pushCube([-0.8, 0.25, 0], 0.1);

      var heroPrimitive = boxBuilder.finishPrimitive(renderer);

      this.heroNode = renderer.createMesh(heroPrimitive, this._material);

      this.rebuildCubes(boxBuilder);

      this.cubeSeaNode = new Node();
      this.cubeSeaNode.addRenderPrimitive(this._renderPrimitive);

      this.addNode(this.cubeSeaNode);
      this.addNode(this.heroNode);

      return this.waitForComplete();
    }
  }, {
    key: 'rebuildCubes',
    value: function rebuildCubes(boxBuilder) {
      if (!this._renderer) {
        return;
      }

      if (!boxBuilder) {
        boxBuilder = new BoxBuilder();
      } else {
        boxBuilder.clear();
      }

      var size = 0.4 * this.cubeScale;

      // Build the cube sea
      var halfGrid = this.cubeCount * 0.5;
      for (var x = 0; x < this.cubeCount; ++x) {
        for (var y = 0; y < this.cubeCount; ++y) {
          for (var z = 0; z < this.cubeCount; ++z) {
            var pos = [x - halfGrid, y - halfGrid, z - halfGrid];
            // Only draw cubes on one side. Useful for testing variable render
            // cost that depends on view direction.
            if (this.halfOnly && pos[0] < 0) {
              continue;
            }

            // Don't place a cube in the center of the grid.
            if (pos[0] == 0 && pos[1] == 0 && pos[2] == 0) {
              continue;
            }

            boxBuilder.pushCube(pos, size);
          }
        }
      }

      if (this.cubeCount > 12) {
        // Each cube has 6 sides with 2 triangles and 3 indices per triangle, so
        // the total number of indices needed is cubeCount^3 * 36. This exceeds
        // the short index range past 12 cubes.
        boxBuilder.indexType = 5125; // gl.UNSIGNED_INT
      }
      var cubeSeaPrimitive = boxBuilder.finishPrimitive(this._renderer);

      if (!this._renderPrimitive) {
        this._renderPrimitive = this._renderer.createRenderPrimitive(cubeSeaPrimitive, this._material);
      } else {
        this._renderPrimitive.setPrimitive(cubeSeaPrimitive);
      }
    }
  }, {
    key: 'onUpdate',
    value: function onUpdate(timestamp, frameDelta) {
      if (this.autoRotate) {
        mat4.fromRotation(this.cubeSeaNode.matrix, timestamp / 500, [0, -1, 0]);
      }
      mat4.fromRotation(this.heroNode.matrix, timestamp / 2000, [0, 1, 0]);
    }
  }]);

  return CubeSeaNode;
}(Node);