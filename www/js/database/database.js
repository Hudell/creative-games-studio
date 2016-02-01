var Database = {};

(function(){
  var gui = require('nw.gui');
  var path = require('path');

  Database._dbWindow = null;

  Database.eventOpenWindow = function(event, windowName) {
    event.preventDefault();
    Database.openWindow(windowName);
  };

  Database.requestPage = function(pageName, onSuccess, onError) {
    var mimeType = "text/html";
    var filePath = path.join('..', 'database', pageName);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', filePath);
    if (mimeType && xhr.overrideMimeType) {
      xhr.overrideMimeType(mimeType);
    }
    xhr.onload = function(result){
      if (xhr.status < 400) {
        onSuccess.call(this, result, xhr);
      } else {
        if (!!onError) {
          onError.call(this);
        }
      }
    };
    xhr.onerror = onError;
    xhr.send();
  };

  Database.openWindow = function(windowName, callback) {
    var fileName = windowName + '.html';

    Database.requestPage(fileName, function(result, xhr){
      Database._windowName = windowName;

      var html = xhr.responseText;

      $('#database-wrapper').html(html);
      $('#database-wrapper').height(window.innerHeight - 52);

      if (!!callback) {
        callback();
      }
    });    
  };

  Database.onLoad = function() {
    Database.attachEvents();
    Database.addScripts();
  };

  Database.addScript = function(fileName) {
    var tag = document.createElement('script');
    tag.src = '../../js/database/' + fileName + '.js';
    document.body.appendChild(tag);
  };

  Database.addScripts = function() {
    Database.addScript('objects');
  };

  Database.attachEvents = function() {
    $('#achievements-btn').on('click', function(event) { Database.eventOpenWindow(event, path.join('achievements', 'achievements')); });
    $('#animations-btn').on('click', function(event) { Database.eventOpenWindow(event, path.join('animations', 'animations')); });
    $('#characters-btn').on('click', function(event) { Database.eventOpenWindow(event, path.join('characters', 'characters')); });
    $('#classes-btn').on('click', function(event) { Database.eventOpenWindow(event, path.join('classes', 'classes')); });
    $('#enemies-btn').on('click', function(event) { Database.eventOpenWindow(event, path.join('enemies', 'enemies')); });
    $('#faces-btn').on('click', function(event) { Database.eventOpenWindow(event, path.join('faces', 'faces')); });
    $('#huds-btn').on('click', function(event) { Database.eventOpenWindow(event, path.join('huds', 'huds')); });
    $('#icons-btn').on('click', function(event) { Database.eventOpenWindow(event, path.join('icons', 'icons')); });
    $('#items-btn').on('click', function(event) { Database.eventOpenWindow(event, path.join('items', 'items')); });
    $('#languages-btn').on('click', function(event) { Database.eventOpenWindow(event, path.join('languages', 'languages')); });
    $('#movies-btn').on('click', function(event) { Database.eventOpenWindow(event, path.join('movies', 'movies')); });
    $('#music-btn').on('click', function(event) { Database.eventOpenWindow(event, path.join('music', 'music')); });
    $('#packages-btn').on('click', function(event) { Database.eventOpenWindow(event, path.join('packages', 'packages')); });
    $('#objects-btn').on('click', function(event) { Database.eventOpenWindow(event, path.join('objects', 'objects')); });
    $('#skills-btn').on('click', function(event) { Database.eventOpenWindow(event, path.join('skills', 'skills')); });
    $('#sounds-btn').on('click', function(event) { Database.eventOpenWindow(event, path.join('sounds', 'sounds')); });
    $('#states-btn').on('click', function(event) { Database.eventOpenWindow(event, path.join('states', 'states')); });
    $('#variables-btn').on('click', function(event) { Database.eventOpenWindow(event, path.join('variables', 'variables')); });
    $('#vehicles-btn').on('click', function(event) { Database.eventOpenWindow(event, path.join('vehicles', 'vehicles')); });
  };

})();
