import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import mapboxgl from "mapbox-gl";

class App extends Component {
  componentDidMount() {
    mapboxgl.accessToken =
      "pk.eyJ1IjoicmFpbml0ZXNoIiwiYSI6ImNqMW9qNWh3MTAwMmMzOG1qdG0xNm9xMGwifQ.XmpaWbSckfBEAtkGtAmdvw";
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v9",
      center: [118, -25],
      zoom: 5.3
    });
    map.on("load", () => {
      map.addSource("suburbs", {
        type: "geojson",
        data: "suburbs.geojson"
      });

      map.addLayer({
        id: "suburbs-layer",
        source: "suburbs",
        type: "fill",
        paint: {
          "fill-color": "green",
          "fill-outline-color": "white"
        }
      });
    });
  }
  render() {
    return (
      <div className="App">
        <div id="map" />
      </div>
    );
  }
}

export default App;
