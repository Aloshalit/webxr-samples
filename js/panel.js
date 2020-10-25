'use strict';

const e = React.createElement;

export default class Panel extends React.Component {
  constructor(props) {
    super(props);
    alert(props.a);
  }

  render() {
    return e(
      'div',
      { class: "panel", className: "panel" },
      'Like'
    );
  }
}
