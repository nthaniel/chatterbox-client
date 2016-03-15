
var app = {};

app.server = 'https://api.parse.com/1/classes/messages';

app.cache = {};

app.rooms = [];
app.userRooms = [];

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
      var messages = [];
      var filter = data.results.filter(function(message) {
        if ($('select :selected').text() === 'All') {
          return true;
        }
        return message.roomname === $('select :selected').text();
      });
      for (var j = 0; j < filter.length && messages.length < 10; j++) {
        messages.push(filter[j]);
      }
      app.clearMessages();
      for (var i = 0; i < messages.length; i++) {
        var message = messages[i];
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
  while (app.rooms.length > 20) { // if rooms has more than 20, remove first items until only 20 are there
    var toRemove = app.rooms.shift();
    $('select .temporary .' + toRemove).remove();
  }
};

app.addMessage = function(message) {
  // cover xss vulnerabilities
  var username = escapeHtml(message.username);
  var text = escapeHtml(message.text);
  var roomname = escapeHtml(message.roomname);
  // add messages to DOM
  $('.chats').append('<div class="chat"><span class="username">' + username + '</span>' + '<p>' + text + '</p></div>');
  // add message's objectId to cache
  app.cache[message.objectId] = message.objectId;
  // call addRoom on roomname
  app.addRoom(roomname);
};

app.addRoom = function(name, userCreated) {
  // if room is not already in our rooms array, add it
  if (app.rooms.indexOf(name) === -1 && app.userRooms.indexOf(name) === -1) {
    if (userCreated) { // we want to keep user-created rooms
      $('#roomSelect .allRooms').after('<option>' + name + '</option>');
      app.userRooms.push(name);
    } else { // otherwise, give new room two classes: temporary and its own name
      var newClass = '$' + name.replace(/\s/g, '');
      $('#roomSelect select').append('<option class="temporary ' + newClass + '">' + name + '</option>');
      app.rooms.push(name);
    }
  }
};

app.addFriend = function(node) {
  console.log(node.text() + ' has been triggered');
};

app.handleSubmit = function(message) {
  if ($('.room').length) { // if the input field is currently for adding a room
    var roomName = $('.room').val();
    app.addRoom(roomName, true);
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
  } else { // the case where you are switching to a non-"Add Room" room
    $('.message').removeClass('room');
    $('.send').animate({width: '70%'});
    $('#roomSelect').animate({left: '30px'});
    $('.buttonText').text('Post');
    app.fetch();
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
