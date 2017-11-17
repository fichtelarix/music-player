var MPController = (function() {

  return function($scope, $resource, Resource, Playlist) {
    var
      player = document.getElementById('player'),
      fullTimeWidth = 0,
      mousemove=false,
      initState=true;

    $scope.playerState = {
      trackNumber: 0,
      mode: 'pause',
      autoplay: true,
      repeat: true,
      random: false,
      muted: false
    };

    $scope.playerView = {
      load: true,
      width: 0,
      angle: 'rotate(120deg)',
      time: {
        current: '00:00',
        full: '00:00'
      }
    };

    $scope.show = {
      library: true,
      trackInfo: true,
      loader: false,
      MInfo: false
    };

    $scope.$on('playlistUpdate', function(event, remove) {

      if(remove) {
        $scope.playerState.trackNumber=0;
        $scope.playerState.mode='pause';
        initState = true;
        player.currentTime = 0;
        $scope.playerView.width = 0;
        $scope.playerView.time.current = timeToString(player.currentTime);
        player.pause();
      }

      $scope.playlist = [];
      $scope.playlist = Playlist.getPlaylist();
    });

    $scope.$on('trackRemove', function(event, index) {

      if(index<$scope.playerState.trackNumber) {
        $scope.playerState.trackNumber--;
      }
      if (index==$scope.playerState.trackNumber) {
        player.pause();
      }
    });

    $scope.$on('updateInfo', function(event, data, type) {
      $scope.$broadcast('updateInfoData', data, type);
    });

    $scope.update = function(data) {
      var model = new Resource(),
        index = $scope.playerState.trackNumber;
      model.data = data;
      model.$update(function(answer){
        $scope.playlist[index] = answer;
        $scope.$broadcast('updateData', answer);
       });
    };


    $scope.showInfo = function(type, item) {

      $scope.show.MInfo = true;
      $scope.$broadcast('showInfo', type, item);

    };

    $scope.removeFromPlaylist = function(event, item) {

      event.stopPropagation();
      Playlist.remove(item);
      $scope.playlist.splice($scope.playlist.indexOf(item), 1);

    };

    $scope.playTrack = function(index) {
      $scope.playerState.trackNumber = index;
      player.play();
    };

    $scope.playPause = function() {
      initState=false;
      if($scope.playerState.mode == 'pause') {
        $scope.playerState.mode = 'play';
        player.play();
      }
      else {
        $scope.playerState.mode = 'pause';
        player.pause();
      }
    };

    $scope.stop = function() {
      initState=true;
      player.pause();
      player.currentTime = 0;
    };

    $scope.setTime = function(event) {
      var width = event.clientX - $('#progress').offset().left;
      if (!mousemove) player.currentTime = width / fullTimeWidth * player.duration;
      else {
        $scope.playerView.width = width + 'px';
        $scope.$apply();
      }
    };

    $scope.pickTime = function() {
      $('body').on('mousemove', function(event) {
        mousemove=true;
        $scope.setTime(event);
        $('body').one('mouseup', function(_event) {
          $('body').off('mousemove');
          mousemove=false;
          $scope.setTime(_event);
        });

      });
    };

    $scope.pickVolume = function(event) {
      var $targetParent = $(event.target).parent().parent(),
        origin = {
          x: $targetParent.offset().left+$targetParent.width()/2,
          y: $targetParent.offset().top+$targetParent.height()/2
        };

       $('#MPlayer').draggable('disable');

      $('body').on('mousemove', function(event) {

        var end = {x: event.clientX, y: event.clientY},
          quarter = (origin.x<=end.x) ?
            (origin.y>=end.y)? 1: 2 : (origin.y<end.y)? 3 : 4,
          angle;

        switch (quarter) {

          case 1:
            angle = 0.5 + Math.atan((end.x-origin.x)/(origin.y-end.y))/Math.PI*3/4;
            break;
          case 2:
            angle = 0.875 - Math.atan((origin.y-end.y)/(end.x-origin.x))/Math.PI*3/4;
            break;
          case 3:
            angle = -0.125 + Math.atan((end.x-origin.x)/(origin.y-end.y))/Math.PI*3/4;
            break;
          case 4:
            angle = 0.5 + Math.atan((end.x-origin.x)/(origin.y-end.y))/Math.PI*3/4;
            break;

        }

        if(angle>=0&&angle<=1)
          player.volume = angle;


        $('body').one('mouseup', function(event) {
          $('body').off('mousemove');
          $('#MPlayer').draggable();
        });
      });
    };

    $scope.toNext = function() {
      if (!$scope.playerState.random) {
        if ($scope.playlist[$scope.playerState.trackNumber+1])
          $scope.playerState.trackNumber++;
        else if($scope.playerState.repeat)
          $scope.playerState.trackNumber = 0;
      }  else {
        $scope.playerState.trackNumber = Math.floor(Math.random()*$scope.playlist.length);
      }
    };

    $scope.toPrev = function() {
      if (!$scope.playerState.random) {
        if ($scope.playerState.trackNumber > 0)
          $scope.playerState.trackNumber--;
        else if($scope.playerState.repeat)
          $scope.playerState.trackNumber = $scope.playlist.length - 1;
      } else {
        $scope.playerState.trackNumber = Math.floor(Math.random()*$scope.playlist.length);
      }
      player.play();
    };

    $scope.mute = function() {
      $scope.playerState.muted = !$scope.playerState.muted;
      player.muted = $scope.playerState.muted;
    };


    player.addEventListener('ended', function() {

      if($scope.playerState.autoplay)
        $scope.toNext();
      else if($scope.playerState.repeat)
        player.play();
    });

    player.addEventListener('pause', function() {
      $scope.playerState.mode = 'pause';
      $scope.$apply();
    });

    player.addEventListener('playing', function() {
      initState=false;
      $scope.playerState.mode = 'play';
      $scope.$apply();
    });

    player.addEventListener('canplay', function() {

      $scope.playerView.time.full = timeToString(player.duration);
      fullTimeWidth = document.getElementById('fullTime').clientWidth;
      $scope.playerView.load=false;

      $scope.$apply();

      if($scope.playerState.autoplay&&!initState)
        player.play();

    }, false);

    player.addEventListener('timeupdate', function(event) {
      if (!mousemove)
        $scope.playerView.width = fullTimeWidth / player.duration * player.currentTime + 'px';

      $scope.playerView.time.current = timeToString(player.currentTime);
      $scope.$apply();
    }, false);

    player.addEventListener('volumechange', function() {
      $scope.playerState.muted = player.muted;
      $scope.playerView.angle = 'rotate(' + (player.volume - 0.5) * 240 + 'deg)';
      $scope.$apply();
    }, false);

    player.addEventListener('loadstart', function() {
      $scope.playerView.load=true;
      $scope.$digest();
    });


    function timeToString (time) {
      var hours = Math.floor(time/3600),
        minuts = Math.floor(time/60) - hours,
        seconds = Math.floor(time % 60);
      if(minuts<10) minuts = '0' + minuts;
      if(seconds<10) seconds = '0' + seconds;
      return hours>0 ? hours + ':' + minuts + ':' + seconds : minuts + ':' + seconds;
    }

  };


})();