import React from "react";
import PropTypes from "../../proptypes";

var GroupEventTags = React.createClass({
  propTypes: {
    group: PropTypes.Group.isRequired,
    event: PropTypes.Event.isRequired
  },

  render() {
    var children = [];
    var value;
    for (var key in this.props.event.tags) {
      value = this.props.event.tags[key];
      children.push(
        <li key={key}>
          {key} = {value}
        </li>
      );
    }

    return (
      <div id="tags" className="box">
        <div className="box-header">
          <h3>Tags</h3>
        </div>
        <div className="box-content with-padding">
          <ul className="mini-tag-list">
            {children}
          </ul>
        </div>
      </div>
    );
  }
});

export default GroupEventTags;


