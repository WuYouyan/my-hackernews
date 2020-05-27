import React, { Component } from 'react';
import fetch from 'isomorphic-fetch';
import { sortBy } from 'lodash';
import classNames from 'classnames';
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

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
};

const updateSearchTopStoriesState = (hits, page) =>
  (prevState) => {
    const { searchKey, results} = prevState;

    const oldHits = results && results[searchKey]
      ? results[searchKey].hits
      : [];
      const updatedHits = [
        ...oldHits,
        ...hits
      ];
      return {
        results: {
          ...results,
          [searchKey]: { hits: updatedHits, page }
        },
        isLoading: false
      };
  }

const updateResultsOnDismiss = (id) =>
  (prevState) => {
    const { searchKey, results } = prevState;
    const { hits, page } = results[searchKey];
    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId);
    return {
      results:  { 
        ...results, 
        [searchKey]: { hits: updatedHits, page } 
      }
    }
  }


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
    this.setState(updateSearchTopStoriesState(hits, page));
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
    /* this.setState((prevState) =>{ 
      const { searchTerm } = prevState;
      this.fetchSearchTopStories(searchTerm);
      return {
        searchKey: searchTerm
      }
    }); */
    const { searchTerm } = this.state;
    this.setState({ 
      searchKey: searchTerm
    });
    this.fetchSearchTopStories(searchTerm);
  }

  onDismiss(id) {
    this.setState(updateResultsOnDismiss(id));
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
      isLoading,
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
          <ButtonWithConditionalRendering 
            isLoading={isLoading} 
            onClick={() => 
          this.fetchSearchTopStories(searchKey,  page + 1)}>
              More
          </ButtonWithConditionalRendering>
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

class Table extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sortKey: 'NONE',
      isSortReverse: false,
    };

    this.onSort = this.onSort.bind(this);

  }

  onSort(sortKey) {
    const isSortReverse = this.state.sortKey === sortKey && !this.state.isSortReverse;
    this.setState({ sortKey, isSortReverse });
  }

  render() {
    const {
      list,
      onDismiss,
    } = this.props;

    const {
      sortKey,
      isSortReverse
    } = this.state;

    // const sortedList = SORTS[sortKey](list);
    const sortedList = SORTS[sortKey](list);
    const reverseSortedList = isSortReverse 
      ? sortedList.reverse()
      : sortedList;
    return(
    <div className="table">
        <div className="table-header">
          <span style={{ width: '40%' }}>
            <Sort
              sortKey={'TITLE'}
              onSort={this.onSort}
              isSortReverse={isSortReverse}
              activeSortKey={sortKey}
            >
              Title
            </Sort>
          </span>
          <span style={{ width: '30%' }}>
            <Sort
              sortKey={'AUTHOR'}
              onSort={this.onSort}
              isSortReverse={isSortReverse}
              activeSortKey={sortKey}
            >
              Author
            </Sort>
          </span>
          <span style={{ width: '10%' }}>
            <Sort
              sortKey={'COMMENTS'}
              onSort={this.onSort}
              activeSortKey={sortKey}
              isSortReverse={isSortReverse}
            >
              Comments
            </Sort>
          </span>
          <span style={{ width: '10%' }}>
            <Sort
              sortKey={'POINTS'}
              onSort={this.onSort}
              isSortReverse={isSortReverse}
              activeSortKey={sortKey}
            >
              Points
            </Sort>
          </span>
          <span style={{ width: '10%' }}>
            Archive
          </span>
        </div>
        {reverseSortedList.map(item =>
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
    )
  }
}

/* const Table = ({
  list,
  sortKey,
  isSortReverse,
  onSort, 
  onDismiss
}) => {
  const sortedList = SORTS[sortKey](list);
  const reverseSortedList = isSortReverse 
    ? sortedList.reverse()
    : sortedList;
  return(

  <div className="table">
      <div className="table-header">
        <span style={{ width: '40%' }}>
          <Sort
            sortKey={'TITLE'}
            onSort={onSort}
            isSortReverse={isSortReverse}
            activeSortKey={sortKey}
          >
            Title
          </Sort>
        </span>
        <span style={{ width: '30%' }}>
          <Sort
            sortKey={'AUTHOR'}
            onSort={onSort}
            isSortReverse={isSortReverse}
            activeSortKey={sortKey}
          >
            Author
          </Sort>
        </span>
        <span style={{ width: '10%' }}>
          <Sort
            sortKey={'COMMENTS'}
            onSort={onSort}
            activeSortKey={sortKey}
            isSortReverse={isSortReverse}
          >
            Comments
          </Sort>
        </span>
        <span style={{ width: '10%' }}>
          <Sort
            sortKey={'POINTS'}
            onSort={onSort}
            isSortReverse={isSortReverse}
            activeSortKey={sortKey}
          >
            Points
          </Sort>
        </span>
        <span style={{ width: '10%' }}>
          Archive
        </span>
      </div>
      {reverseSortedList.map(item =>
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
  )
} */

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
  onClick: PropTypes.func,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

const Sort = ({ 
  sortKey, 
  isSortReverse,
  activeSortKey,
  onSort, 
  children }) => {
    const sortClass = classNames(
      'button-inline',
      { 'button-active-up': sortKey === activeSortKey&&isSortReverse },
      { 'button-active-down': sortKey === activeSortKey&&!isSortReverse }
    );
    return (
      <Button 
        onClick={() => onSort(sortKey)}
        className={sortClass}
      >
        {children}
      </Button>
    )

  }

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

const ButtonWithConditionalRendering = withConditionalRenderings(Button)

export default App;

export { Button, Table, Search };