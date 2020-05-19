import React from 'react';
// import { render } from '@testing-library/react';
import ReactDom from 'react-dom';
import renderer from 'react-test-renderer'; // snapshot test
import Enzyme, { shallow } from 'enzyme'; // unit test
import Adapter from 'enzyme-adapter-react-16'; //unit test
import App, { Search, Button, Table } from './App';

Enzyme.configure({ adapter: new Adapter() }); //unit test

describe('App', () =>{
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDom.render(<App />, div);
  });

  test('has a valid snapshot', () => {
    const component = renderer.create(
      <App />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('Search', () =>{
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDom.render(<Search>Search</Search>, div);
  });

  test('has a valid snapshot', () => {
    const component = renderer.create(
      <Search>Search</Search>
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('Button', () =>{
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDom.render(<Button>Give Me More</Button>, div);
  });

  test('has a valid snapshot', () => {
    const component = renderer.create(
      <Button>Give Me More</Button>
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('Table', () =>{
  const props = {
    list: [
      { title: '1', author: '1', num_comments: 1, points: 2, objectID: 'y' },
      { title: '2', author: '2', num_comments: 1, points: 2, objectID: 'z' },
    ],
  };
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDom.render(<Table { ...props } />, div);
  });

  test('has a valid snapshot', () => {
    const component = renderer.create(
      <Table { ...props } />
    );
    let tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('shows two items in list', () => {
    const element = shallow(
      <Table { ...props } />
    );
    expect(element.find('.table-row').length).toBe( 2 );
  });
});