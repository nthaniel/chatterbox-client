
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
    success: function () {
      app.fetch();
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
      app.clearMessages();
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
  $('.chats').children().remove();
  app.cache = {};
};

app.addMessage = function(message) {
  var username = escapeHtml(message.username);
  var text = escapeHtml(message.text);
  var roomname = escapeHtml(message.roomname);
  $('.chats').append('<div class="chat"><span class="username">' + username + '</span>' + '<p>' + text + '</p></div>');
  app.cache[message.objectId] = message.objectId;
};

app.addRoom = function(name) {
  $('#roomSelect select').append('<option>' + name + '</option>');
};

app.addFriend = function(node) {
  console.log(node.text() + ' has been triggered');
};

app.handleSubmit = function(message) {
  if ($('.room').length) {
    var roomName = $('.room').val();
    app.addRoom(roomName);
    $('.buttonText').fadeOut('fast', function() { 
      $(this).text('Success!').fadeIn('fast', function() {
        $(this).fadeOut('fast', function() { $(this).text('Add room').fadeIn('fast'); });
      }); });
  } else {
    var roomName = $('select :selected').text();
    var matched = window.location.href.match(/username=(.+)#?/) || ['', 'anonymous'];
    var ourUsername = matched[1];
    app.send({
      username: ourUsername,
      text: message,
      roomname: roomName
    });
  }
};

// Event Listeners
$(document).on('ready', app.fetch);

$(document).on('click', '.username', function() {
  app.addFriend($(this));
});

$(document).on('click', '.submit', function() {
  var message = $('.message').val();
  app.handleSubmit(message);
  $('.message').val('');
});

$(document).on('submit', '.send', (function(e) {
  e.preventDefault();
  $('.submit').trigger('click');
}));

$(document).on('change', 'select', function() {
  if ($('option:selected').hasClass('add')) {
    $('.message').addClass('room');
    $('.send').animate({width: '20%'});
    $('#roomSelect').animate({left: '30px'});
    $('.buttonText').text('Add room');
  } else {
    $('.message').removeClass('room');
    $('.send').animate({width: '70%'});
    $('#roomSelect').animate({left: '30px'});
    $('.buttonText').text('Post');
  }
});


setInterval(app.fetch, 2000);

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
