// EscapeHtml, courtesy of Mustache.js
// Replaces certain characters with their HTML entity
function escapeHtml(string) {
  return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap(s) {
    return entityMap[s];
  });
}

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

// Initialize app object
var app = {
  init: function() {},

  // submits a POST request via $.ajax
  send: function() {

  },

  // submits a GET request via $.ajax
  fetch: function() {}
};