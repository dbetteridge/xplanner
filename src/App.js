import React, { Component } from "react";
import Legend from "./Legend";
import Capture from "./Capture";
import logo from "./logo.svg";
import "./App.css";
import mapboxgl from "mapbox-gl";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pointLocation: null,
      isDragging: null,
      isCursorOverPoint: null,
      pointgeoJson: null
    };
    this.addPoint = this.addPoint.bind(this);
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

    let category;
    fetch(process.env.PUBLIC_URL + "/data/category.json")
      .then(data => {
        return data.json();
      })
      .then(json => {
        category = json;
      });
    let ph;
    fetch(process.env.PUBLIC_URL + "/data/suburbs_500.json")
      .then(data => {
        return data.json();
      })
      .then(json => {
        ph = json;
      });
    let suburbs;
    fetch(process.env.PUBLIC_URL + "/data/suburbs.json")
      .then(data => {
        return data.json();
      })
      .then(json => {
        suburbs = json;
        suburbs.features.map(suburb => {
          let key = null;
          Object.values(ph["Suburb"]).forEach((subvalue, index) => {
            if (
              suburb["properties"]["SSC_NAME16"]
                .toLowerCase()
                .includes(subvalue.toLowerCase())
            ) {
              key = index;
            }
          });

          let phresult = ph["13/3/17"][key];

          let categoryindex = null;
          Object.values(category.Values).forEach((categoryval, index) => {
            let c = JSON.parse(categoryval);

            if (phresult > c[0] && phresult < c[1]) {
              categoryindex = index;
            }
          });

          suburb["properties"]["color"] = phcodes[categoryindex];
        });
        this.addLayers(map, suburbs);
      });

    map.on("load", () => {
      this.setState({
        pointgeoJson: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [116.62831, -31.652817]
              }
            }
          ]
        }
      });
      map.on("click", e => {
        this.addPoint(e.lngLat, map);
      });
    });
  }

  addPoint(point, map) {
    let newLoc = this.state.pointgeoJson;
    newLoc.features[0].geometry.coordinates = [point.lng, point.lat];
    this.setState({ pointgeoJson: newLoc });
    map.addSource("point", {
      type: "geojson",
      data: newLoc
    });

    map.addLayer({
      id: "point",
      type: "circle",
      source: "point",
      paint: {
        "circle-radius": 10,
        "circle-color": "#3887be"
      }
    });
    let canvas = map.getCanvasContainer();
    // When the cursor enters a feature in the point layer, prepare for dragging.
    map.on("mouseenter", "point", () => {
      map.setPaintProperty("point", "circle-color", "#3bb2d0");
      canvas.style.cursor = "move";
      this.setState({ isCursorOverPoint: true });

      map.dragPan.disable();
    });

    map.on("mouseleave", "point", () => {
      map.setPaintProperty("point", "circle-color", "#3887be");
      canvas.style.cursor = "";
      this.setState({ isCursorOverPoint: false });
      map.dragPan.enable();
    });

    map.on("mousedown", e => {
      this.mouseDown(e, map);
    });
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
    this.state.pointgeoJson.features[0].geometry.coordinates = [
      coords.lng,
      coords.lat
    ];
    map.getSource("point").setData(this.state.pointgeoJson);
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
        <Legend />
		<Capture />
      </div>
    );
  }
}

export default App;
