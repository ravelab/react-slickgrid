/*
 *  AJAX data store, remote model implementation
 *  Supports any POST-compatible backend that accepts JSON parameters.
 */

function RemoteModel () {
  /** Private **/
  var PAGESIZE = 50;
  var data = {length: 0};
  var searchString = "";
  var sortColumn = null;
  var sortDirection = null;
  var getUrl = null;
  var getParameters = null;
  var responseItemListName = "";
  var h_request = null;
  var request = null;

  var onDataLoading = new Slick.Event ();
  var onDataLoaded = new Slick.Event ();

  function init () {}

  function isDataLoaded (from, to) {
    for (var i = from; i <= to; i++) {
      if (data[i] == undefined || data[i] == null) {
        return false;
      }
    }
    return true;
  }

  function clear () {
    for (var key in data) {
      delete data[key];
    }
    data.length = 0;
  }

  function ensureData (from, to) {
    if (request) {
      request.abort ();
      for (var i = request.fromPage; i <= request.toPage; i++) {
        data[i * PAGESIZE] = undefined;
      }
    }

    if (from < 0) { from = 0; }
    if (data.length > 0) { to = Math.min(to, data.length - 1); }

    var fromPage = Math.floor(from / PAGESIZE);
    var toPage = Math.floor(to / PAGESIZE);

    while (data[fromPage * PAGESIZE] !== undefined && fromPage < toPage) { fromPage++; }
    while (data[toPage * PAGESIZE] !== undefined && fromPage < toPage) { toPage--; }

    if (fromPage > toPage || ((fromPage == toPage) && data[fromPage * PAGESIZE] !== undefined)) {
      onDataLoaded.notify ({from: from, to: to});
      return;
    }

    var url = getUrl ();
    var parameters = getParameters (fromPage, toPage, PAGESIZE, sortColumn, sortDirection);

    if (sortColumn && sortDirection) {
      parameters.sort = sortColumn;
      parameters.direction = sortDirection;
    }

    if (h_request != null) clearTimeout (h_request);

    h_request = setTimeout (function () {
      for (var i = fromPage; i <= toPage; i++) {
         /** A null value indicates a
            'requested but not available yet' **/
        data[i * PAGESIZE] = null;
      }

      onDataLoading.notify ({ from: from, to: to });

      request = $.ajax ({
        type: 'POST',
        url: url,
        data: parameters,
        success: onSuccess,
        error: function (error) {
          onError (error)
        }
      });

      request.fromPage = fromPage;
      request.toPage = toPage;
    }, 50);
  }


  function onError (error) {
    console.log ('Ajax error', error);
  }

  function onSuccess (resp) {
		var minimumRowFetch = resp.skip;
    var maximumRowFetch = resp.skip + resp[responseItemListName].length;

		data.length = parseInt (resp.count);

		for (var i = 0; i < resp[responseItemListName].length; i++) {
			data[minimumRowFetch + i] = resp[responseItemListName][i];
			data[minimumRowFetch + i].index = minimumRowFetch + i;
		}

		request = null;
		onDataLoaded.notify ({ from: minimumRowFetch, to: maximumRowFetch });
  }

  function reloadData (from, to) {
    for (var i = from; i <= to; i++) {
      delete data[i]
    };

    ensureData(from, to);
  }

  function setGetUrl (callback) {
    getUrl = callback;
  }

  function setGetParameters (callback) {
    getParameters = callback;
  }

  function setSort (column, direction) {
    sortColumn = column;
    sortDirection = direction;
    clear ();
  }

  function setSearch (string) {
    searchString = string;
    clear ();
  }

  function setReponseItemListName (key) {
    responseItemListName = key;
  }

  init ();

  return {
    "data": data,
    "clear": clear,
    "isDataLoaded": isDataLoaded,
    "ensureData": ensureData,
    "reloadData": reloadData,
    "setGetUrl": setGetUrl,
    "setGetParameters": setGetParameters,
    "setReponseItemListName": setReponseItemListName,
    "setSort": setSort,
    "setSearch": setSearch,
    "onDataLoading": onDataLoading,
    "onDataLoaded": onDataLoaded
  };
}

module.exports = RemoteModel;
