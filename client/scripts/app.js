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
  $('#chats').append('<p>' + text + '</p>');
};

app.addRoom = function() {

};












