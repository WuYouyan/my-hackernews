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


class App extends Component {
  render() {
    let firstName = "Victor";
    let lastNmae = "Zhao";
    return (
      <div className="App App-header">
        <img src={logo} className="App-logo" alt="logo" />
        {list.map(item =>
          <div key={item.objectID}>
            <span>
              <a href={item.url}>{item.title}</a>{" "} 
            </span>
            <span>{item.author} </span>
            <span>{item.num_comments} </span>
            <span>{item.points}</span>
          </div>  
        )}
        <p>Hello {firstName} {lastNmae}, welcome to Hacknews</p>
      </div>
    );
  }
}

export default App;
