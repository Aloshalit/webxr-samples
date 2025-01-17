//import React from 'react';
//import ReactDOM from 'react-dom';
//import Carousel from '@brainhubeu/react-carousel';
//import '@brainhubeu/react-carousel/lib/style.css';

'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var eventPanelInteract = new CustomEvent('panelinteract', {
  bubbles: true,
  detail: { text: "test1" }
});

var e = React.createElement;

var Panel = function (_React$Component) {
  _inherits(Panel, _React$Component);

  function Panel(props) {
    _classCallCheck(this, Panel);

    var _this = _possibleConstructorReturn(this, (Panel.__proto__ || Object.getPrototypeOf(Panel)).call(this, props));

    console.log(window);
    return _this;
  }

  // render() {
  //   return e(
  //     'div',
  //     { class: "panel", className: "panel", onClick: e => e.target.dispatchEvent(eventPanelInteract)  },
  //     ['Like',
  //      React.createElement(Carousel, {}, 
  //                                         [ React.createElement('img', { src: 'media/thumbnails/cave.png'}),
  //                                           React.createElement('img', { src: 'media/thumbnails/space.png'})
  //                                         ]
  //                         )
  //     ]    
  //   );
  // }


  _createClass(Panel, [{
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        { 'class': 'panel', onClick: function onClick(e) {
            return e.target.dispatchEvent(eventPanelInteract);
          } },
        'Like',
        React.createElement(
          'react-carousel'.Carousel,
          null,
          React.createElement('img', { src: 'media/thumbnails/cave.png' }),
          React.createElement('img', { src: 'media/thumbnails/space.png' }),
          React.createElement('img', { src: 'media/thumbnails/cube-room.png' })
        )
      );
    }
  }]);

  return Panel;
}(React.Component);

var domContainer = document.querySelector('#panel-container');
ReactDOM.render(React.createElement(Panel), domContainer);
//document.getElementById("panel-container").addEventListener('panelinteract', e => alert(e.detail.text));