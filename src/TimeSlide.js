import React, { Component } from "react";

import "./App.css";

class TimeSlide extends Component {
  constructor(props) {
    super(props);
    this.state = props;
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps);
  }

  render() {
    let date = new Date();
    date.setDate(date.getDate() - 1);
    let minDate = new Date();
    minDate.setMonth(minDate.getMonth() - 6);
    return (
      <div className="timeslide">
        <label htmlFor="dateinput">
          {this.state.date.toString()}
        </label>
        <input
          id="dateinput"
          type="range"
          value={this.state.date.getTime() / 1000}
          min={minDate.getTime() / 1000}
          max={date.getTime() / 1000}
          step={1000000}
          onChange={e => {
            this.props.onChange(e, this.props.map);
          }}
        />
      </div>
    );
  }
}

export default TimeSlide;
