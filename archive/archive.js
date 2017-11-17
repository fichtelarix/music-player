var $lib = $('#lib'),
  $trackpicker = $('#trackpicker'),
  audio = document.getElementById('player'),
  trackCount = 0,
  src = [],
  requests = {};
requests.get = new XMLHttpRequest();
requests.post = new XMLHttpRequest();


requests.get.onload = function () {
  src = JSON.parse(requests.get.responseText);
  audio.src = 'content/' + src[0].name;
  src.forEach(function (item) {
    $trackpicker.append('<div class="track">' + item.name + '</div>');
  });
};

$('.track').on('click', function (event) {
  console.log($(event.target).html());
});

audio.addEventListener('ended', function () {
  trackCount++;
  trackCount = trackCount == src.length ? 0 : trackCount;
  audio.src = 'content/' + src[trackCount].name;
  audio.autoplay = true;
});


requests.post.onload = function () {
  console.log(requests.get.responseText);
};

requests.post.upload.onprogress = function (event) {
  console.log(event.loaded + ' / ' + event.total);
};


requests.get.open('GET', 'php/load.php');
requests.get.send();


$lib.on('change', function (event) {
  var files = event.target.files,
    data = new FormData();
  $.each(files, function (index, item) {
    data.append(index, item);
  });

  requests.post.open('POST', 'php/newlib.php');

  requests.post.send(data);

});