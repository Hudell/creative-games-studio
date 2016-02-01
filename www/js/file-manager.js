STUDIO.FileManager = {};

(function(namespace){
  var gui = require('nw.gui');
  var path = require('path');

  namespace.openFileManagerWindow = function() {
    STUDIO.openWindow(path.join('windows', 'file-manager'), function(){

    });
  };

  namespace.attachEvents = function() {
    $('#skins-btn').on('click', function(event) { namespace.eventOpenWindow(event, 'skins', 'skins'); });
  };  

  namespace.eventOpenWindow = function(event, folderName, windowName) {
    event.preventDefault();
    namespace.openWindow(folderName, windowName);
  };

  namespace.openWindow = function(folder, windowName, callback) {
    var fileName = path.join('file-manager', folder, windowName + '.html');

    STUDIO.requestPage(fileName, function(result, xhr){
      namespace._windowName = windowName;

      var html = xhr.responseText;

      $('#file-manager-wrapper').html(html);
      $('#file-manager-wrapper').height(window.innerHeight - 52);

      if (!!callback) {
        callback();
      }
    });
  };
})(STUDIO.FileManager);
