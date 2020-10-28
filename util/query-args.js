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

/*
Provides a simple way to get values from the query string if they're present
and use a default value if not. Not strictly a "WebGL" utility, but I use it
frequently enough for debugging that I wanted to include it here.

Example:
For the URL http://example.com/index.html?particleCount=1000

QueryArgs.getInt("particleCount", 100); // URL overrides, returns 1000
QueryArgs.getInt("particleSize", 10); // Not in URL, returns default of 10
*/

var urlArgs = null;
window.onhashchange = function () {
  // Force re-parsing on next access
  urlArgs = null;
};

function ensureArgsCached() {
  if (!urlArgs) {
    urlArgs = {};
    var query = window.location.search.substring(1) || window.location.hash.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      urlArgs[pair[0].toLowerCase()] = decodeURIComponent(pair[1]);
    }
  }
}

export var QueryArgs = function () {
  function QueryArgs() {
    _classCallCheck(this, QueryArgs);
  }

  _createClass(QueryArgs, null, [{
    key: 'getString',
    value: function getString(name, defaultValue) {
      ensureArgsCached();
      var lcaseName = name.toLowerCase();
      if (lcaseName in urlArgs) {
        return urlArgs[lcaseName];
      }
      return defaultValue;
    }
  }, {
    key: 'getInt',
    value: function getInt(name, defaultValue) {
      ensureArgsCached();
      var lcaseName = name.toLowerCase();
      if (lcaseName in urlArgs) {
        return parseInt(urlArgs[lcaseName], 10);
      }
      return defaultValue;
    }
  }, {
    key: 'getFloat',
    value: function getFloat(name, defaultValue) {
      ensureArgsCached();
      var lcaseName = name.toLowerCase();
      if (lcaseName in urlArgs) {
        return parseFloat(urlArgs[lcaseName]);
      }
      return defaultValue;
    }
  }, {
    key: 'getBool',
    value: function getBool(name, defaultValue) {
      ensureArgsCached();
      var lcaseName = name.toLowerCase();
      if (lcaseName in urlArgs) {
        return parseInt(urlArgs[lcaseName], 10) != 0;
      }
      return defaultValue;
    }
  }]);

  return QueryArgs;
}();