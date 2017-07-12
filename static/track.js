class Track {
    domElement = null;
    id = null;
    title = "";

    constructor(title, addedBy, url) {
        this.domElement = createTrackDOMStructure(url, addedBy, title);
        this.title = title;
    }

    createTrackDOMStructure(url, userName, title) {
        var newTrackElement = document.getElementById("trackItemTemplate").content.firstElementChild.cloneNode(true);
        newTrackElement.querySelector(".video-title").textContent = title ? title : url;
        newTrackElement.querySelector(".user-badge").textContent = "[" + userName + "]";
        this.id = url.match(/youtube.com\/watch\?v=(.*)&?/)[1].split("&")[0];
        newTrackElement.dataset.videoId = this.id;
        return newTrackElement;
    }
}

export default Track;