(function() {

  angular.module('MetalPlayer', ['ngResource'])
    .factory('Resource', function($resource) {
      return $resource('php/music.php/:id', {id: '@id'}, {
        update: {method: 'PUT'}, save: {method: 'POST'}, delete: {method: 'DELETE'}
      });
    })
    .service('Playlist', playlist)
    .controller('MPlayer', MPController)
    .controller('MLoader', MLController)
    .controller('MInfo', MIController);


 })();


$(document).ready(function(){

  ['#trackpicker', '#libraryList', '.content', 'textarea.description'].forEach(function(item) {
    $(item).scrollbar();
  });

  ['#MPlayer', '#trackInfo', '#library', '#loader', '#MInfo'].forEach(function(item) {
    $(item).draggable();
  });



});

