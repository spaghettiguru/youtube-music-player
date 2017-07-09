/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__playlist_js__ = __webpack_require__(1);
    

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
            var newTrackElement = __WEBPACK_IMPORTED_MODULE_0__playlist_js__["a" /* default */].addItemToPlaylist(null, trackData.url, trackData.addedBy, true);
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
            __WEBPACK_IMPORTED_MODULE_0__playlist_js__["a" /* default */].addItemToPlaylist(null, track.url, track.addedBy, false);
            //trackList.appendChild(playlist.createTrackDOMStructure(track.url, track.addedBy));
        });
        youtubeAPIReady.then(getAllTracksNames);
        console.log(tracks);
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
                            __WEBPACK_IMPORTED_MODULE_0__playlist_js__["a" /* default */].addItemToPlaylist(resultItem.snippet.title, resultItem.id, userName, true);
                        });
                        searchResultsList.appendChild(resultItemDOM);
                    });
                }
            });
        }
    });

    var chatForm = document.getElementById("chatForm");
    var messageInput = document.getElementById("messageInput");
    var chatMessagesContainer = document.getElementById("chatMessages");
    chatForm.addEventListener("submit", function(event) {
        event.preventDefault();

        var message = messageInput.value;

        if (message) {
            socket.emit("chat message", message);
            messageInput.value = "";
        }
    });

    socket.on('chat message', function(data) {
        var newMessageDOM = document.getElementById("chatMessageTemplate").content.firstElementChild.cloneNode(true);
        newMessageDOM.querySelector(".chat-user-name").textContent = data.userName;
        newMessageDOM.querySelector(".message-text").textContent = data.message;
        chatMessagesContainer.appendChild(newMessageDOM);
    });

/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export currentTrackIndex */
/* unused harmony export createTrackDOMStructure */
/* unused harmony export addItemToPlaylist */
var trackList = document.getElementById("trackList");
var currentTrackIndex = 0;

function createTrackDOMStructure(url, userName, title) {
        var newTrackElement = document.getElementById("trackItemTemplate").content.firstElementChild.cloneNode(true);
            newTrackElement.querySelector(".video-title").textContent = title ? title : url;
            newTrackElement.querySelector(".user-badge").textContent = "[" + userName + "]";
            newTrackElement.dataset.videoId = url.match(/youtube.com\/watch\?v=(.*)&?/)[1].split("&")[0];
        return newTrackElement;
    }

function addItemToPlaylist(title, playbackURL, addedBy, scrollToAddedItem) {
        var newTrackElement = createTrackDOMStructure(playbackURL, addedBy, title);
        trackList.appendChild(newTrackElement);

        if (scrollToAddedItem) {
            newTrackElement.scrollIntoView();
        }

        return newTrackElement;
    }

/* harmony default export */ __webpack_exports__["a"] = ({
    createTrackDOMStructure,
    addItemToPlaylist,
    currentTrackIndex
});

/***/ })
/******/ ]);