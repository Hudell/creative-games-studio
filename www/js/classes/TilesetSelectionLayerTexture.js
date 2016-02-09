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
  
  this.drawMousePos(mapData, tileset);
  this.drawPickedTiles(mapData, tileset);
};

TilesetSelectionLayerTexture.prototype.drawMousePos = function(mapData, tileset) {
  var pos = STUDIO.MapEditor.getTilesetMousePos();
  var x = pos.x;
  var y = pos.y;
  
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

TilesetSelectionLayerTexture.prototype.getTilePosition = function(mapData, tileset, tileId) {
  var subTileId = tileId - tileset.firstgid;
  var tileWidthWithSpacing = mapData.tilewidth;
  var tileHeightWithSpacing = mapData.tileheight;

  var fakeSize = STUDIO.MapEditor.getFakeTileSize();
  var halfSpacing = fakeSize.halfSpacing;
  var spacing = fakeSize.spacing;

  tileWidthWithSpacing += halfSpacing;
  tileHeightWithSpacing += halfSpacing;

  var columns = (tileset.imagewidth + spacing) / tileWidthWithSpacing;

  var column = subTileId % columns;
  var row = Math.floor(subTileId / columns);

  if (STUDIO.MapEditor.mapType() == 'tche') {
    return {
      x : column * fakeSize.realWidth + Math.floor(column / 2) * spacing,
      y : row * fakeSize.realHeight  + Math.floor(row / 2) * spacing
    };
  } else {
    return {
      x : column * fakeSize.realWidthWithSpacing,
      y : row * fakeSize.realHeightWithSpacing
    }
  }
};

TilesetSelectionLayerTexture.prototype.drawPickedTiles = function(mapData, tileset, individually) {
  var tiles = STUDIO.MapEditor._currentTileIds;
  
  if (tiles.length === 0) {
    return;
  }

  individually = individually || false;

  var left = false;
  var right = false;
  var top = false;
  var bottom = false;
  var length = 0;
  var tileId;
  var tilesPerXPos = {};
  var tilesPerYPos = {};

  for (var i = 0; i < tiles.length; i++) {
    tileId = tiles[i];
    if (!tileId) continue;

    length++;

    var pos = this.getTilePosition(mapData, tileset, tileId);
    if (!pos) continue;

    if (individually) {
      this.drawSelectionRect(pos.x, pos.y, mapData.tilewidth, mapData.tileheight, 0x333333, 1, 2);
    } else {
      if (!tilesPerXPos[pos.x]) {
        tilesPerXPos[pos.x] = 0;
      }
      if (!tilesPerYPos[pos.y]) {
        tilesPerYPos[pos.y] = 0;
      }

      tilesPerXPos[pos.x]++;
      tilesPerYPos[pos.y]++;

      if (left === false || pos.x < left) {
        left = pos.x;
      }

      if (right === false || pos.x > right) {
        right = pos.x;
      }

      if (top === false || pos.y < top) {
        top = pos.y;
      }

      if (bottom === false || pos.y > bottom) {
        bottom = pos.y;
      }
    }
  }

  if (!individually && left !== false && right !== false && top !== false && bottom !== false) {
    var size = STUDIO.MapEditor.getFakeTileSize();

    var xExtraSpacing = 0;
    var yExtraSpacing = 0;
    if (size.spacing > 0) {
      if (size.allowHalf) {
        xExtraSpacing = (tilesPerYPos[top] / 2 - 1) * size.spacing;
        yExtraSpacing = (tilesPerXPos[left] / 2 - 1) * size.spacing;
      } else {
        xExtraSpacing = (tilesPerYPos[top] - 1) * size.spacing;
        yExtraSpacing = (tilesPerXPos[left] - 1) * size.spacing;
      }
    }

    var xAmount = (right + size.realWidth - left - xExtraSpacing) / size.realWidth;
    var yAmount = (bottom + size.realHeight - top - yExtraSpacing) / size.realHeight;
    var amount = xAmount * yAmount;

    //If the amount of tiles inside the rect match the amount of selected tiles, then draw a single rect
    if (amount === length) {
      this.drawSelectionRect(left, top, (right - left) + mapData.tilewidth, (bottom - top) + mapData.tileheight, 0x333333, 1, 4);
    } else {
      // If it didn't match, draw a rect on each tile individually
      this.drawPickedTiles(mapData, tileset, true);
    }
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
  var tileWidth = size.widthWithSpacing;
  var tileHeight = size.heightWithSpacing;

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
  var tileWidth = size.widthWithSpacing;
  var tileHeight = size.heightWithSpacing;

  var realX = Math.floor(x / tileWidth) * tileWidth;
  var realY = Math.floor(y / tileHeight) * tileHeight;

  if (realX < 0) return;
  if (realY < 0) return;
  if (realX >= width) return;
  if (realY >= height) return;

  if (size.allowHalf) {
    var halfTileWidth = tileWidth / 2;
    var halfTileHeight = tileHeight / 2;

    var newX = Math.floor(x / halfTileWidth) * halfTileWidth;
    var newY = Math.floor(y / halfTileHeight) * halfTileHeight;

    if (newX !== realX || newY !== realY) {
      this.drawSelectionRect(newX, newY, tileWidth, tileHeight, 0xff0000, 0.6, 1);
    }
  }

  this.drawSelectionRect(realX, realY, tileWidth, tileHeight);
};

TilesetSelectionLayerTexture.prototype.drawSelectionRect = function(x, y, w, h, color, alpha, length) {
  color = color || 0x333333;
  alpha = alpha || 1;
  length = length || 2;

  var graphics = new PIXI.Graphics();

  graphics.beginFill(color, alpha);
  graphics.drawRect(x, y, w, length);
  graphics.drawRect(x, y + h - length, w, length);
  graphics.drawRect(x + w - length, y, length, h);
  graphics.drawRect(x, y, length, h);

  graphics.endFill();

  this.render(graphics);
  this.hasAnySprite = true;
};