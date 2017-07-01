
(function() {
    "use strict";

    var userName = window.prompt("What's your name?", "anonymous");
    var userInfoElement = document.querySelector(".user-info");
    userInfoElement.innerHTML = `Shalom, <span class="user-name">${userName}</span>!`;

    if (window.Notification && Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    const socket = io({
        query: {
            userName: userName
        }
        //transports: ['websocket']
    });

    var currentTrackIndex = 0;
    var trackList;

    // ----- Youtube player initialization code here -----
    var player;

    window.onYouTubeIframeAPIReady = function() {
        player = new YT.Player('player', {
            height: '400',
            width: '600',
            //videoId: 'M7lc1UVf-VE',
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    }

    function onPlayerReady(event) {
        //event.target.playVideo();
    }

    function onPlayerStateChange(event) {
        if (event.data == YT.PlayerState.ENDED && trackList.children.length - 1 > currentTrackIndex) {
            player.loadVideoById(trackList.children[currentTrackIndex + 1].dataset.videoId);
            selectTrack(currentTrackIndex + 1);
        }
    }
    function stopVideo() {
        player.stopVideo();
    }
// ----- end Youtube player initialization code -----

    trackList = document.getElementById("trackList");
    trackList.addEventListener("click", function playVideo(event) {
    var trackItem = event.target;

        while (!trackItem.classList.contains("track") && trackItem.parentNode) {
            trackItem = trackItem.parentNode;
        }

        var videoId= trackItem.dataset.videoId;
        if (videoId) {
            player.loadVideoById(trackItem.dataset.videoId);
            selectTrack(Array.from(trackList.children).indexOf(trackItem));
        }
    });

    function selectTrack(trackNumber) {
        //if (trackNumber !== currentTrackIndex) {
            trackList.children[currentTrackIndex].classList.remove("selected");
            currentTrackIndex = trackNumber;
            trackList.children[trackNumber].classList.add("selected");
        //}
    }

    function createTrackDOMStructure(url, userName) {
        var newTrackElement = document.getElementById("trackItemTemplate").content.firstElementChild.cloneNode(true);
            newTrackElement.querySelector(".video-title").textContent = url;
            newTrackElement.querySelector(".user-badge").textContent = "[" + userName + "]";
            newTrackElement.dataset.videoId = url.match(/youtube.com\/watch\?v=(.*)&?/)[1].split("&")[0];
        return newTrackElement;
    }

    var urlInput = document.getElementById("videoURLInput");
    var addVideoButton = document.getElementById("addVideoBtn");

    document.getElementById("trackAddForm").addEventListener("submit", function addToPlaylist(event) {
        event.preventDefault();
        var videoURL = urlInput.value;
        
        if (videoURL) {
            socket.emit("add track", {url: videoURL, addedBy: userName});
        }
    });

    document.getElementById("playBtn").addEventListener("click", function playBtnClickHandler(event) {
        var isPaused = player.getPlayerState() == 2;
        var isPlaying = player.getPlayerState() == 1;
        if (isPaused) {
            player.playVideo();
        } else if (!isPlaying) {
            player.loadVideoById(trackList.children[currentTrackIndex].dataset.videoId);
            selectTrack(currentTrackIndex);
        }
    });

    document.getElementById("pauseBtn").addEventListener("click", function pauseBtnClickHandler(event) {
        player.pauseVideo();
    });

    document.getElementById("nextBtn").addEventListener("click", function nextBtnClickHandler(event) {
        if (currentTrackIndex < trackList.children.length - 1) {
            player.loadVideoById(trackList.children[currentTrackIndex + 1].dataset.videoId);
            selectTrack(currentTrackIndex + 1);
        }
    });

    document.getElementById("prevBtn").addEventListener("click", function prevBtnClickHandler(event) {
        if (currentTrackIndex > 0) {
            player.loadVideoById(trackList.children[currentTrackIndex - 1].dataset.videoId);
            selectTrack(currentTrackIndex - 1);
        }
    });

    socket.on('track added', function onTrackAdded(trackData) {
            var newTrackElement = createTrackDOMStructure(trackData.url, trackData.addedBy);
            trackList.appendChild(newTrackElement);
            urlInput.value = "";
            newTrackElement.scrollIntoView();

            if (Notification && Notification.permission == "granted" && userName !== trackData.addedBy) {
                new Notification(trackData.addedBy + " added new track");
            }
    });

    socket.on('track list', function onTrackListRecieved(tracks) {
        trackList.innerHTML = "";
        tracks.forEach(function renderTrack(track) {
            trackList.appendChild(createTrackDOMStructure(track.url, track.addedBy));
        });
        console.log(tracks);
    });
})();