'use strict';

const eventPanelInteract = new CustomEvent ('panelinteract' ,{
  bubbles: true,
  detail: { text: "test1" }
})

const e = React.createElement;

class Panel extends React.Component {
  constructor(props) {
    super(props);
    //alert(props.a);
    //test();
  }

  render() {
    return e(
      'div',
      { class: "panel", className: "panel", onClick: e => e.target.dispatchEvent(eventPanelInteract)  },
      'Like'
    );
  }
}

const domContainer = document.querySelector('#panel-container');
ReactDOM.render(React.createElement(Panel), domContainer);
//document.getElementById("panel-container").addEventListener('panelinteract', e => alert(e.detail.text));