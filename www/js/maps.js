(function(){
  var path = require("path");
  var fs = require('fs');

  STUDIO.addMap = function(name, type) {
    var data = [];
    data.push(STUDIO.removeFileExtension(name));
    data.push(type);

    STUDIO.addRowToTable('maps-table', data, 'maps', name);
  };

  STUDIO.loadMaps = function() {
    if (!STUDIO.gameData.maps) {
      return;
    }

    for (var name in STUDIO.gameData.maps) {
      STUDIO.addMap(name, STUDIO.gameData.maps[name]);
    }
  };

  STUDIO.continueNewMap = function () {
    var type = $('#mapType').val();
    var windowName = 'new-map-' + type;

    STUDIO.openWindow(windowName);
  };

  STUDIO.checkIfMapNameExists = function(mapName) {
    for (var key in STUDIO.gameData.maps) {
      if (key.toLowerCase() == (mapName.toLowerCase() + '.json')) {
        return true;
      }
    }

    return false;
  };

  STUDIO.importMapTilesets = function(mapData, mapFileFolder) {
    for (var i = 0; i < mapData.tilesets.length; i++) {
      var originalFile = path.join(mapFileFolder, mapData.tilesets[i].image);
      var fileName = path.basename(originalFile);

      var newFileName = path.join(STUDIO.loadedGame.folder, 'assets', 'tilesets', fileName);
      var referencedFileName = path.join('..', 'assets', 'tilesets', fileName);
      mapData.tilesets[i].image = referencedFileName;

      if (fs.existsSync(originalFile)) {
        STUDIO.copyFileSync(originalFile, newFileName);
      }
    }
  };  

  STUDIO.doContinueImportMap = function(type, filePath) {
    try {
      var mapData = STUDIO.loadJson(filePath);
    }
    catch (e) {
      console.error(e);
      throw new Error("Failed to parse map data.");
    }

    var fileFolder = path.dirname(filePath);

    try {
      switch(type) {
        case 'tiled' :
          STUDIO.importTiledMapTilesets(mapData, fileFolder);
          break;
        case 'tche' :
          STUDIO.importTcheMapTilesets(mapData, fileFolder);
          break;
      }
    }
    catch(e) {
      console.error(e);
      throw new Error("Failed to import map tilesets.");
    }

    var mapName = path.basename(filePath);

    try {
      STUDIO.saveJson(path.join(STUDIO.loadedGame.folder, 'maps', mapName), mapData);
    }
    catch(e) {
      console.error(e);
      throw new Error("Failed to save the map.");
    }

    STUDIO.gameData.maps[mapName] = type;
    STUDIO.markAsModified();
    STUDIO.openWindow('maps');
  };

  STUDIO.continueImportMap = function() {
    var type = $('#mapType').val();
    var filePath = $('#import-map-file').val();

    if (!filePath || !filePath.trim()) {
      throw new Error("Please select a map file to import.");
    }

    var mapName = path.basename(filePath);

    if (STUDIO.gameData.maps[mapName] !== undefined) {
      STUDIO.confirm('A map called ' + mapName + ' already exists. If you continue, it will be overwritten.', function(){
        STUDIO.doContinueImportMap(type, filePath);
      });
    } else {
      STUDIO.doContinueImportMap(type, filePath);
    }
  };

  STUDIO.removeCurrentMap = function() {
    var name = $('#edit-tiled-map-name').val();
    STUDIO.removeMap(name);
  };

  STUDIO.removeMap = function(mapName) {
    delete STUDIO.gameData.maps[mapName];
    STUDIO.markAsModified();
  };

  STUDIO.viewMapImage = function(mapName) {
    var image = STUDIO.gameData.maps[mapName].image;
    var imagePath = path.join(STUDIO.loadedGame.folder, image);

    STUDIO.openDialog($('<div><img src="' + imagePath + '"></img></div>'), image);
  };

  STUDIO.editMap = function(mapName) {
    if (!STUDIO.gameData.maps[mapName]) {
      throw new Error("Map " + mapName + " not found.");
    }

    STUDIO.openMapEditor(mapName);
    // var mapType = STUDIO.gameData.maps[mapName];
    // switch (mapType) {
    //   case 'tiled' :
    //     STUDIO.editTiledMap(mapName);
    //     break;
    // }
  };

  STUDIO.fillMaps = function(selectId) {
    var element = $('#' + selectId);
    element.html('');
    element.append('<option value=""></option>');

    var maps = STUDIO.gameData.maps;
    for (var key in maps) {
      element.append('<option value="' + key + '">' +  key + '</option>');
    }
  };

  STUDIO.fillMapLinks = function(ulId) {
    var element = $('#' + ulId);
    element.html('');

    var maps = STUDIO.gameData.maps;
    for (var key in maps) {
      var name = STUDIO.removeFileExtension(key);
      element.append('<li><a class="recent-link" data-type="map" data-name="' + key + '" href="#"><i class="menu-option fa fa-globe fa-fw"></i> ' + name + '</a></li>');
    }
  };
})();