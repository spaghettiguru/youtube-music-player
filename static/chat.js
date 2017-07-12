var chatForm = document.getElementById("chatForm");
var messageInput = document.getElementById("messageInput");
var chatMessagesContainer = document.getElementById("chatMessages");
var sendMessageCallback = function() {};

chatForm.addEventListener("submit", function(event) {
        event.preventDefault();

        var message = messageInput.value;

        if (message) {
            sendMessageCallback(message);
            messageInput.value = "";
        }
    });

export function onSendMessage(callback) {
    sendMessageCallback = callback;
}

export function addMessage(message, userName) {
    var newMessageDOM = document.getElementById("chatMessageTemplate").content.firstElementChild.cloneNode(true);
        newMessageDOM.querySelector(".chat-user-name").textContent = userName;
        newMessageDOM.querySelector(".message-text").textContent = message;
        chatMessagesContainer.appendChild(newMessageDOM);
}

export default {
    onSendMessage,
    addMessage
}