function TransparentLayerTexture(renderer, width, height) {
  PIXI.RenderTexture.call(this, renderer, width, height);
}

TransparentLayerTexture.prototype = Object.create(PIXI.RenderTexture.prototype);
TransparentLayerTexture.prototype.constructor = TransparentLayerTexture;

TransparentLayerTexture.prototype.refreshSelection = function() {
  if (!!this.hasAnySprite) {
    this.clear();
    //Render an empty container just so it has something to render (PIXI raises a warning if it doesn't render anything)
    this.render(new PIXI.Container());
    this.hasAnySprite = false;
  }

  var mapData = STUDIO.MapEditor._currentMapData;
  var mapColumns = mapData.width;
  var mapRows = mapData.height;

  var data = [];

  var tiles = mapColumns * mapRows;
  for (var i = 0; i < tiles; i++) {
    data[i] = 0;
  }

  if (STUDIO.MapEditor._currentTileIds.length === 0 || STUDIO.MapEditor._currentTileIds[0] < 0) {
    return;
  }

  var pos = STUDIO.MapEditor.getMousePos();
  var x = pos.x;
  var y = pos.y;
  var width = mapColumns * mapData.tilewidth;
  var height = mapRows * mapData.tileheight;

  if (x <= 0) return;
  if (y <= 0) return;
  if (x >= width) return;
  if (y >= height) return;
    
  var tileset = mapData.tilesets[STUDIO.MapEditor._currentTilesetIndex];
  if (!tileset) return;

  if (STUDIO.MapEditor._currentDrawType === 'rectangle' && !!STUDIO.MapEditor._clickedPos) {
    this.addRectangleToLayer(STUDIO.MapEditor._clickedPos.x, STUDIO.MapEditor._clickedPos.y, pos.x, pos.y);
  } else {
    this.changeTile(x, y);
  }
};

TransparentLayerTexture.prototype.addRectangleToLayer = function(x, y, x2, y2) {
  var mapData = STUDIO.MapEditor._currentMapData;
  var maxX = mapData.width * mapData.tilewidth;
  var maxY = mapData.height * mapData.tileheight;

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

  var size = STUDIO.MapEditor.getSelectionSize();

  for (var tileX = left; tileX <= right; tileX += size.width) {
    for (var tileY = top; tileY <= bottom; tileY += size.height) {
      this.changeTile(tileX, tileY);
    }
  }
};

TransparentLayerTexture.prototype.addTileSprite = function(tileTexture, x, y, tileId, alpha) {
  var sprite = new PIXI.Sprite(tileTexture);
  sprite.x = x;
  sprite.y = y;
  sprite.tileId = tileId;

  if (tileId < 0) {
    sprite.scale.x = 0.5;
    sprite.scale.y = 0.5;
  }

  if (!!alpha) {
    sprite.alpha = alpha;
  }

  var container = new PIXI.Container();
  container.addChild(sprite);

  this.hasAnySprite = true;
  this.render(container);
};

TransparentLayerTexture.prototype.drawTile = function(column, row, tileId) {
  var mapData = STUDIO.MapEditor._currentMapData;
  var x = column * mapData.tilewidth;
  var y = row * mapData.tileheight;

  var tileTexture = STUDIO.MapEditor.getTileTexture(tileId);
  if (tileTexture.baseTexture.isLoading) {
    tileTexture.baseTexture.addListener('loaded', function(){
      this.layerTexture.addTileSprite(this.texture, this.x, this.y, this.tileId, 0.7);
    }.bind({
      x : x,
      y : y,
      tileId : tileId,
      texture : tileTexture,
      layerTexture : this
    }));
  } else {
    this.addTileSprite(tileTexture, x, y, tileId, 0.7);
  }
};

TransparentLayerTexture.prototype.changeTile = function(x, y) {
  var mapData = STUDIO.MapEditor._currentMapData;
  var mapColumns = mapData.width;
  var mapRows = mapData.height;

  var tileWidth = mapData.tilewidth;
  var tileHeight = mapData.tileheight;
  var tileset = mapData.tilesets[STUDIO.MapEditor._currentTilesetIndex];
  var columns = tileset.imagewidth / tileWidth;
  var column;
  var row;
  var width = mapColumns * tileWidth;
  var height = mapRows * tileHeight;

  if (x <= 0) return;
  if (y <= 0) return;
  if (x >= width) return;
  if (y >= height) return;

  column = Math.floor(x / tileWidth);
  row = Math.floor(y / tileHeight);

  var previousIndex = 0;
  var previousRow = row;
  for (var i = 0; i < STUDIO.MapEditor._currentTileIds.length; i++) {
    var tileId = STUDIO.MapEditor._currentTileIds[i];

    if (tileId === undefined || tileId === 0) continue;
    if (STUDIO.MapEditor._currentTool == 'eraser') {
      tileId = -1;
    }

    if (column >= mapColumns) continue;

    var newColumn = column + i;
    var newRow = row;

    while (newColumn >= mapColumns) {
      newColumn -= mapColumns;
      newRow++;
    }

    if (newColumn < column) {
      continue;
    }

    this.drawTile(newColumn, newRow, tileId);
    previousIndex = i;
    previousRow = newRow;
  }
};