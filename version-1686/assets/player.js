(function () {
  var loaded = new WeakMap();

  function init(config) {
    var video = document.getElementById(config.videoId);
    var overlay = document.getElementById(config.overlayId);
    var source = config.source;
    if (!video || !source) {
      return;
    }

    function attach() {
      if (loaded.has(video)) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        loaded.set(video, true);
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            try {
              hls.destroy();
            } catch (error) {
              console.error(error);
            }
            video.src = source;
          }
        });
        loaded.set(video, hls);
        return;
      }
      video.src = source;
      loaded.set(video, true);
    }

    function play() {
      attach();
      video.controls = true;
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var action = video.play();
      if (action && typeof action.catch === "function") {
        action.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
  }

  window.MoviePlayer = {
    init: init
  };
}());
