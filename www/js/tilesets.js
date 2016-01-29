STUDIO.TilesetManager = {};

(function(namespace){
  namespace.addTileset = function(name, tilesetData) {
    var data = [];
    data.push(name);

    var imagePath = path.join(STUDIO.loadedGame.folder, tilesetData.image);
    data.push('<img src="' + imagePath + '"/>');

    data.push(tilesetData.imageWidth || tilesetData.width || 0);
    data.push(tilesetData.imageHeight || tilesetData.height || 0);

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

})(STUDIO.TilesetManager);