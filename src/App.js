import React, { Component } from 'react';
import fetch from 'isomorphic-fetch';
import './App.css';
import PropTypes from 'prop-types';
import 'font-awesome/css/font-awesome.min.css';
import { compose } from 'recompose';

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';


class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false,
    };

    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);

    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
  }

  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  setSearchTopStories(result) {
    const { hits, page } = result;
    const { searchKey, results } = this.state;

    const oldHits = results && results[searchKey] ? results[searchKey].hits : [];
    const updatedHits = [ ...oldHits, ...hits ];

    this.setState({ 
      results: { 
        ...results,
        [searchKey]: { hits: updatedHits, page }
       },
       isLoading: false 
    });
  }

  fetchSearchTopStories(searchTerm, page = 0) {
    this.setState({ isLoading: true });
    const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${
      page}&${PARAM_HPP}${DEFAULT_HPP}`;
    fetch(url).then(response => response.json())
      .then(result => this.setSearchTopStories(result))
      .catch(e => {
        this.setState({ error: e });
      });
  }

  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({ 
      searchKey: searchTerm
    });
    this.fetchSearchTopStories(searchTerm);
  }

  onDismiss(id) {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];

    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);

    this.setState({ 
      results:  { 
        ...results, 
        [searchKey]: { hits: updatedHits, page } 
      }  //ES6 replace Object.assign()
    });
  }

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }

  onSearchSubmit(event) {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }
    event.preventDefault();
  }

  render() {

    const { 
      searchTerm, 
      results, 
      searchKey, 
      error,
      isLoading
    } = this.state;
    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    const list = (results && results[searchKey] && results[searchKey].hits) || [];
    
    // if (!results) {
    //   return null;
    // }

    return (
      <div className="page">
        <div className="interactions">
          <Search 
            value={searchTerm} 
            onChange={this.onSearchChange}
            onSubmit={this.onSearchSubmit}
          >
              Search
          </Search>
        </div>
        { error?
          <div className="interactions">
            <p> Something went wrong. XD </p>
          </div> :
          <Table 
            list={list} 
            onDismiss={this.onDismiss}/>
        }
        <div className="interactions">
          <BurronWithConditionalRendering 
            isLoading={isLoading} 
            onClick={() => 
          this.fetchSearchTopStories(searchKey,  page + 1)}>
              More
          </BurronWithConditionalRendering>
        </div>
      </div>
    );
  }
}

// class Search extends Component {
//   componentDidMount() {
//     if (this.input) {
//       this.input.focus();
//     }
//   }

//   render() {
//     const {
//       value,
//       onChange,
//       onSubmit,
//       children
//     } = this.props;
//     return (
//       <form onSubmit={onSubmit}>
//         {children}
//         <input
//           type="text"
//           value={value}
//           onChange={onChange}
//           ref = {(node)=>{this.input = node;}}
//           />
//         <button type="submit">{children}</button>
//       </form>
//     );
//   }
// }


const Search = ({ value, onChange, onSubmit, children }) => {
  let input;
  return (
    <form onSubmit={onSubmit}>
      {children}
      <input
        type="text"
        value={value}
        onChange={onChange}
        ref={(node) => input = node}
      />
        <button type="submit">{children}</button>
    </form>
  );
}
Search.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  children: PropTypes.node.isRequired
};

const largeColumn = {
  width: '40%',
};

const midColumn = {
  width: '30%',
};

const smallColumn = {
  width: '10%',
};

const Table = ({list, onDismiss}) => 
  <div className="table">
    {list.map(item =>
      <div key={item.objectID} className="table-row">
        <span style={largeColumn}>
          <a href={item.url}>{item.title}</a>{" "} 
        </span>
        <span style={midColumn}>{item.author} </span>
        <span style={smallColumn}>{item.num_comments} </span>
        <span style={smallColumn}>{item.points}</span>
        <span style={smallColumn}>
          <Button 
            className="button-inline" 
            onClick={()=>onDismiss(item.objectID)}>
              dismiss
          </Button>
        </span>
      </div>  
    )}
  </div>
Table.protoTypes = {
  // list: PropTypes.array.isRequired,
  list: PropTypes.arrayOf(
    PropTypes.shape({
      objectID: PropTypes.string.isRequired,
      author: PropTypes.string,
      url: PropTypes.string,
      num_comments: PropTypes.number,
      points: PropTypes.number,
    })
  ).isRequired,
  onDismiss: PropTypes.func.isRequired,
};


const Button = ({ onClick, className, children }) =>
  <button 
    onClick={onClick} 
    className={className}
    type="button">
    {children}
  </button>

Button.defaultProps = {
  className: '',
};

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};



/* Replaced by HOC Button
// const withLoading = (Component) => (props) => 
//   props.isLoading? <Loading/> : <Component {...props} />

const Loading = () =>
  (<div>
    <i className="fa fa-spinner">loading</i>
  </div>)

const withLoading = (Component) => ({ isLoading, ...rest }) => 
  isLoading? <Loading/> : <Component {...rest} />

const ButtonWithLoading = withLoading(Button); */

// Reusable HOC Button
//
const withMaybe = (conditionalRenderingFn) => (Component) => (props) =>
  conditionalRenderingFn(props)
    ? null
    : <Component { ...props } />

const withEither = (conditionalRenderingFn, EitherComponent) => (Component) => (props) =>
  conditionalRenderingFn(props)
    ? <EitherComponent />
    : <Component {...props} />

const LoadingIndicator = () =>
  <div>
    <i className="fa fa-spinner">loading</i>
  </div>

const isLoadingConditionFn = (props) => props.isLoading;

const withConditionalRenderings = compose(
  withEither(isLoadingConditionFn, LoadingIndicator)
);

const BurronWithConditionalRendering = withConditionalRenderings(Button)

export default App;

export { Button, Table, Search };