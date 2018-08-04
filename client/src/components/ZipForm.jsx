import React, { Component } from 'react';
import axios from 'axios';
import ListView from './ListView.jsx';

export default class ZipForm extends Component {
  constructor(props) {
    super(props)

    this.state = {
      zip: '',
      region: 'state',
      data: ''
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleSubmit(inputZip, inputRegion) {
    console.log('current state:', inputZip, inputRegion);

    axios.post('/reps', {
      zip: inputZip,
      region: inputRegion
    })
      .then(response => {
        if (typeof (response.data) === 'String') {
          console.log(response.data);
        } else {
          console.log(response.data);
          this.setState({ data: response.data })
        }
      })
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  onSubmit(e) {
    e.preventDefault();
    this.handleSubmit(this.state.zip, this.state.region);
    this.setState({
      zip: ''
    })
  }

  render() {
    return (
      <div className="jumbotron">
        <h1 class="display-4"> Find Local Representatives </h1>
        <form style={{ display: "inline-block", flex: 2}}>
          <input
            autoFocus="true"
            name="zip"
            type="text"
            value={this.state.zip}
            onChange={e => this.handleChange(e)}
            placeholder="Enter Zipcode" />
        </form> {' '}
        <div
          className="btn btn-primary"
          style={{ display: "inline-block" }}
          onClick={() => { this.setState(
            { region: 'county' }, () => {
              this.handleSubmit(this.state.zip, this.state.region)
              }) }}>
          County
        </div>
        <div
          className="btn btn-primary"
          style={{ display: "inline-block", margin: "2px" }}
          onClick={() => {
            this.setState(
              { region: 'state' }, () => {
                this.handleSubmit(this.state.zip, this.state.region)
              })
          }}>
          State
        </div>
        <div
          className="btn btn-primary"
          style={{ display: "inline-block" }}
          onClick={() => {
            this.setState(
              { region: 'country' }, () => {
                this.handleSubmit(this.state.zip, this.state.region)
              })
          }}>
          Country
        </div>
        <div>
          <ListView data={this.state.data} />
        </div>
      </div>
    )
  }
}