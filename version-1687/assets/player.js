(function () {
  function startPlayer(box) {
    const video = box.querySelector("video");
    const button = box.querySelector(".play-overlay");
    const stream = box.getAttribute("data-stream");
    let loaded = false;
    let hls = null;

    function bind() {
      if (loaded || !video || !stream) {
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    function play() {
      bind();
      box.classList.add("is-playing");
      const promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          box.classList.remove("is-playing");
        });
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    box.addEventListener("click", function (event) {
      if (event.target === video && loaded) {
        return;
      }
      play();
    });

    video.addEventListener("play", function () {
      box.classList.add("is-playing");
    });

    video.addEventListener("pause", function () {
      if (!video.ended) {
        box.classList.remove("is-playing");
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      document.querySelectorAll("[data-player]").forEach(startPlayer);
    });
  } else {
    document.querySelectorAll("[data-player]").forEach(startPlayer);
  }
})();
