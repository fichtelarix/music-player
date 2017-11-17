var MLController = (function() {

  return function($scope, $filter, Resource, Playlist) {

    var loadMusic = document.getElementById('loadMusic');

    $scope.display = {

      filter: {
        band_id: '',
        genre_id: '',
        album_id: ''
      },
      order: 'title',
      all: false
    };

    $scope.load = {
      display: false,
      fullWidth: 0,
      width: 0,
      percent: 0
    };

    $scope.library = Resource.query(function() {

      Playlist.setPlaylist($scope.library);
      $scope.$emit('playlistUpdate', true);

      $scope.band = {id: [], names: []};
      $scope.album = {id: [], names: []};
      $scope.genre = {id: [], names: []};
      $scope.library.forEach(function(item) {
        item.onList = false;
        collectAttrs(item);
      });


    });


    $scope.$on('updateData', function(event, item) {

      collectAttrs(item);

    });

    $scope.$on('updateInfoData', function(event, data, type) {

      var attr_id = type + '_id',
        attr_name = type + '_name',
        id = data[attr_id],
        index = $scope[type].id.indexOf(data[attr_id]);

      $scope[type].names[index] = data[attr_name];

      $scope.library.forEach(function(item) {

        if(item[attr_id]==id) {
          for(var attr in data) {
            item[attr] = data[attr];
          }
        }
      });



    });


    $scope.selectAll = function() {
       $scope.display.all = !$scope.display.all;

      $scope.filtered.forEach(function(item) {
        item.onList = $scope.display.all;
      });

    };


    $scope.replacePlaylist = function() {

      var playlist = [];

      $scope.library.forEach(function(item) {

        if(item.onList) {
          playlist.push(item);
          item.onList = false;
        }
      });

      playlist = $filter('orderBy')(playlist,$scope.display.order);

      if(playlist.length) {
        Playlist.setPlaylist(playlist);
        $scope.$emit('playlistUpdate', true);
      }
    };


    $scope.addToPlaylist = function() {
      var playlist = [],
        currentPlaylist = Playlist.getPlaylist();

      $scope.library.forEach(function(item) {

        if(item.onList) {
          if (currentPlaylist.indexOf(item)==-1)
            playlist.push(item);
          item.onList = false;
        }

      });

      playlist=$filter('orderBy')(playlist,$scope.display.order);
      playlist = currentPlaylist.concat(playlist);

      Playlist.setPlaylist(playlist);
      $scope.$emit('playlistUpdate', false);
    };

    $scope.delete = function(item) {

      var model = new Resource({id: item.id});

      model.$delete(function() {
        $scope.library.splice($scope.library.indexOf(item), 1);
        Playlist.remove(item);
        $scope.$emit('playlistUpdate', false);
      });


    };


    loadMusic.addEventListener('change', function(event) {

      var data = new FormData(),
        request = new XMLHttpRequest();

      request.upload.onprogress = function (event) {
        $scope.load.percent = event.loaded / event.total;
        $scope.load.width = $scope.load.fullWidth * $scope.load.percent + 'px';
        $scope.$apply();
      };

      request.onload = function () {

        var array = JSON.parse(request.responseText);

        array.forEach(function(item) {
          $scope.library.push(item);
          $scope.$apply();
        });
      };

      var files = event.target.files;
      $.each(files, function (index, item) {
        data.append(index, item);
      });

      $scope.load.display = true;
      $scope.$apply();

      $scope.load.fullWidth = document.getElementById('loadFull').clientWidth - 4;

      request.open('POST', 'php/music.php');
      request.send(data);

    });

    function collectAttrs(item) {
      ['band', 'album', 'genre'].forEach(function(attr) {
        var attr_id = attr + '_id',
          attr_name = attr + '_name';
        if ($scope[attr].id.indexOf(item[attr_id])==-1) {
          $scope[attr].id.push(item[attr_id]);
          $scope[attr].names.push(item[attr_name]);
        }
      });
    }


  };

})();