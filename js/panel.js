//import React from 'react';
//import ReactDOM from 'react-dom';
//import Carousel from '@brainhubeu/react-carousel';
//import '@brainhubeu/react-carousel/lib/style.css';

'use strict';

const eventPanelInteract = new CustomEvent ('panelinteract' ,{
  bubbles: true,
  detail: { text: "test1" }
})

const e = React.createElement;

class Panel extends React.Component {
  constructor(props) {
    super(props);
    console.log(window);
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
  render() {
    return (
      <div class="panel" onClick={ e => e.target.dispatchEvent(eventPanelInteract) }>
        Like
        <react-carousel.Carousel>
          <img src="media/thumbnails/cave.png" />
          <img src="media/thumbnails/space.png" />
          <img src="media/thumbnails/cube-room.png" />
        </react-carousel.Carousel>
      </div>
    );
  }
}

const domContainer = document.querySelector('#panel-container');
ReactDOM.render(React.createElement(Panel), domContainer);
//document.getElementById("panel-container").addEventListener('panelinteract', e => alert(e.detail.text));