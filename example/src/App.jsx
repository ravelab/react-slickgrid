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
    var settings = {
      multiColumnSort: true,
      defaultColumnWidth: 125,
      rowHeight: 26
    };

    return (
      <ReactSlickGrid
        id="slick-grid-container"
        responseItem="records"
        endpoint='/records'
        table="NFL"
        filter={this.state.filter}
        settings={settings} />
    )
  }
});

React.render (
  <App />,
  document.getElementById ('table-wrapper')
);
