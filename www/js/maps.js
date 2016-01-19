(function(){
  var path = require("path");

  TCHE.addMap = function(name, type) {
    var data = [];
    data.push(name);
    data.push(type);

    TCHE.addRowToTable('maps-table', data, 'maps', name);
  };

  TCHE.loadMaps = function() {
    if (!TCHE.gameData.maps) {
      return;
    }

    for (var name in TCHE.gameData.maps) {
      TCHE.addMap(name, TCHE.gameData.maps[name]);
    }
  };

  TCHE.continueNewMap = function () {
    var type = $('#mapType').val();
    var windowName = 'new-map-' + type;

    TCHE.openWindow(windowName);
  };

  TCHE.continueImportMap = function() {
    var type = $('#mapType').val();
    var windowName = 'import-map-' + type;

    TCHE.openWindow(windowName);
  };

  TCHE.removeMap = function(mapName) {
    delete TCHE.gameData.maps[mapName];
    TCHE.markAsModified();
  };

  TCHE.viewMapImage = function(mapName) {
    var image = TCHE.gameData.maps[mapName].image;
    var imagePath = path.join(TCHE.loadedGame.folder, image);

    TCHE.openDialog($('<div><img src="' + imagePath + '"></img></div>'), image);
  };

  TCHE.editMap = function(mapName) {
    if (!TCHE.gameData.maps[mapName]) {
      throw new Error("Map " + mapName + " not found.");
    }

    var mapType = TCHE.gameData.maps[mapName];
    switch (mapType) {
      case 'tiled' :
        TCHE.editTiledMap(mapName);
        break;
    }
  };

  TCHE.fillMaps = function(selectId) {
    var element = $('#' + selectId);
    element.html('');

    var maps = TCHE.gameData.maps;
    for (var key in maps) {
      element.append('<option value="' + key + '">' +  key + '</option>');
    }
  };
})();