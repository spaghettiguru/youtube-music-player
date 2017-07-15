export class MediaTrack {
    constructor(title, addedBy, mediaObjID) {
        this.title = title;
        this.playbackToken = mediaObjID;
        this.addedBy = addedBy;
        this.source = "youtube";
    }
}

export class RenderableMediaTrack extends MediaTrack {
    constructor(title, addedBy, url) {
        super(title, addedBy, url);
    }

    createDOMStructure(url, userName, title) {
        var newTrackElement = document.getElementById("trackItemTemplate").content.firstElementChild.cloneNode(true);
        newTrackElement.querySelector(".video-title").textContent = title ? title : url;
        newTrackElement.querySelector(".user-badge").textContent = "[" + userName + "]";
        newTrackElement.dataset.videoId = this.playbackToken;
        return newTrackElement;
    }

    render() {
        if (!this.domRef) {
            this.domRef = this.createDOMStructure(this.playbackToken, this.addedBy, this.title);
        }

        return this.domRef;
    }
}

export default {MediaTrack, RenderableMediaTrack};