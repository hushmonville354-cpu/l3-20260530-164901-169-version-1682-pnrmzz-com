import { H as Hls } from "./hls-dru42stk.js";

function attachSource(video, src, status) {
    if (!src) {
        status.textContent = "当前页面未找到可用播放源";
        return null;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        return null;
    }

    if (Hls && Hls.isSupported()) {
        var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            status.textContent = "播放源已就绪";
        });
        hls.on(Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
                status.textContent = "播放源加载失败，请稍后重试";
                hls.destroy();
            }
        });
        return hls;
    }

    status.textContent = "当前浏览器暂不支持 HLS 播放";
    return null;
}

function setupPlayer(player) {
    var video = player.querySelector("video");
    var button = player.querySelector("[data-play-button]");
    var status = player.querySelector("[data-player-status]");
    var src = player.dataset.src;
    var hls = null;
    var attached = false;

    if (!video || !button || !status) {
        return;
    }

    function play() {
        if (!attached) {
            hls = attachSource(video, src, status);
            attached = true;
        }

        var promise = video.play();
        player.classList.add("is-playing");
        status.textContent = "正在播放";

        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                player.classList.remove("is-playing");
                status.textContent = "浏览器阻止了自动播放，请再次点击播放";
            });
        }
    }

    button.addEventListener("click", play);
    video.addEventListener("play", function () {
        player.classList.add("is-playing");
        status.textContent = "正在播放";
    });
    video.addEventListener("pause", function () {
        status.textContent = "已暂停";
    });
    video.addEventListener("ended", function () {
        status.textContent = "播放结束";
    });

    window.addEventListener("pagehide", function () {
        if (hls) {
            hls.destroy();
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    var players = document.querySelectorAll("[data-player]");
    players.forEach(setupPlayer);
});
