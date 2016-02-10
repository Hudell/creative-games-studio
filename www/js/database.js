STUDIO.DatabaseManager = {};

(function(namespace){
  var gui = require('nw.gui');
  var path = require('path');

  namespace.openDatabaseWindow = function() {
    STUDIO.openWindow(path.join('windows', 'database'), function(){

    });
  };

  namespace.attachEvents = function() {
    $('#achievements-btn').on('click', function(event) { namespace.eventOpenWindow(event, 'achievements', 'achievements'); });
    $('#animations-btn').on('click', function(event) { namespace.eventOpenWindow(event, 'animations', 'animations'); });
    $('#characters-btn').on('click', function(event) { namespace.eventOpenWindow(event, 'characters', 'characters'); });
    $('#classes-btn').on('click', function(event) { namespace.eventOpenWindow(event, 'classes', 'classes'); });
    $('#enemies-btn').on('click', function(event) { namespace.eventOpenWindow(event, 'enemies', 'enemies'); });
    $('#faces-btn').on('click', function(event) { namespace.eventOpenWindow(event, 'faces', 'faces'); });
    $('#game-settings-btn').on('click', function(event) { namespace.eventOpenWindow(event, 'game-settings', 'game-settings'); });
    $('#huds-btn').on('click', function(event) { namespace.eventOpenWindow(event, 'huds', 'huds'); });
    $('#icons-btn').on('click', function(event) { namespace.eventOpenWindow(event, 'icons', 'icons'); });
    $('#items-btn').on('click', function(event) { namespace.eventOpenWindow(event, 'items', 'items'); });
    $('#languages-btn').on('click', function(event) { namespace.eventOpenWindow(event, 'languages', 'languages'); });
    $('#movies-btn').on('click', function(event) { namespace.eventOpenWindow(event, 'movies', 'movies'); });
    $('#music-btn').on('click', function(event) { namespace.eventOpenWindow(event, 'music', 'music'); });
    $('#packages-btn').on('click', function(event) { namespace.eventOpenWindow(event, 'packages', 'packages'); });
    $('#player-settings-btn').on('click', function(event) { namespace.eventOpenWindow(event, 'player-settings', 'player-settings'); });
    $('#objects-btn').on('click', function(event) { namespace.eventOpenWindow(event, 'objects', 'objects'); });
    $('#skills-btn').on('click', function(event) { namespace.eventOpenWindow(event, 'skills', 'skills'); });
    $('#skins-btn').on('click', function(event) { namespace.eventOpenWindow(event, 'skins', 'skins'); });
    $('#sounds-btn').on('click', function(event) { namespace.eventOpenWindow(event, 'sounds', 'sounds'); });
    $('#sprites-btn').on('click', function(event) { namespace.eventOpenWindow(event, 'sprites', 'sprites'); });
    $('#states-btn').on('click', function(event) { namespace.eventOpenWindow(event, 'states', 'states'); });
    $('#tilesets-btn').on('click', function(event) { namespace.eventOpenWindow(event, 'tilesets', 'tilesets'); });
    $('#variables-btn').on('click', function(event) { namespace.eventOpenWindow(event, 'variables', 'variables'); });
    $('#vehicles-btn').on('click', function(event) { namespace.eventOpenWindow(event, 'vehicles', 'vehicles'); });
  };  

  namespace.eventOpenWindow = function(event, folderName, windowName) {
    event.preventDefault();
    namespace.openWindow(folderName, windowName);
  };

  namespace.openWindow = function(folder, windowName, callback) {
    var fileName = path.join('database', folder, windowName + '.html');

    STUDIO.requestPage(fileName, function(result, xhr){
      namespace._windowName = windowName;

      var html = xhr.responseText;

      $('#database-wrapper').html(html);
      $('#database-wrapper').height(window.innerHeight - 52);

      STUDIO.applyTranslation();

      if (!!callback) {
        callback();
      }
    });
  };
})(STUDIO.DatabaseManager);
