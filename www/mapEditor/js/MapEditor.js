TCHE.MapEditor = function() {
};

(function(ns){
  ns._currentTileId = -1;
  ns._currentTilesetIndex = -1;
  ns._currentBrushSize = 1;

  ns.setSelectedTile = function(tilesetIndex, column, row, tileWidth, tileHeight) {
    var mapData = TCHE.globals.map._mapData;
    var tileset = mapData.tilesets[tilesetIndex];

    var x = column * tileWidth;
    var y = row * tileHeight;

    var realTileWidth = tileset.tilewidth;
    var realTileHeight = tileset.tileheight;
    var realColumn = Math.floor(x / realTileWidth);
    var realRow = Math.floor(y / realTileHeight);

    var totalColumns = tileset.imagewidth / realTileWidth;
    var totalRows = tileset.imageheight / realTileHeight;

    var tileId = realRow * totalColumns + realColumn + tileset.firstgid;

    ns._currentBrushSize = tileWidth / mapData.tilewidth;

    ns._currentTileId = tileId;
    ns._currentTilesetIndex = tilesetIndex;
  };

  ns.changeTile = function(x, y) {
    if (ns._currentTileId < 0) return;

    var mapData = TCHE.globals.map._mapData;
    var tileWidth = mapData.tilewidth;
    var tileHeight = mapData.tileheight;

    var column = Math.floor(x / tileWidth);
    var row = Math.floor(y / tileHeight);

    var totalColumns = mapData.width;
    var totalRows = mapData.height;

    var index = totalColumns * row + column;
    var layer = mapData.layers[mapData.layers.length -1];

    layer.data[index] = ns._currentTileId;
    if (ns._currentBrushSize == 2) {
        layer.data[index + 1] = ns._currentTileId + 1;

        index += totalColumns;
        var tileset = mapData.tilesets[ns._currentTilesetIndex];
        var columns = tileset.imagewidth / tileWidth;

        layer.data[index] = ns._currentTileId + columns;
        layer.data[index + 1] = ns._currentTileId + columns + 1;
    }

    //Kills the layer texture from the cache to force a new render
    TCHE.TileManager.saveLayerTextureCache(TCHE.globals.map._mapName, layer.name, false);
  };
})(TCHE.MapEditor);