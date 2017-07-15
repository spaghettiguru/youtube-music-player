import {RenderableMediaTrack} from 'babel-loader!./MediaTrack.js';

var trackList = document.getElementById("trackList");
var currentTrackIndex = 0;

export function addTrack(title, id, addedBy, scrollToAddedItem) {
    var newTrack = new RenderableMediaTrack(title, addedBy, id);
    var newTrackDOM = newTrack.render();
    trackList.appendChild(newTrackDOM);

    if (scrollToAddedItem) {
        newTrackDOM.scrollIntoView();
    }

    return newTrackDOM;
}

export function selectTrack(trackNumber) {
    //if (trackNumber !== currentTrackIndex) {
    trackList.children[currentTrackIndex].classList.remove("selected");
    currentTrackIndex = trackNumber;
    trackList.children[trackNumber].classList.add("selected");
    //}
}

export function getCurrentTrackIndex() {
    return currentTrackIndex;
}

export function getTotalTracks() {
    return trackList.children.length;
}

export function getTrackByIndex(index) {
    return trackList.children[index];
}

export default {
    addTrack,
    currentTrackIndex,
    selectTrack,
    getTotalTracks,
    getTrackByIndex,
    getCurrentTrackIndex
}