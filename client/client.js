// Initialize the socket
const socket = io();

// User name
let username = "Anon";

// Get the controls
const send_button = document.querySelector('#send-message-button');
const message_input = document.querySelector('#message-input');
const user_list = document.querySelector('#user-list');
const chat_window = document.querySelector('#chat-window');

// The list of users
const connected_users = [];

// Handle socket stuff
socket.on('message', data => {
  const type = data[0];

  switch (type) {
    case 0:
      // Server requests info - send it
      socket.send([0, username]);
      break;
    case 1:
      handleMessage(data[1]);
      break;
    case 2:
      // Get info about a user and add to list
      connected_users.push(data[1]);
      refreshUserList();
      break;
    case 3:
      // Remove a user that has left the chat
      connected_users.splice(data[1], 1);
      refreshUserList();
      break;
  }
});

function refreshUserList () {
  user_list.innerHTML = '';

  for (let i = 0; i < connected_users.length; i++) {
    const li = document.createElement('li');
    li.appendChild(document.createTextNode(connected_users[i].name));
    user_list.appendChild(li);
  }
}

function sendMessage (message) {
  if (message.trim() == '') {
    return;
  }

  const packet = [1, message.trim()];
  socket.send(packet);
}

function handleMessage (message) {
  const text = connected_users[message.user_id].name + ': ' + message.message;

  const entry = document.createElement('div');
  entry.classList.add('chat-message');

  const h = document.createElement('h4');
  h.appendChild(document.createTextNode(connected_users[message.user_id].name));

  const p = document.createElement('p');
  p.appendChild(document.createTextNode(message.message));

  entry.appendChild(h);
  entry.appendChild(p);
  chat_window.appendChild(entry);

  // Scroll to bottom if we haven't scrolled up
  if (!scrolled_up) {
    chat_window.scrollTop = (chat_window.scrollHeight - chat_window.offsetHeight);
  }
}

// Has the user scrolled away from the bottom of the chat window?
let scrolled_up = false;

// Add some event listeners to the controls
send_button.addEventListener('click', event => {
  event.preventDefault();

  sendMessage(message_input.value);
  message_input.value = '';
});

message_input.addEventListener('keypress', event => {
  if (event.keyCode != 13) {
    return;
  }
  event.preventDefault();

  sendMessage(message_input.value);
  message_input.value = '';
});

chat_window.addEventListener('scroll', event => {
  if (chat_window.scrollTop === (chat_window.scrollHeight - chat_window.offsetHeight)) {
    scrolled_up = false;
  }else{
    scrolled_up = true;
  }
});
