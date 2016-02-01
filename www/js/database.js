STUDIO.DatabaseManager = {};

(function(namespace){
  var gui = require('nw.gui');
  var path = require('path');

  namespace._dbWindow = null;

  namespace.adjustDatabaseWindow = function() {
    var subWindow = namespace._dbWindow.window;
    var body = subWindow.document.body;

    $(body).find('.database-option-list').height(subWindow.innerHeight);
    $(body).find('#database-wrapper').height(subWindow.innerHeight);
  };

  namespace.openDatabaseWindow = function() {
    if (!!namespace._dbWindow) {
      namespace._dbWindow.focus();
      return;
    }

    namespace._dbWindow = gui.Window.open('/pages/windows/database.html', {
      title : 'Database',
      toolbar : true,
      width : 1000,
      height : 600,
      min_width : 1000,
      min_height : 600
    });

    namespace._dbWindow.on('close', function(){
      namespace._dbWindow.close(true);
      namespace._dbWindow = null;
    });

    namespace._dbWindow.on('loaded', function(){
      namespace._dbWindow.window.STUDIO = STUDIO;

      var db = namespace._dbWindow.window.Database;

      namespace._dbWindow.window.addEventListener('resize', function(){
        namespace.adjustDatabaseWindow();
      });

      namespace.adjustDatabaseWindow();
      db.onLoad();

      delete namespace._dbWindow._events.loaded;
    });
  };

})(STUDIO.DatabaseManager);
