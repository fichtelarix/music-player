var MIController = (function() {

  return function($scope, $resource) {

    var inputImg,
      type_id = '_',
      req = new XMLHttpRequest();

    var Resource = $resource('php/info.php/:id', {id: '@'+type_id}, {
      update: {method: 'PUT'}
    });


    $scope.info = {
      type: 'loading',
      mode: 'display',
      picture: ''
    };


    $scope.$on('showInfo', function(event, type, item) {

      var
        resource = $resource('php/info.php/:id', {id: '@'+type_id}, {
          update: {method: 'PUT'}
        }),
        info;

      type_id = type + '_id';

      $scope.info.mode = 'display';

      $scope.info.type='loading';


      info = resource.get({id: type + '_' + item[type_id]}, function() {

        $scope.info.content = info;
        $scope.info.type = type;
        $scope.info.picture = $scope.info.type == 'album' ?
          $scope.info.content.cover : $scope.info.type == 'band' ?
            $scope.info.content.logo : '';

      });

    });

    $scope.editInfo = function() {

      $scope.info.mode = 'edit';

      if ($scope.info.type == 'album' || $scope.info.type == 'band') {

          $('#MInfo').ready(function (event) {

            inputImg = document.getElementById('inputCover');

            inputImg.addEventListener('change', function(event) {

              var data = new FormData();

              $scope.info.picture = 'loading.jpg';
              $scope.$apply();

              data.append('image', inputImg.files[0]);
              data.append('id',  $scope.info.content[type_id]);
              data.append('type', $scope.info.type);

              req.onload = function() {

                $scope.info.picture = req.responseText;
                ($scope.info.type == 'album')?
                    $scope.info.content.cover = req.responseText: $scope.info.content.logo = req.responseText;

                $scope.$apply();
                $scope.$emit('updateInfo', $scope.info.content, $scope.info.type);
              };

              req.open('POST', 'php/loadcover.php');
              req.send(data);
            });

          });
      }

    };


    $scope.updateInfo = function() {

      var resource = new Resource();

      resource.data = $scope.info.content;
      resource.type = $scope.info.type;

      resource.$update(function(answer){
        $scope.info.mode = 'display';
        $scope.info.content = answer;
        $scope.$emit('updateInfo', answer, $scope.info.type);
      });
    };


  };


})();