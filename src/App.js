import React, { Component } from "react";
import Legend from "./Legend";
import TimeSlide from "./TimeSlide";
import Capture from "./Capture";
import logo from "./logo.svg";
import "./App.css";
import mapboxgl from "mapbox-gl";
import { point, polygon, inside } from "@turf/turf";

class App extends Component {
  constructor(props) {
    super(props);
    let date = new Date();
    date.setDate(date.getDate() - 1);
    this.state = {
      pointLocation: null,
      isDragging: null,
      isCursorOverPoint: null,
      pointgeoJson: {
        type: "FeatureCollection",
        features: []
      },
      totalPoints: 0,
      date: date
    };
    this.addPoint = this.addPoint.bind(this);
    this.onChange = this.onChange.bind(this);
    this.closeCapture = this.closeCapture.bind(this);
  }
  componentDidMount() {
    mapboxgl.accessToken =
      "pk.eyJ1IjoicmFpbml0ZXNoIiwiYSI6ImNqMW9qNWh3MTAwMmMzOG1qdG0xNm9xMGwifQ.XmpaWbSckfBEAtkGtAmdvw";
    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v9",
      center: [116.62831, -31.652817],
      zoom: 7
    });

    let phcodes = {
      0: "red",
      1: "darkorange",
      2: "orange",
      3: "yellow",
      4: "green",
      null: "rgba(0,0,0,0)"
    };

    this.setState({ map: map, phcodes: phcodes });
    let category;

    fetch(process.env.PUBLIC_URL + "/data/pins.json")
      .then(data => {
        return data.json();
      })
      .then(json => {
        this.setState({
          pointgeoJson: json,
          totalPoints: json.features.length
        });
      });
    fetch(process.env.PUBLIC_URL + "/data/category.json")
      .then(data => {
        return data.json();
      })
      .then(json => {
        category = json;
        this.setState({ category: category });
      });
    let ph;
    fetch(process.env.PUBLIC_URL + "/data/suburbs_500.json")
      .then(data => {
        return data.json();
      })
      .then(json => {
        ph = json;
        this.setState({ ph: ph });
      });
    let suburbs;
    fetch(process.env.PUBLIC_URL + "/data/suburbs.json")
      .then(data => {
        return data.json();
      })
      .then(json => {
        suburbs = json;
        this.setState({ suburbs: suburbs });
        this.colorLayer(map);
      });

    map.on("load", () => {
      map.on("click", e => {
        let geojson = this.state.pointgeoJson;
        geojson.features.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [116.62831, -31.652817]
          }
        });
        this.setState(
          {
            pointgeoJson: geojson
          },
          () => {
            this.addPoint(e.lngLat, map);
          }
        );
      });
    });
  }
  colorLayer(map) {
    let suburbs = this.state.suburbs;
    let bb = map.getBounds();
    let bbpoly = polygon([
      [
        [bb.getSouthWest().lng, bb.getSouthWest().lat],
        [bb.getNorthWest().lng, bb.getNorthWest().lat],
        [bb.getSouthEast().lng, bb.getSouthEast().lat],
        [bb.getNorthEast().lng, bb.getNorthEast().lat],
        [bb.getSouthWest().lng, bb.getSouthWest().lat]
      ]
    ]);
    suburbs.features.map(suburb => {
      let suburbpoint = point(
        suburb.geometry.coordinates[
          suburb.geometry.coordinates.length - 1
        ][0][0]
      );

      if (inside(suburbpoint, bbpoly)) {
        let key = null;
        Object.values(this.state.ph["Suburb"]).forEach((subvalue, index) => {
          if (
            suburb["properties"]["SSC_NAME16"]
              .toLowerCase()
              .includes(subvalue.toLowerCase())
          ) {
            key = index;
          }
        });
        let currentdate =
          this.state.date.getDate() +
          "/" +
          this.state.date.getMonth() +
          "/" +
          this.state.date.getFullYear().toString().substr(-2);

        let phresult = this.state.ph[currentdate][key];

        let categoryindex = null;
        Object.values(
          this.state.category.Values
        ).forEach((categoryval, index) => {
          let c = JSON.parse(categoryval);

          if (phresult > c[0] && phresult < c[1]) {
            categoryindex = index;
          }
        });

        suburb["properties"]["color"] = this.state.phcodes[categoryindex];
      } else {
        suburb["properties"]["color"] = "rgba(0,0,0,0)";
      }
    });
    if (!map.getLayer("suburbs-layer")) {
      this.addLayers(map, suburbs);
    } else {
      map.getSource("suburbs").setData(suburbs);
    }
    return suburbs;
  }
  addPoint(point, map) {
    let newLoc = this.state.pointgeoJson;

    newLoc.features[this.state.totalPoints].geometry.coordinates = [
      point.lng,
      point.lat
    ];
    let { totalPoints } = this.state;
    this.setState({
      pointgeoJson: newLoc,
      totalPoints: this.state.totalPoints + 1,
      capture: <Capture closeCapture={this.closeCapture} />
    });
    totalPoints += 1;

    map.addSource("point" + totalPoints, {
      type: "geojson",
      data: newLoc.features[totalPoints - 1]
    });
    map.addLayer({
      id: "point" + totalPoints,
      type: "circle",
      source: "point" + totalPoints,
      paint: {
        "circle-radius": 10,
        "circle-color": "#3887be"
      }
    });

    let canvas = map.getCanvasContainer();
    // When the cursor enters a feature in the point layer, prepare for dragging.
    map.on("mouseenter", "point" + totalPoints, () => {
      map.setPaintProperty("point" + totalPoints, "circle-color", "#3bb2d0");
      canvas.style.cursor = "move";
      this.setState({ isCursorOverPoint: true });

      map.dragPan.disable();
    });

    map.on("mouseleave", "point" + totalPoints, () => {
      map.setPaintProperty("point" + totalPoints, "circle-color", "#3887be");
      canvas.style.cursor = "";
      this.setState({ isCursorOverPoint: false });
      map.dragPan.enable();
    });

    map.on("mousedown", e => {
      this.mouseDown(e, map);
    });
  }
  onChange(e, map) {
    let date = new Date(e.target.value * 1000);

    this.setState({ date: date });

    if (this.state.timeout) {
      clearTimeout(this.state.timeout);
    }
    let timeout = setTimeout(() => {
      this.colorLayer(map);
    }, 100);
    this.setState({ timeout: timeout });
  }
  closeCapture() {
    this.setState({ capture: null });
  }
  addLayers(map, suburbs) {
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
  }

  removeLayers(map) {
    map.removeSource("suburbs");

    map.removeLayer("suburbs-layer");
  }

  mouseDown(e, map) {
    if (!this.state.isCursorOverPoint) return;

    this.setState({ isDragging: true });
    let canvas = map.getCanvasContainer();
    // Set a cursor indicator
    canvas.style.cursor = "grab";

    // Mouse events
    map.on("mousemove", e => {
      this.onMove(e, map);
    });
    map.once("mouseup", e => {
      this.onUp(e, map);
    });
  }

  onMove(e, map) {
    if (!this.state.isDragging) return;
    var coords = e.lngLat;

    let canvas = map.getCanvasContainer();

    // Set a UI indicator for dragging.
    canvas.style.cursor = "grabbing";

    // Update the Point feature in `geojson` coordinates
    // and call setData to the source layer `point` on it.

    this.state.pointgeoJson.features[
      this.state.totalPoints - 1
    ].geometry.coordinates = [coords.lng, coords.lat];
    this.state.map
      .getSource("point" + this.state.totalPoints)
      .setData(this.state.pointgeoJson.features[this.state.totalPoints - 1]);
  }

  onUp(e, map) {
    if (!this.state.isDragging) return;
    var coords = e.lngLat;
    let canvas = map.getCanvasContainer();
    canvas.style.cursor = "";

    this.setState({
      pointLocation: [coords.lng, coords.lat],
      isDragging: false
    });

    // Unbind mouse events
    map.off("mousemove", e => {
      this.onMove(e, map);
    });
  }

  render() {
    return (
      <div className="App">
        <div id="map" />
        <TimeSlide
          onChange={this.onChange}
          date={this.state.date}
          map={this.state.map}
          key={this.state.date}
        />
        <Legend />
        {this.state.capture}
      </div>
    );
  }
}

export default App;
