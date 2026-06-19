(function () {
    window.setupMoviePlayer = function (videoUrl) {
        var video = document.getElementById("movie-player");
        var trigger = document.querySelector("[data-player-trigger]");
        var message = document.querySelector("[data-player-message]");
        var attached = false;
        var hlsInstance = null;

        if (!video || !videoUrl) {
            return;
        }

        function showMessage(text) {
            if (!message) {
                return;
            }
            message.textContent = text;
            message.hidden = false;
        }

        function attachSource() {
            if (attached) {
                return;
            }
            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoUrl;
                video.load();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(videoUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                        return;
                    }
                    showMessage("视频暂时无法加载");
                });
                return;
            }

            showMessage("视频暂时无法加载");
        }

        function startPlayer() {
            attachSource();
            if (trigger) {
                trigger.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    window.setTimeout(function () {
                        var retry = video.play();
                        if (retry && typeof retry.catch === "function") {
                            retry.catch(function () {
                                showMessage("点击视频继续播放");
                            });
                        }
                    }, 250);
                });
            }
        }

        attachSource();

        if (trigger) {
            trigger.addEventListener("click", startPlayer);
        }

        video.addEventListener("play", function () {
            if (trigger) {
                trigger.classList.add("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
