(function () {
  var boxes = Array.prototype.slice.call(document.querySelectorAll('.movie-player'));

  boxes.forEach(function (box) {
    var video = box.querySelector('video');
    var trigger = box.querySelector('.play-trigger');
    var stream = (trigger && trigger.getAttribute('data-play')) || box.getAttribute('data-play') || '';
    var ready = false;
    var hls = null;

    function attach() {
      if (ready || !video || !stream) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        video.src = stream;
      }

      ready = true;
    }

    function play() {
      attach();
      box.classList.add('is-playing');
      video.setAttribute('controls', 'controls');
      var started = video.play();
      if (started && typeof started.catch === 'function') {
        started.catch(function () {});
      }
    }

    function toggle() {
      if (!ready || video.paused) {
        play();
      } else {
        video.pause();
      }
    }

    if (trigger) {
      trigger.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', toggle);
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('ended', function () {
        box.classList.remove('is-playing');
      });
    }

    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
