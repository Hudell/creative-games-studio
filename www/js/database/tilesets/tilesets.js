STUDIO.TilesetManager = {};

(function(namespace){
  var path = require("path");

  namespace.addTileset = function(name, tilesetData) {
    var data = [];
    data.push(name);

    switch(tilesetData.type) {
      case 'tiles' :
        data.push('Simple Tiles');
        break;
      case 'rm-auto-tiles-a1' :
        data.push('RPG Maker Animated Auto Tiles (A1)');
        break;
      case 'rm-auto-tiles-a2' :
        data.push('RPG Maker Auto Tiles (A2)');
        break;
      case 'rm-auto-tiles-a3' :
        data.push('RPG Maker Auto Tiles (A3)');
        break;
      case 'rm-auto-tiles-a4' :
        data.push('RPG Maker Auto Tiles (A4)');
        break;
      default :
        data.push(tilesetData.type);
        break;
    }

    var imagePath = path.join(STUDIO.loadedGame.folder, tilesetData.image);
    data.push('<img src="' + imagePath + '"/>');
    data.push(tilesetData.tileWidth + ' x ' + tilesetData.tileHeight);

    STUDIO.addRowToTable('tilesets-table', data, 'tilesets', name);
  };

  namespace.loadTilesets = function() {
    if (!STUDIO.gameData.tilesets) {
      return;
    }

    for (var name in STUDIO.gameData.tilesets) {
      namespace.addTileset(name, STUDIO.gameData.tilesets[name]);
    }
  };

  namespace.onChangeTilesetImage = function() {
    var filePath = $('#import-tileset-image').val();

    if (!filePath || !filePath.trim()) {
      return;
    }

    $('#import-tileset-image-preview').html('<img src="' + filePath + '"/>');

    var baseName = path.basename(filePath);
    var list = baseName.split('.');
    list.pop();
    var name = list.join('.');

    $('#import-tileset-name').val(name);    
  };

  namespace.continueImportingNewTileset = function() {
    var filePath = $('#import-tileset-image').val();

    if (!filePath || !filePath.trim()) {
      throw new Error("Please pick a tileset image to import.");
    }

    var tileType = $('#tileType').val();

    var width = $('#import-tileset-tile-width').val() || 0;
    var height = $('#import-tileset-tile-height').val() || 0;

    var baseName = path.basename(filePath);
    var newPath = path.join('assets', 'tilesets', baseName);
    var name = $('#import-tileset-name').val();

    if (!name || !name.trim()) {
      throw new Error("Plase give this tileset a name.");
    }

    if (STUDIO.keyExists(STUDIO.gameData.tilesets, name)) {
      throw new Error("A Tileset called " + name + " already exists.");
    }

    var fullpath = path.join(STUDIO.loadedGame.folder, newPath);
    if (filePath !== fullpath) {
      STUDIO.copyFileSync(filePath, fullpath);
    }

    var tilesetData = {
      name : name,
      image : newPath,
      type : tileType,
      tileWidth : Math.max(0, parseInt(width)),
      tileHeight : Math.max(0, parseInt(height))
    };

    STUDIO.gameData.tilesets[name] = tilesetData;
    STUDIO.markAsModified();
    STUDIO.DatabaseManager.openWindow('tilesets', 'tilesets');
  };

  namespace.editTileset = function(tilesetName) {
    var tilesetData = STUDIO.gameData.tilesets[tilesetName];
    if (!tilesetData) {
      throw new Error("Tileset Data not found.");
    }

    STUDIO.DatabaseManager.openWindow('tilesets', 'edit-tileset', function(){
      $('#edit-tileset-old-name').val(tilesetName);
      $('#edit-tileset-name').val(tilesetName);

      $('#tileType').val(tilesetData.type);
      $('#edit-tileset-tile-width').val(tilesetData.tileWidth);
      $('#edit-tileset-tile-height').val(tilesetData.tileHeight);

      var fullPath = path.join(STUDIO.loadedGame.folder, tilesetData.image);
      $('#edit-tileset-image-preview').html('<img src="' + fullPath + '"/>');
    });
  };

  namespace.saveExistingTileset = function() {
    var oldName = $('#edit-tileset-old-name').val();
    var newName = $('#edit-tileset-name').val();
    var type = $('#tileType').val();
    var tileWidth = $('#edit-tileset-tile-width').val() || 0;
    var tileHeight = $('#edit-tileset-tile-height').val() || 0;

    if (!oldName || !oldName.trim()) {
      throw new Error("I forgot what tileset you were editing.");
    }

    if (!newName || !newName.trim()) {
      throw new Error("Please give the tileset a name.");
    }

    var tilesetData = STUDIO.gameData.tilesets[oldName];
    if (!tilesetData) {
      throw new Error("I couldn't find the tileset data to modify.");
    }

    if (oldName !== newName) {
      if (STUDIO.keyExists(STUDIO.gameData.tilesets, newName)) {
        throw new Error("A Tileset called " + newName + " already exists.");
      }
      
      delete STUDIO.gameData.tilesets[oldName];
    }

    tilesetData.name = newName;
    tilesetData.tileWidth = Math.max(parseInt(tileWidth), 0);
    tilesetData.tileHeight = Math.max(parseInt(tileHeight), 0);
    tilesetData.type = type;

    STUDIO.gameData.tilesets[newName] = tilesetData;
    STUDIO.markAsModified();
    STUDIO.DatabaseManager.openWindow('tilesets', 'tilesets');
  };

  namespace.deleteCurrentTileset = function() {
    
  };
})(STUDIO.TilesetManager);