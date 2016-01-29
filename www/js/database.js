STUDIO.DatabaseManager = {};

(function(namespace){
  var gui = require('nw.gui');

  namespace.openDatabaseWindow = function() {
    var newWin = gui.Window.open('/pages/windows/database.html', {
      title : 'Database',
      toolbar : false,
      min_width : 400,
      min_height : 300,
      "always-on-top" : false
    });
  };

})(STUDIO.DatabaseManager);
