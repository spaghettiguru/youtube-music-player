    import playlist from './playlist.js';
    import chat from './chat.js';

    var userName = window.prompt("What's your name?", "anonymous");
    var userNameElement = document.getElementById("userName");
    userNameElement.textContent = userName;

    if (window.Notification && Notification.permission !== "granted") {
        Notification.requestPermission();
    }

    const socket = io({
        query: {
            userName: userName
        }
        //transports: ['websocket']
    });

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
        var currentTrackIndex = playlist.getCurrentTrackIndex();
        if (event.data == YT.PlayerState.ENDED && trackList.children.length - 1 > currentTrackIndex) {
            player.loadVideoById(trackList.children[currentTrackIndex + 1].dataset.videoId);
            playlist.selectTrack(currentTrackIndex + 1);
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

        var videoId = trackItem.dataset.videoId;
        if (videoId) {
            player.loadVideoById(trackItem.dataset.videoId);
            playlist.selectTrack(Array.from(trackList.children).indexOf(trackItem));
        }
    });

    var urlInput = document.getElementById("videoURLInput");
    var addVideoButton = document.getElementById("addVideoBtn");

    document.getElementById("trackAddForm").addEventListener("submit", function addToPlaylist(event) {
        event.preventDefault();
        var videoID = urlInput.value.match(/youtube.com\/watch\?v=(.*)&?/)[1].split("&")[0];
        
        if (videoID) {
            socket.emit("add track", {url: videoID, addedBy: userName});
        }
    });

    document.getElementById("playBtn").addEventListener("click", function playBtnClickHandler(event) {
        var isPaused = player.getPlayerState() == 2;
        var isPlaying = player.getPlayerState() == 1;
        if (isPaused) {
            player.playVideo();
        } else if (!isPlaying) { // play button pressed for the first time
            var currentTrackIndex = playlist.getCurrentTrackIndex();
            player.loadVideoById(trackList.children[currentTrackIndex].dataset.videoId);
            playlist.selectTrack(currentTrackIndex);
        }
    });

    document.getElementById("pauseBtn").addEventListener("click", function pauseBtnClickHandler(event) {
        player.pauseVideo();
    });

    document.getElementById("nextBtn").addEventListener("click", function nextBtnClickHandler(event) {
        var currentTrackIndex = playlist.getCurrentTrackIndex();
        if (currentTrackIndex < trackList.children.length - 1) {
            player.loadVideoById(trackList.children[currentTrackIndex + 1].dataset.videoId);
            playlist.selectTrack(currentTrackIndex + 1);
        }
    });

    document.getElementById("prevBtn").addEventListener("click", function prevBtnClickHandler(event) {
        var currentTrackIndex = playlist.getCurrentTrackIndex();
        if (currentTrackIndex > 0) {
            player.loadVideoById(trackList.children[currentTrackIndex - 1].dataset.videoId);
            playlist.selectTrack(currentTrackIndex - 1);
        }
    });

    socket.on('track added', function onTrackAdded(trackData) {
            var newTrackElement = playlist.addTrack(null, trackData.url, trackData.addedBy, true);
            urlInput.value = "";

            getVideosInfoByIds(newTrackElement.dataset.videoId).then(function(videos) {
                newTrackElement.querySelector(".video-title").textContent = videos[0].snippet['title'];
            });

            if (Notification && Notification.permission == "granted" && userName !== trackData.addedBy) {
                new Notification(trackData.addedBy + " added new track");
            }
    });

    socket.on('track list', function onTrackListRecieved(tracks) {
        trackList.innerHTML = "";
        tracks.forEach(function renderTrack(track) {
            playlist.addTrack(null, track.url, track.addedBy, false);
        });
        youtubeAPIReady.then(getAllTracksNames);
    });

    function getAllTracksNames() {
        var trackIDs = [];
        for (let i = 0; i < trackList.children.length; i++) {
            trackIDs.push(trackList.children[i].dataset.videoId);
        }

        getVideosInfoByIds(trackIDs).then(function(videos) {
            for (let i = 0; i < videos.length; i++) {
                var track = trackList.querySelector('[data-video-id="' + videos[i].id + '"]');
                if (track) {
                    track.querySelector(".video-title").textContent = videos[i].snippet['title'];
                }
            }
        });
    }

    function getVideosInfoByIds(videoId) {
        if (Array.isArray(videoId)) {
            videoId = videoId.join(",");
        }
        return gapi.client.youtube.videos.list({
                id: videoId,
                part: 'snippet'
            }).then(function(response) {
                return response.result.items;
            });
    }

    var youtubeAPIReady = new Promise(function(resolve, reject) {
        function start() {
            gapi.client.init({
                'apiKey': 'AIzaSyAQUcx5pxoeQK5RRxUtKeKyPfKrcEZwkJI',
                'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
            }).then(function() {
                resolve();
            });
        }

        gapi.load('client', start);
    });

    function closeSearchDropdown(event) {
        if (event.key == "Escape") {
                            searchResultsList.innerHTML = "";
                            searchResultsList.classList.remove("is-open");
                            window.removeEventListener("keyup", closeSearchDropdown);
                        };
    }

    var searchForm = document.getElementById("searchForm");
    var searchResultsList = document.getElementById("searchResults");
    searchForm.addEventListener("submit", function(event) {
        event.preventDefault();
        var searchPhrase = document.getElementById("searchInput").value;
        if (searchPhrase) {
            var request = gapi.client.youtube.search.list({
                q: searchPhrase,
                part: 'snippet'
            });
            request.execute(function(response) {
                if (response.result) {
                    searchResultsList.classList.add("is-open");
                    window.addEventListener("keyup", closeSearchDropdown);

                    response.result.items.forEach(function(resultItem) {
                        var resultItemDOM = document.getElementById("searchResultTemplate").content.firstElementChild.cloneNode(true);
                        resultItemDOM.querySelector(".track-thumbnail").src = resultItem.snippet.thumbnails.medium.url;
                        resultItemDOM.querySelector(".track-info").textContent = resultItem.snippet.title;
                        resultItemDOM.querySelector(".add-to-playlist").addEventListener("click", function(event) {
                            event.stopPropagation();
                            socket.emit("add track", {url: resultItem.id.videoId, addedBy: userName});
                            //playlist.addTrack(resultItem.snippet.title, resultItem.id.videoId, userName, true);
                            searchResultsList.classList.remove("is-open");
                        });
                        searchResultsList.appendChild(resultItemDOM);
                    });
                }
            });
        }
    });

    chat.onSendMessage(function(message) {
        socket.emit("chat message", message);
    });

    socket.on('chat message', function(data) {
        chat.addMessage(data.message, data.userName);
    });