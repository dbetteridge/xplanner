import React, { Component } from "react";

import "./App.css";
import category from "./data/category.json";

class Legend extends Component {
  constructor(props) {
    super(props);
    this.state = { legend: null };
  }
  componentDidMount() {
    let phcodes = {
      0: "red",
      1: "darkorange",
      2: "orange",
      3: "yellow",
      4: "green"
    };

    let legend = Object.keys(
      category["Soil Acidity"]
    ).map((categoryval, index) => {
      return [category["Soil Acidity"][index], phcodes[index]];
    });

    this.setState({ legend: legend });
  }
  render() {
    if (!this.state.legend) {
      return null;
    }
    return (
      <div className="Legend">
        {this.state.legend.map((legenditem, index) => {
          return (
            <div className="legend" id={"legend" + index}>
              <p>
                {legenditem[0]}
              </p>
              <div
                className="colourtag"
                style={{ backgroundColor: legenditem[1] }}
              />
            </div>
          );
        })}
      </div>
    );
  }
}

export default Legend;
