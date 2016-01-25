TCHE.MapEditor = function() {
};

(function(ns){
  ns._currentTileId = -1;
  ns._currentTilesetIndex = -1;
  ns._currentBrushSize = 1;
  ns._currentLayerIndex = 0;
  ns._currentTool = 'brush';

  ns.setSelectedLayer = function(index) {
    ns._currentLayerIndex = index;
  };

  ns.setSelectedTool = function(tool) {
    ns._currentTool = tool;
  };

  ns.setSelectedTile = function(tilesetIndex, column, row, tileWidth, tileHeight) {
    var mapData = TCHE.globals.map._mapData;

    if (tilesetIndex < 0) return;
    if (tilesetIndex >= mapData.tilesets.length) return;

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

    if (ns._currentLayerIndex >= mapData.layers.length) {
      ns._currentLayerIndex = 0;
    }
    if (mapData.layers.length <= 0) return;
    var layer = mapData.layers[ns._currentLayerIndex];
    if (layer.type != "tilelayer") return;

    var tileWidth = mapData.tilewidth;
    var tileHeight = mapData.tileheight;

    var column = Math.floor(x / (tileWidth * ns._currentBrushSize)) * ns._currentBrushSize;
    var row = Math.floor(y / (tileHeight * ns._currentBrushSize)) * ns._currentBrushSize;

    var totalColumns = mapData.width;
    var totalRows = mapData.height;

    var index = totalColumns * row + column;

    var tileset = mapData.tilesets[ns._currentTilesetIndex];
    var columns = tileset.imagewidth / tileWidth;

    switch(ns._currentTool) {
      case 'pencil' :
        layer.data[index] = ns._currentTileId;
        break;
      case 'brush' :
        layer.data[index] = ns._currentTileId;
        layer.data[index + 1] = ns._currentTileId + 1;
        layer.data[index + totalColumns] = ns._currentTileId + columns;
        layer.data[index + totalColumns + 1] = ns._currentTileId + columns + 1;
        break;
      case 'eraser' :
        layer.data[index] = 0;
        break;
    }

    //Kills the layer texture from the cache to force a new render
    TCHE.TileManager.saveLayerTextureCache(TCHE.globals.map._mapName, layer.name, false);
  };
})(TCHE.MapEditor);