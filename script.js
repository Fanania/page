document.addEventListener("DOMContentLoaded", function () {
    const video = document.getElementById("promoPlaylist");
    if (!video) return;

    const sources = [
        "meta/loop_vid/video1.mp4",
        "meta/loop_vid/video2.mp4",
        "meta/loop_vid/video3.mp4",
        "meta/loop_vid/video4.mp4",
        "meta/loop_vid/video5.mp4"
    ];

    let current = 0;

    function playCurrent() {
        video.src = sources[current];
        video.load();
        video.play();
    }

    video.addEventListener("ended", function () {
        current = (current + 1) % sources.length;
        playCurrent();
    });

    playCurrent();
});
