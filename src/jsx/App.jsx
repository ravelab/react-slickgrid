var React = require ('react');
var SlickGrid = require ('react-slickgrid');
var FakeDataStore = require ('react-slickgrid/dist/js/utils/FakeDataStore');

var App = React.createClass ({
  getInitialState: function () {
      return {
        data: new FakeDataStore(100).getAll()
      };
  },

  render: function () {
    var settings = {
      multiColumnSort: true,
      defaultColumnWidth: 125,
      rowHeight: 26
    };

    return (
      <SlickGrid
        id="slickgrid-container"
        settings={settings}
        data={this.state.data}
      />
    );
  }
});

React.render (<App />, document.getElementById ('app-content'));
