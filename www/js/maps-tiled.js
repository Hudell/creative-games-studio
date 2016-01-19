(function(){
  var path = require("path");

  TCHE.saveNewTiledMap = function() {
    var mapName = $('#new-tiled-map-name').val();
    if (!mapName || !mapName.trim) {
      throw new Error("You need to give this map a name.");
    }

    if (TCHE.gameData.maps[mapName] !== undefined) {
      throw new Error("A Map called " + mapName + " already exists.");
    }

    TCHE.gameData.maps[mapName] = 'tiled';

    TCHE.markAsModified();
    TCHE.editTiledMap(mapName);
    // TCHE.openWindow('maps');
  };

  TCHE.saveOldTiledMap = function(){
    var mapName = $('#edit-tiled-map-name').val();
    if (!mapName || !mapName.trim) {
      throw new Error("I forgot what map you were modifying. Try again.");
    }

    var data = TCHE.gameData.maps[mapName];
    if (!data) {
      throw new Error("I couldn't find the existing map data.");
    }

    TCHE.gameData.maps[mapName] = 'tiled';

    TCHE.markAsModified();
    TCHE.openWindow('maps');
  };

  TCHE.loadTiledMapData = function(mapName) {
    var mapData = TCHE.gameData.maps[mapName];
    
    $('#edit-tiled-map-name').val(mapName);
  };

  TCHE.editTiledMap = function(mapName) {
    TCHE.openWindow('edit-map-tiled', function(){
      TCHE.loadTiledMapData(mapName);
    });
  };
})();