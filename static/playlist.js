var trackList = document.getElementById("trackList");
export var currentTrackIndex = 0;

export function createTrackDOMStructure(url, userName, title) {
        var newTrackElement = document.getElementById("trackItemTemplate").content.firstElementChild.cloneNode(true);
            newTrackElement.querySelector(".video-title").textContent = title ? title : url;
            newTrackElement.querySelector(".user-badge").textContent = "[" + userName + "]";
            newTrackElement.dataset.videoId = url.match(/youtube.com\/watch\?v=(.*)&?/)[1].split("&")[0];
        return newTrackElement;
    }

export function addTrack(title, playbackURL, addedBy, scrollToAddedItem) {
        var newTrackElement = createTrackDOMStructure(playbackURL, addedBy, title);
        trackList.appendChild(newTrackElement);

        if (scrollToAddedItem) {
            newTrackElement.scrollIntoView();
        }

        return newTrackElement;
    }

export default {
    createTrackDOMStructure,
    addTrack,
    currentTrackIndex
}