
var app = {};

app.server = 'https://api.parse.com/1/classes/messages';

app.cache = {};

app.init = function () {

};

app.send = function(message) {
  $.ajax({
    url: 'https://api.parse.com/1/classes/messages',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent', data);
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
      for (var i = 0; i < 10; i++) {
        var message = data.results[i];
        if (!app.cache[message.objectId]) {
          app.addMessage(message);
        }
      }
    },
    error: function () {
      console.error('chatterbox: failed to GET');
    }
  });
};

app.clearMessages = function() {
  $('#chats').children().remove();
  app.cache = {};
};

app.addMessage = function(message) {
  var username = escapeHtml(message.username);
  var text = escapeHtml(message.text);
  var roomname = escapeHtml(message.roomname);
  $('#chats').prepend('<div><span class="username">' + username + '</span>' + '<p>' + text + '</p></div>');
  app.cache[message.objectId] = message.objectId;
};

app.addRoom = function(name) {
  $('#roomSelect').append('<p>' + name + '</p>');
};

app.addFriend = function(node) {
  console.log(node.text() + ' has been triggered');
};

app.handleSubmit = function(message) {
  var ourUsername = window.location.href.match(/username=(.+)#/)[1];
  app.send({
    username: ourUsername,
    text: message
  });
};

// Event Listeners
$(document).on('ready', app.fetch);

$(document).on('click', '.username', function() {
  app.addFriend($(this));
});

$(document).on('click', '.submit', function() {
  console.log('I heard you click that button');
  var message = $('#message').val();
  app.handleSubmit(message);
  $('#message').val('');
});

$(document).on('submit', '#send', (function(e) {
  e.preventDefault();
  $('.submit').trigger('click');
}));

setInterval(app.fetch, 5000);

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
