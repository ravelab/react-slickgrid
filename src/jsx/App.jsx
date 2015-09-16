var React = require ('react');
var FakeDataStore = require ('./utils/FakeDataStore');
var ReactSlickGrid = require ('./ReactSlickGrid.jsx');

var ROWS = 1000;

var App = React.createClass ({
  getInitialState: function () {
    return {
      data: new FakeDataStore (ROWS),
      filter: {}
    };
  },

  componentDidMount: function () {
    setTimeout (function () {
      this.setState ({
        filter: {
          hello: 'world!'
        }
      });
    }.bind (this), 2000);
  },

  render: function () {
    return (
      <ReactSlickGrid
        responseItem="records"
        endpoint='http://localhost:4000/records'
        table="NFL"
        filter={this.state.filter} />
    )
  }
});

React.render (
  <App />,
  document.getElementById ('table-wrapper')
);
