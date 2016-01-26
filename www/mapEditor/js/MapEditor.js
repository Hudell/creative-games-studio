TCHE.MapEditor = function() {
};

(function(ns){
  ns._currentTileId = -1;
  ns._currentTilesetIndex = -1;
  ns._currentBrushSize = 1;
  ns._currentLayerIndex = 0;
  ns._currentTool = 'brush';
  ns._currentDrawType = 'tile';
  ns._clickedPos = false;
  ns._needsRedraw = false;

  ns.setSelectedLayer = function(index) {
    ns._currentLayerIndex = index;
  };

  ns.setSelectedTool = function(tool) {
    ns._currentTool = tool;
  };

  ns.setSelectedDrawType = function(drawType) {
    ns._currentDrawType = drawType;
  };

  ns.needsRedraw = function() {
    return ns._needsRedraw;
  };

  ns.reportMapChange = function() {
    var mapName = TCHE.globals.map._mapName;
    var mapData = TCHE.globals.map._mapData;

    if (onMapChange !== undefined) {
      onMapChange(mapData);
    }
  };

  ns.update = function() {
    ns._needsRedraw = false;
    var pos = TCHE.InputManager.currentMousePos();

    if (TCHE.InputManager.isLeftMouseClicked()) {
      if (ns._currentDrawType != 'rectangle') {
        ns.changeTile(pos.x, pos.y);
      } else if (!ns._clickedPos) {
        ns._clickedPos = {
          x : pos.x,
          y : pos.y
        };
      }
    } else if (TCHE.InputManager.isRightMouseClicked()) {
      ns.pickPos(pos.x, pos.y);
    } else {
      if (!!ns._clickedPos) {
        ns.changeRectangle(ns._clickedPos.x, ns._clickedPos.y, pos.x, pos.y);
        ns._clickedPos = false;
      }
    }

    //If anything changed, report those changes to the studio
    if (ns._needsRedraw) {
      ns.reportMapChange();
    }
  };

  ns.setSelectedTile = function(tilesetIndex, column, row, tileWidth, tileHeight) {
    var mapData = TCHE.globals.map._mapData;

    if (tilesetIndex < 0) return;
    if (tilesetIndex >= mapData.tilesets.length) return;
    if (!tilesetIndex && tilesetIndex !== 0) return;

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

  ns.changeRectangle = function(x, y, x2, y2) {
    var left = x;
    var right = x2;
    var top = y;
    var bottom = y2;

    if (left > right) {
      right = x;
      left = x2;
    }

    if (top > bottom) {
      top = y2;
      bottom = y;
    }

    var mapData = TCHE.globals.map._mapData;
    var tileWidth = mapData.tilewidth;
    var tileHeight = mapData.tileheight;

    for (var tileX = left; tileX <= right; tileX += tileWidth) {
      for (var tileY = top; tileY <= bottom; tileY += tileHeight) {
        ns.changeTile(tileX, tileY);
      }
    }
  };

  ns.pickPos = function(x, y) {
    var mapData = TCHE.globals.map._mapData;
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

    ns._currentTileId = layer.data[index];
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

    var totalColumns = mapData.width;
    var totalRows = mapData.height;

    var tileset = mapData.tilesets[ns._currentTilesetIndex];
    var columns = tileset.imagewidth / tileWidth;

    var column;
    var row;
    var index;

    switch(ns._currentTool) {
      case 'pencil' :
        column = Math.floor(x / tileWidth);
        row = Math.floor(y / tileHeight);
        index = totalColumns * row + column;

        layer.data[index] = ns._currentTileId;
        break;
      case 'brush' :
        column = Math.floor(x / (tileWidth * ns._currentBrushSize)) * ns._currentBrushSize;
        row = Math.floor(y / (tileHeight * ns._currentBrushSize)) * ns._currentBrushSize;
        index = totalColumns * row + column;

        layer.data[index] = ns._currentTileId;
        layer.data[index + 1] = ns._currentTileId + 1;
        layer.data[index + totalColumns] = ns._currentTileId + columns;
        layer.data[index + totalColumns + 1] = ns._currentTileId + columns + 1;
        break;
      case 'eraser' :
        column = Math.floor(x / tileWidth);
        row = Math.floor(y / tileHeight);
        index = totalColumns * row + column;

        layer.data[index] = 0; 
        break;
    }

    //Kills the layer texture from the cache to force a new render
    TCHE.TileManager.saveLayerTextureCache(TCHE.globals.map._mapName, layer.name, false);
    ns._needsRedraw = true;
  };
})(TCHE.MapEditor);