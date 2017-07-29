import React, { Component } from "react";
import Legend from "./Legend";
import logo from "./logo.svg";
import "./App.css";
import mapboxgl from "mapbox-gl";
import category from "./data/category.json";
import ph from "./data/ph.json";
import suburbs from "./data/suburbs.json";

class App extends Component {
  componentDidMount() {
    mapboxgl.accessToken =
      "pk.eyJ1IjoicmFpbml0ZXNoIiwiYSI6ImNqMW9qNWh3MTAwMmMzOG1qdG0xNm9xMGwifQ.XmpaWbSckfBEAtkGtAmdvw";
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v9",
      center: [121.62831, -27.672817],
      zoom: 7
    });
    map.on("load", () => {
      console.log(ph);
      console.log(category);

      let phcodes = {
        0: "red",
        1: "darkorange",
        2: "orange",
        3: "yellow",
        4: "green",
        null: "rgba(0,0,0,0)"
      };
      suburbs.features.map(suburb => {
        let key = null;
        Object.values(ph["Suburb"]).forEach((subvalue, index) => {
          if (suburb["properties"]["SSC_NAME16"] === subvalue) {
            key = index;
          }
        });

        let phresult = ph["1/2/17"][key];

        let categoryindex = null;
        Object.values(category.Values).forEach((categoryval, index) => {
          let c = JSON.parse(categoryval);

          if (phresult > c[0] && phresult < c[1]) {
            categoryindex = index;
          }
        });

        suburb["properties"]["color"] = phcodes[categoryindex];
      });
      map.addSource("suburbs", {
        type: "geojson",
        data: suburbs
      });

      map.addLayer(
        {
          id: "suburbs-layer",
          source: "suburbs",
          type: "fill",
          paint: {
            "fill-color": {
              type: "identity",
              property: "color"
            },
            "fill-outline-color": "white"
          }
        },
        "landcover_snow"
      );
    });
  }
  render() {
    return (
      <div className="App">
        <div id="map" />
        <Legend />
      </div>
    );
  }
}

export default App;
