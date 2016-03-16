
var app = {};

app.server = 'https://api.parse.com/1/classes/messages';

app.cache = {};

app.rooms = [];
app.userRooms = ['All', 'Add a Room'];

app.friends = [];

app.init = function () {

  // Event Listeners
  $(document).on('click', '.username', function() {
    app.addFriend($(this));
  });

  $(document).on('click', '.submit', function() {
    var message = $('.message').val();
    app.handleSubmit(message);
    if ($('option:selected').hasClass('add')) { // if you're adding a new room
      $('.add').prop('selected', false); // deselect the add room option
      $('option').each(function() { if ($(this).text() === message) { $(this).prop('selected', true); } }); // iterate through options and select newly created room
      $('select').trigger('change');
    }
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
      $('.message').attr('placeholder', 'Enter room name...');
    } else { // the case where you are switching to a non-"Add Room" room
      $('.message').removeClass('room');
      $('.send').animate({width: '70%'});
      $('#roomSelect').animate({left: '30px'});
      $('.message').attr('placeholder', 'Write your message here...');
      app.fetch();
    }
  });

  app.fetch();
  setInterval(app.fetch, 2000);
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
      // get a filtered array based on our current room
      var filter = data.results.filter(function(message) {
        // if current room is 'All', everything passes filter test
        if ($('select :selected').text() === 'All') {
          return true;
        }
        // otherwise, see if message's room name matches current room
        return message.roomname === $('select :selected').text();
      });
      // iterate through length of filter array and checking that messages array has length less than 10
      for (var j = 0; j < filter.length && messages.length < 10; j++) {
        messages.push(filter[j]);
      }
      // clear old messages
      app.clearMessages();
      // repopulate with new messages
      for (var message of messages) {
        message.friend = false;
        for (var k = 0; message.friend === false && k < app.friends.length; k++) {
          if (message.username === app.friends[k]) {
            message.friend = true;
          }
        }
        if (!app.cache[message.objectId]) {
          if (message.friend) {
            app.addMessage(message, 'friend');
          } else {
            app.addMessage(message);
          }
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

app.addMessage = function(message, className) {
  className = className || '';
  // cover xss vulnerabilities
  var username = app.escapeHtml(message.username);
  var text = app.escapeHtml(message.text);
  var roomname = app.escapeHtml(message.roomname);
  // add messages to DOM
  $('.chats').append(`<div class="chat ${className}"><span class="username">${username}</span><p>${text}</p></div>`);
  // add message's objectId to cache
  app.cache[message.objectId] = message.objectId;
  // call addRoom on roomname
  app.addRoom(roomname);
};

app.addRoom = function(name, userCreated) {
  // if room is not already in our rooms array, add it
  if (app.rooms.indexOf(name) === -1 && app.userRooms.indexOf(name) === -1) {
    if (userCreated) { // we want to keep user-created rooms
      $('#roomSelect .allRooms').after(`<option>${name}</option>`);
      app.userRooms.push(name);
    } else { // otherwise, give new room two classes: temporary and its own name
      var newClass = `$${name.replace(/\s/g, '')}`;
      $('#roomSelect select').append(`<option class="temporary ${newClass}">${name}</option>`);
      app.rooms.push(name);
    }
  }
};

app.addFriend = function(node) {
  var friend = node.text();
  var alreadyFriends = app.friends.indexOf(friend);
  var thisUser = window.location.href.match(/username=(.+)#?/)[1];
  if (alreadyFriends === -1 && friend !== thisUser) {
    app.friends.push(friend);
  } else {
    app.friends.splice(alreadyFriends, 1);
  }
  app.fetch();
};

app.handleSubmit = function(message) {
  if ($('.room').length) { // if the input field is currently for adding a room
    var roomName = $('.room').val();
    app.addRoom(roomName, true);
    $('.buttonText').fadeOut('fast', function() { 
      $(this).text('Success!').fadeIn('fast', function() {
        $(this).fadeOut('fast', function() { $(this).text('Post').fadeIn('fast'); });
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

// escapeHtml, courtesy of Mustache.js
// Replaces certain characters with their HTML entity
app.escapeHtml = function(string) {
  return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap(s) {
    return app.entityMap[s];
  });
};

app.entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};
