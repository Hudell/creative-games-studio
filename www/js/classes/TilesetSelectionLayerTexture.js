function TilesetSelectionLayerTexture(renderer, width, height) {
  PIXI.RenderTexture.call(this, renderer, width, height);
}

TilesetSelectionLayerTexture.prototype = Object.create(PIXI.RenderTexture.prototype);
TilesetSelectionLayerTexture.prototype.constructor = TilesetSelectionLayerTexture;

TilesetSelectionLayerTexture.prototype.refreshSelection = function() {
  // if (!!this.hasAnySprite) {
    this.clear();
    //Render an empty container just so it has something to render (PIXI raises a warning if it doesn't render anything)
    this.render(new PIXI.Container());
    this.hasAnySprite = false;
  // }

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
    this.addTile(x, y);
  }
};

TilesetSelectionLayerTexture.prototype.addRectangle = function(x, y, x2, y2) {
  var mapData = STUDIO.MapEditor._currentMapData;
  if (!mapData) return;

  var tileset = mapData.tilesets[STUDIO.MapEditor._currentTilesetIndex];
  if (!tileset) return;

  var maxX = tileset.imagewidth;
  var maxY = tileset.imageheight;

  if (x < 0) { x = 0; } else if (x > maxX) { x = maxX; }
  if (y < 0) { y = 0; } else if (y > maxY) { y = maxY; }
  if (x2 < 0) { x2 = 0; } else if (x2 > maxX) { x2 = maxX; }
  if (y2 < 0) { y2 = 0; } else if (y2 > maxY) { y2 = maxY; }

  if (x == x2) {
    if (x == 0 || x == maxX) return;
  }
  if (y == y2) {
    if (y == 0 || y == maxY) return;
  }

  if (x == maxX) x--;
  if (y == maxY) y--;
  if (x2 == maxX) x2--;
  if (y2 == maxY) y2--;

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

  var size = STUDIO.MapEditor.getFakeTileSize();
  var tileWidth = size.width;
  var tileHeight = size.height;

  var realLeft = Math.floor(left / tileWidth) * tileWidth;
  var realTop = Math.floor(top / tileHeight) * tileHeight;
  var realRight = Math.ceil(right / tileWidth) * tileWidth;
  var realBottom = Math.ceil(bottom / tileHeight) * tileHeight;

  this.drawSelectionRect(realLeft, realTop, realRight - realLeft, realBottom - realTop);
};

TilesetSelectionLayerTexture.prototype.addTile = function(x, y) {
  var mapData = STUDIO.MapEditor._currentMapData;
  if (!mapData) return;
  var tileset = mapData.tilesets[STUDIO.MapEditor._currentTilesetIndex];
  if (!tileset) return;
  
  var width = tileset.imagewidth;
  var height = tileset.imageheight;
  var tilesetColumns = mapData.width;

  var columns = width / tileWidth;

  var size = STUDIO.MapEditor.getFakeTileSize();
  var tileWidth = size.width;
  var tileHeight = size.height;

  var realX = Math.floor(x / tileWidth) * tileWidth;
  var realY = Math.floor(y / tileHeight) * tileHeight;

  if (realX < 0) return;
  if (realY < 0) return;
  if (realX >= width) return;
  if (realY >= height) return;

  this.drawSelectionRect(realX, realY, tileWidth, tileHeight);
};

TilesetSelectionLayerTexture.prototype.drawSelectionRect = function(x, y, w, h) {
  var graphics = new PIXI.Graphics();

  graphics.beginFill('black', 0.6);
  graphics.drawRect(x, y, w, h);
  graphics.endFill();

  this.render(graphics);
  this.hasAnySprite = true;
};