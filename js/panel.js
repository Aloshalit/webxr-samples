'use strict';

const e = React.createElement;

class Panel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return e(
      'div',
      { class: "panel", className: "panel" },
      'Like'
    );
  }
}

const domContainer = document.querySelector('#panel-container');
ReactDOM.render(e(Panel), domContainer);