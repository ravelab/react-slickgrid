var React = require ('react');
var PureRenderMixin = require('react/addons').addons.PureRenderMixin;
var SlickGrid = require('slickgrid/grid');
var RemoteModel = require ('./utils/RemoteModel');

var ReactSlickGrid = React.createClass ({
  mixins: [PureRenderMixin],

  _loader: null,
  _slickgrid: null,

  getDefaultProps: function () {
    return {
      id: '',
      endpoint: undefined,
      table: undefined,
      filter: {},

      /** Required for the viewport to be visible **/
      style: {
        position: 'absolute',
        height: '100%',
        width: '100%'
      },

      /** Default SlickGrid grid settings **/
      settings: {
        explicitInitialization: false,
        rowHeight: 25,
        defaultColumnWidth: 80,
        enableAddRow: false,
        leaveSpaceForNewRows: false,
        editable: false,
        autoEdit: true,
        enableCellNavigation: true,
        enableColumnReorder: true,
        asyncEditorLoading: false,
        asyncEditorLoadDelay: 100,
        forceFitColumns: false,
        enableAsyncPostRender: false,
        asyncPostRenderDelay: 50,
        autoHeight: false,
        editorLock: Slick.GlobalEditorLock,
        showHeaderRow: false,
        headerRowHeight: 25,
        showTopPanel: false,
        topPanelHeight: 25,
        formatterFactory: null,
        editorFactory: null,
        cellFlashingCssClass: "flashing",
        selectedCellCssClass: "selected",
        multiSelect: true,
        enableTextSelectionOnCells: false,
        dataItemColumnValueExtractor: null,
        fullWidthRows: false,
        multiColumnSort: false,
        defaultFormatter: this._defaultFormatter,
        forceSyncScrolling: false,
        addNewRowCssClass: "new-row"
      },

      /** Default SlickGrid columns settings **/
      columnSettings: {
        name: "",
        resizable: true,
        sortable: false,
        minWidth: 30,
        rerenderOnResize: false,
        headerCssClass: null,
        defaultSortAsc: true,
        focusable: true,
        selectable: true
      }
    }
  },

  componentDidMount: function () {
    this._init ();
  },

  componentDidUpdate: function () {
    /** Whenever a new filter object or props are received
        the grid must request the new records **/
    this._slickgrid.onViewportChanged.notify ();
  },

  _init: function () {
    if (this.props.id) {
      if (this.props.endpoint) {
        this._initializeSlickData ();
      } else {
        this._loader = { data: this.props.data };
      }
      this._initializeSlickGrid ();
      this._slickgrid.onViewportChanged.notify ();
    } else {
      console.warn ('ReactSlickGrid requires a unique id to be given as a prop.');
    }
  },

  _initializeSlickData: function () {
    this._loader = new RemoteModel ();
    this._loader.setGetParameters (this._getParameters);
    this._loader.setGetUrl (this._getUrl);
    this._loader.setReponseItemListName (this.props.responseItem);
    this._loader.onDataLoaded.subscribe (this._onDataLoaded);
  },

  _initializeSlickGrid: function () {
    var id = '#' + this.props.id;
    var rows = this._loader.data;
    var columns = this._generateColumns (this._loader);
    var options = this.props.settings;

    this._slickgrid = new SlickGrid (id, rows, columns, options);
    this._slickgrid.onColumnsResized.subscribe (this._onColumnResize);
    this._slickgrid.onSort.subscribe (this._onSort);

    if (this.props.endpoint) {
      this._slickgrid.onViewportChanged.subscribe (this._onViewportChange);
    }

    this._autoResizeGrid ();
  },

  _onSort: function (event, args) {
    var sortColumn = args.sortCols[0].sortCol.field;
    var sortDirection = 'DESC';
    if (args.sortCols[0].sortAsc) {
      sortDirection = 'ASC';
    }

    if (this.props.endpoint) {
      this._loader.setSort (sortColumn, sortDirection);
      this._slickgrid.resetActiveCell ();
      this._slickgrid.onViewportChanged.notify ();

    } else {
      this._loader.data.sort((a, b) => {
        var sortVal = 0;
        if (a[sortColumn] > b[sortColumn]) sortVal = 1;
        if (a[sortColumn] < b[sortColumn]) sortVal = -1;
        if (sortDirection === 'DESC') sortVal = sortVal * -1;
        return sortVal;
      });

      this._slickgrid.invalidate ();
    }

    this._addSortIndicator (sortDirection);
  },

  _addSortIndicator: function (sortDirection) {
    this._cleanSortIndicators (function () {
      if (sortDirection === 'DESC') {
        $('#' + this.props.id).find ('.slick-sort-indicator-desc')
                              .html ('<i class="fa fa-sort-desc"></i>');
      } else {
        $('#' + this.props.id).find ('.slick-sort-indicator-asc')
                              .html ('<i class="fa fa-sort-asc"></i>');
      }
    }.bind (this));
  },

  _cleanSortIndicators: function (callback) {
    $('#' + this.props.id).find ('.slick-sort-indicator').html ('');
    $('#' + this.props.id).find ('.slick-sort-indicator').html ('');
    if (callback) callback ();
  },

  /** Prevents the column to trigger
      the sort function after resize **/
  _onColumnResize: function (event) {
    event.stopImmediatePropagation ();
    event.stopPropagation ();
    return false;
  },

  /** Whenever the viewport changes (the user scrolls)
      the instantiated grid will request more records to render **/
  _onViewportChange: function (event, args) {
    var viewport = this._slickgrid.getViewport ();
    this._loader.ensureData (viewport.top, viewport.bottom);
  },

  /** Fires whenever the Slick Grid Remote Model
      finishes fetching data from the endpoint **/
  _onDataLoaded: function (event, args) {
    if (this._slickgrid.getColumns ().length === 0) {
      this._slickgrid.setColumns (this._generateColumns (this._loader));
    }
    this._slickgrid.invalidate ();
  },

  /** Generates columns from the first
      object of the rows array **/
  _generateColumns: function (loader) {
    var columns = [];
    for (var column in loader.data[0]) {
      columns.push ({
        id: column,
        name: column,
        field: column,
        width: this.props.settings.defaultColumnWidth,
        sortable: true,
      });
    }

    return columns;
  },

  /** RemoteModel leverages this function
      to retrieve the endpoint it will be using
      for fetching new data **/
  _getUrl: function () {
    return this.props.endpoint;
  },

  /** POST parameters
      for the SlickGrid POST request **/
  _getParameters: function (minimum, maximum, limit, sortColumn, sortDirection) {
    return {
      table: this.props.table,
      skip: (minimum * limit),
      limit: (((maximum - minimum) * limit) + limit),
      sort: undefined,
      direction: undefined,
      filter: this.props.filter
    };
  },

  /** Watches over whenever there is a resize change
      on the element wrapping the Slick Grid and resizes the grid **/
  _autoResizeGrid: function () {
    $(window).resize (function (event) {
      this._slickgrid.resizeCanvas ();
      event.stopPropagation ();
    }.bind (this));
  },

  _defaultFormatter: function defaultFormatter(row, cell, value, columnDefinition, dataContext) {
      if (value === null) {
        return "";
      } else {
        return (value + "").replace (/&/g, "&amp;").replace (/</g, "&lt;").replace (/>/g, "&gt;");
      }
    },

  render: function () {
    return (
      <div id={this.props.id} style={this.props.style}></div>
    );
  }
});

module.exports = ReactSlickGrid;
