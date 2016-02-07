function TilesetSelectionLayerTexture(renderer, width, height) {
  PIXI.RenderTexture.call(this, renderer, width, height);
}

TilesetSelectionLayerTexture.prototype = Object.create(PIXI.RenderTexture.prototype);
TilesetSelectionLayerTexture.prototype.constructor = TilesetSelectionLayerTexture;

TilesetSelectionLayerTexture.prototype.refreshSelection = function() {
  if (!!this.hasAnySprite) {
    this.clear();
    //Render an empty container just so it has something to render (PIXI raises a warning if it doesn't render anything)
    this.render(new PIXI.Container());
    this.hasAnySprite = false;
  }

  var mapData = STUDIO.MapEditor._currentMapData;
  if (!mapData) return;

  var tileset = mapData.tilesets[STUDIO.MapEditor._currentTilesetIndex];
  if (!tileset) return;
  
  if (STUDIO.MapEditor._currentTileIds.length === 0 || STUDIO.MapEditor._currentTileIds[0] <= 0) {
    return;
  }

  var pos = STUDIO.MapEditor.getTilesetMousePos();
  var x = pos.x;
  var y = pos.y;
  
  var tileWidth = mapData.tilewidth;
  var tileHeight = mapData.tileheight;
  var width = tileset.imagewidth;
  var height = tileset.imageheight;

  if (x <= 0) return;
  if (y <= 0) return;
  if (x >= width) return;
  if (y >= height) return;
    
  if (!!STUDIO.MapEditor._tilesetClickedPos) {
    this.addRectangle(STUDIO.MapEditor._tilesetClickedPos.x, STUDIO.MapEditor._tilesetClickedPos.y, pos.x, pos.y);
  } else {
    if (STUDIO.MapEditor._currentTool == 'brush') {
      this.addRectangle(x, y, x + tileWidth * 2, y + tileHeight * 2);
    } else {
      this.addTile(x, y);
    }
  }
};

TilesetSelectionLayerTexture.prototype.addRectangle = function(x, y, x2, y2) {
  // var mapData = STUDIO.MapEditor._currentMapData;
  // var maxX = mapData.width * mapData.tilewidth;
  // var maxY = mapData.height * mapData.tileheight;

  // if (x < 0) { x = 0; } else if (x > maxX) { x = maxX; }
  // if (y < 0) { y = 0; } else if (y > maxY) { y = maxY; }
  // if (x2 < 0) { x2 = 0; } else if (x2 > maxX) { x2 = maxX; }
  // if (y2 < 0) { y2 = 0; } else if (y2 > maxY) { y2 = maxY; }

  // if (x == x2) {
  //   if (x == 0 || x == maxX) return;
  // }
  // if (y == y2) {
  //   if (y == 0 || y == maxY) return;
  // }

  // if (x == maxX) x--;
  // if (y == maxY) y--;
  // if (x2 == maxX) x2--;
  // if (y2 == maxY) y2--;

  // var left = x;
  // var right = x2;
  // var top = y;
  // var bottom = y2;

  // if (left > right) {
  //   right = x;
  //   left = x2;
  // }

  // if (top > bottom) {
  //   top = y2;
  //   bottom = y;
  // }

  // var size = STUDIO.MapEditor.getSelectionSize();

  // for (var tileX = left; tileX <= right; tileX += size.width) {
  //   for (var tileY = top; tileY <= bottom; tileY += size.height) {
  //     this.addTile(tileX, tileY);
  //   }
  // }
};

TilesetSelectionLayerTexture.prototype.addTile = function(x, y) {
  var mapData = STUDIO.MapEditor._currentMapData;
  if (!mapData) return;
  var tileset = mapData.tilesets[STUDIO.MapEditor._currentTilesetIndex];
  if (!tileset) return;
  
  var width = tileset.imagewidth;
  var height = tileset.imageheight;
  var tilesetColumns = mapData.width;

  var tileWidth = mapData.tilewidth;
  var tileHeight = mapData.tileheight;
  var columns = width / tileWidth;

  if (x <= 0) return;
  if (y <= 0) return;
  if (x >= width) return;
  if (y >= height) return;

  var realX = Math.floor(x / tileWidth) * tileWidth;
  var realY = Math.floor(y / tileHeight) * tileHeight;

  this.drawTileRect(realX, realY, tileWidth, tileHeight);

  // var previousIndex = 0;
  // var previousRow = row;
  // for (var i = 0; i < STUDIO.MapEditor._currentTileIds.length; i++) {
  //   var tileId = STUDIO.MapEditor._currentTileIds[i];

  //   if (tileId === undefined || tileId === 0) continue;
  //   if (column >= tilesetColumns) continue;

  //   var newColumn = column + i;
  //   var newRow = row;

  //   while (newColumn >= tilesetColumns) {
  //     newColumn -= tilesetColumns;
  //     newRow++;
  //   }

  //   if (newColumn < column) {
  //     continue;
  //   }

  //   this.drawTile(newColumn, newRow, tileId);
  //   previousIndex = i;
  //   previousRow = newRow;
  // }
};

TilesetSelectionLayerTexture.prototype.drawTileRect = function(x, y, w, h) {
  var graphics = new PIXI.Graphics();

  graphics.beginFill('black', 1);
  graphics.moveTo(x, y);
  graphics.lineTo(x + w, y);
  graphics.lineTo(x + w, y + h);
  graphics.lineTo(x, y + h);
  graphics.lineTo(x, y);
  graphics.endFill();

  this.render(graphics);
  this.hasAnySprite = true;
};