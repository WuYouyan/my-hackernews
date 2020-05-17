import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
// import { render } from '@testing-library/react';

const list = [
  {
    title: 'React',
    url: 'https://facebook.github.io/react/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
  },
  {
    title: 'Redux',
    url: 'https://github.com/reactjs/redux',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
  },
];

const isSearched = (searchTerm) => (item) => 
item.title.toLowerCase().includes(searchTerm.toLowerCase()); 


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      list,
      searchTerm: "",
    };

    this.onSearchChange = this.onSearchChange.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
  }

  onDismiss(id) {
    const isNotId = item => item.objectID !== id;
    const updatedList = this.state.list.filter(isNotId);
    this.setState({ list: updatedList });
  }

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }

  render() {
    let firstName = "Victor";
    let lastNmae = "Zhao";
    const { searchTerm, list } = this.state;
    return (
      <div className="App App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <form>
          <input type="text" 
            placeholder="search"
            value={searchTerm}
            onChange={this.onSearchChange}/>
        </form>
        <div>
          {list.filter(isSearched(searchTerm)).map(item =>
            <div key={item.objectID}>
              <span>
                <a href={item.url}>{item.title}</a>{" "} 
              </span>
              <span>{item.author} </span>
              <span>{item.num_comments} </span>
              <span>{item.points}</span>
              <span>
                <button onClick={()=>this.onDismiss(item.objectID)} type="button">dismiss</button>
              </span>
            </div>  
          )}
        </div>
        <p>Hello {firstName} {lastNmae}, welcome to Hacknews</p>
      </div>
    );
  }
}


export default App;
