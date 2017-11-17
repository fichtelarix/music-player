var playlist = (function() {

  return function () {

    var _playlist = [];

    return {
      setPlaylist: function (list) {
        _playlist = list.slice();
      },
      getPlaylist: function () {
        return _playlist;
      },
      add: function (item) {
        _playlist.push(item);
      },
      remove: function (item) {
        var index = _playlist.indexOf(item);
        if (index != -1)
          _playlist.splice(index, 1);
        return index;
      }
    };
  }

})();