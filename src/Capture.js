import React, { Component } from "react";

import "./App.css";


class Capture extends Component {
  constructor(props) {
    super(props);
    this.state = { pin: null };
  }
  componentDidMount() {
    
    this.setState({ pin: null });
  }
  
  
  render() {
    return (
      React.createElement('form', {className: 'Capture'},
      React.createElement('h2', {}, "Soil Characteristics:"),
      React.createElement('label', {value: "label"}),
        React.createElement('input', {
          className:"capture-field",
          type: 'text',
          placeholder: 'pH',
        }),
        React.createElement('input', {
          className:"capture-field",
          type: 'text',
          placeholder: 'Soil Depth (cm)',
        }),        
        React.createElement('input', {
          className: 'capture-field',
          type: 'text',
          placeholder: 'Clay (%)',
        }),
        React.createElement('input', {
          className: 'capture-field',
          type: 'text',
          placeholder: 'Silt (%)',
        }),        
        React.createElement('input', {
          className: 'capture-field',
          type: 'text',          
          placeholder: 'Sand (%)',
        }),
        React.createElement('h2', {}, "Treatment:"),
        React.createElement('input', {
          className: 'capture-field',
          type: 'text',          
          placeholder: 'Lime (NV)',
        }),
        React.createElement('input', {
          className: 'capture-field',
          type: 'text',          
          placeholder: 'Lime Material',          
        }),
        React.createElement('input', {
          className: 'capture-field',
          type: 'text',          
          placeholder: 'Area Coverage (Ha)',          
        }),    
        React.createElement('input', {
          className: 'capture-field',
          type: 'text',          
          placeholder: 'Lime Qty (t/ha)',          
        }),  
        React.createElement('textarea', {
          className: 'capture-textarea',
          placeholder: 'Comments',          
        }),       
        React.createElement('button', {type: 'submit',className: 'capture-button'}, "Capture")
      )  
    )
  }
}
export default Capture;
