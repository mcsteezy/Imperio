import React, { Component } from 'react';
import axios from 'axios';
import ElectionView from './ElectionView.jsx';


export default class ElectionInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      address: '',
      voterInfo: '',
      data: ''
    }
    this.onChange = this.onChange.bind(this);
    this.search = this.search.bind(this);
  }

  onChange = (e) => {
    this.setState({
      address: e.target.value
    });

  }

  search = () => {
    const address = this.state.address;

    axios.get('/voterinfo', { params: { address: address } })
    .then(response => {
      console.log('axios get request for voting data', response);
      this.setState({
        data: response.data
      });
    })
    .catch(error => {
      console.log(error);
    })
  };

  render () {
    return(
      <div>
      <div> <br/><input value={this.state.address} placeholder="Enter Address" onChange={this.onChange} /> {' '}
      <button onClick={this.search}>Search</button>
      </div>
      <ElectionView data={this.state.data} />
      </div>
      )
  }
}