
var app = {};

app.server = 'https://api.parse.com/1/classes/messages';

app.init = function () {

};

app.send = function(message) {
  $.ajax({
    url: 'https://api.parse.com/1/classes/messages',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      console.error('chatterbox: failed to POST');
    }
  });
};

app.fetch = function() {
  $.ajax({
    url: 'https://api.parse.com/1/classes/messages',
    type: 'GET',
    data: '',
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message received', data);
    },
    error: function () {
      console.error('chatterbox: failed to GET');
    }
  });
};

app.clearMessages = function() {
  $('#chats').children().remove();
};

app.addMessage = function(message) {
  var username = message.username;
  var text = message.text;
  var roomname = message.roomname;
  $('#chats').append('<div><span class="username">' + username + '</span>' + '<p>' + text + '</p></div>');
};

app.addRoom = function(name) {
  $('#roomSelect').append('<p>' + name + '</p>');
};

app.addFriend = function(node) {
  console.log(node.text() + ' has been triggered');
};

app.handleSubmit = function(message) {
  app.send(message);
};

// Event Listeners
$(document).on('click', '.username', function() {
  app.addFriend($(this));
});

$(document).on('submit', '.submit', function() {
  var message = $('#message').val();
  app.handleSubmit(message);
});

// escapeHtml, courtesy of Mustache.js
// Replaces certain characters with their HTML entity
var escapeHtml = function(string) {
  return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap(s) {
    return entityMap[s];
  });
};

var entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};
