(function(){
  var path = require("path");
  var fs = require('fs');

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

  TCHE.doContinueImportMap = function(type, filePath) {
    try {
      var mapData = TCHE.loadJson(filePath);
    }
    catch (e) {
      console.error(e);
      throw new Error("Failed to parse map data.");
    }

    var fileFolder = path.dirname(filePath);

    try {
      switch(type) {
        case 'tiled' :
          TCHE.importTiledMapTilesets(mapData, fileFolder);
          break;
      }
    }
    catch(e) {
      console.error(e);
      throw new Error("Failed to import map tilesets.");
    }

    var mapName = path.basename(filePath);

    try {
      TCHE.saveJson(path.join(TCHE.loadedGame.folder, 'maps', mapName), mapData);
    }
    catch(e) {
      console.error(e);
      throw new Error("Failed to save the map.");
    }

    TCHE.gameData.maps[mapName] = type;
    TCHE.markAsModified();
    TCHE.openWindow('maps');
  };

  TCHE.continueImportMap = function() {
    var type = $('#mapType').val();
    var filePath = $('#import-map-file').val();

    if (!filePath || !filePath.trim()) {
      throw new Error("Please select a map file to import.");
    }

    var mapName = path.basename(filePath);

    if (TCHE.gameData.maps[mapName] !== undefined) {
      TCHE.confirm('A map called ' + mapName + ' already exists. If you continue, it will be overwritten.', function(){
        TCHE.doContinueImportMap(type, filePath);
      });
    } else {
      TCHE.doContinueImportMap(type, filePath);
    }
  };

  TCHE.removeCurrentMap = function() {
    var name = $('#edit-tiled-map-name').val();
    TCHE.removeMap(name);
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
    element.append('<option value=""></option>');

    var maps = TCHE.gameData.maps;
    for (var key in maps) {
      element.append('<option value="' + key + '">' +  key + '</option>');
    }
  };

  TCHE.fillMapLinks = function(ulId) {
    var element = $('#' + ulId);
    element.html('');

    var maps = TCHE.gameData.maps;
    for (var key in maps) {
      element.append('<li><a class="recent-link" data-type="map" data-name="' + key + '" href="#"><i class="menu-option fa fa-globe fa-fw"></i> ' + key + '</a></li>');
    }
  };

  TCHE.getMapData = function(mapName) {
    return TCHE.loadJson(path.join(TCHE.loadedGame.folder, 'maps', mapName));
  };

  TCHE.saveMapData = function(mapName, mapData) {
    TCHE.saveJson(path.join(TCHE.loadedGame.folder, 'maps', mapName), mapData);
    TCHE.addRecentObject('map', mapName);
  }
})();