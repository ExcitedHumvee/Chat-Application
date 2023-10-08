//with strict variable types have to be defined, global this not allowed etc.
'use strict';

var usernamePage = document.querySelector('#username-page');//selecting by id
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');

var stompClient = null;//websocket
var username = null;

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function connect(event) {//to connect a user
    //establishing a WebSocket connection when a user attempts to join the chat
    username = document.querySelector('#name').value.trim();

    if(username) {
        //classList property is part of the DOM (Document Object Model) API, and it represents the class attribute of an element as a space-separated string. It provides methods (add, remove, toggle, etc.) for easily manipulating the classes of an element
        //This line adds the class 'hidden' to the usernamePage element
        //to apply CSS styles that hide or make the element invisible
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        //creates a new instance of the SockJS object, which provides a WebSocket-like interface with fallback options for browsers that do not support WebSocket directly.
        var socket = new SockJS('/ws');
        //create a Stomp client over the SockJS socket
        stompClient = Stomp.over(socket);

        //attempt to connect to the WebSocket server using the connect method of the StompClient, providing callbacks (onConnected and onError) for handling successful connections and errors, respectively.
        stompClient.connect({}, onConnected, onError);//{} means no options
    }
    //prevent the default form submission behavior, as the connection process is handled asynchronously via WebSocket, and a full page reload is not desired.
    event.preventDefault();
}


function onConnected() {
    // Subscribe to the Public Topic
    stompClient.subscribe('/topic/public', onMessageReceived);

    // Tell your username to the server
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    )

    connectingElement.classList.add('hidden');
}


function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}


function sendMessage(event) {
    var messageContent = messageInput.value.trim();
    if(messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));//{} means no options
        messageInput.value = '';
    }
    event.preventDefault();
}


function onMessageReceived(payload) {
    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');//creating new list item

    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined!';
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left!';
    } else {
        messageElement.classList.add('chat-message');

        var avatarElement = document.createElement('i');//italic or icon
        var avatarText = document.createTextNode(message.sender[0]);//first name only
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    var textElement = document.createElement('p');
    var messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);

    messageElement.appendChild(textElement);

    messageArea.appendChild(messageElement);
    //scroll to bottoem
    messageArea.scrollTop = messageArea.scrollHeight;
}


function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
}

usernameForm.addEventListener('submit', connect, true)//when the user submits the form
messageForm.addEventListener('submit', sendMessage, true)