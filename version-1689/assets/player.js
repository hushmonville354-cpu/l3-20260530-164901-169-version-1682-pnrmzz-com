(function () {
  function initMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var button = document.getElementById(options.buttonId);
    var label = overlay ? overlay.querySelector("[data-player-label]") : null;
    var loaded = false;
    var hls = null;

    if (!video || !options.stream) {
      return;
    }

    function hideOverlay() {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    }

    function showMessage(message) {
      if (label) {
        label.textContent = message;
      }
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    }

    function prepare() {
      if (loaded) {
        return;
      }

      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = options.stream;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(options.stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }

          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }

          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }

          showMessage("视频暂时无法播放");
        });
        return;
      }

      video.src = options.stream;
    }

    function start() {
      prepare();
      hideOverlay();

      var playTask = video.play();

      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(function () {
          showMessage("点击播放");
        });
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        start();
      });
    }

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    video.addEventListener("play", hideOverlay);
    video.addEventListener("error", function () {
      showMessage("视频暂时无法播放");
    });

    window.addEventListener("pagehide", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
