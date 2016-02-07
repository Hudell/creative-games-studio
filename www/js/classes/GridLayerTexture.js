function GridLayerTexture(renderer, width, height) {
  PIXI.RenderTexture.call(this, renderer, width, height);
}

GridLayerTexture.prototype = Object.create(PIXI.RenderTexture.prototype);
GridLayerTexture.prototype.constructor = GridLayerTexture;

GridLayerTexture.prototype.refreshGrid = function() {
  this.clear();

  if (STUDIO.MapEditor._showGrid) {
    var mapData = STUDIO.MapEditor._currentMapData;
    var mapColumns = mapData.width;
    var mapRows = mapData.height;

    var size = STUDIO.MapEditor.getFakeTileSize();
    this.drawGrid(size.width, size.height, mapColumns, mapRows);

    if (size.allowHalf && !!STUDIO.MapEditor._offgridPlacement) {
      this.drawGrid(size.width, size.height, mapColumns, mapRows, 0x990000, 0.1, size.width / 2, 0);
      this.drawGrid(size.width, size.height, mapColumns, mapRows, 0x990000, 0.1, 0, size.height / 2);
    }
  } else {
    this.render(new PIXI.Container());
  }
};

GridLayerTexture.prototype.drawGrid = function(tileWidth, tileHeight, columns, rows, color, alpha, offsetX, offsetY) {
  var graphics = new PIXI.Graphics();
  if (!offsetX) {
    offsetX = 0;
  }
  if (!offsetY) {
    offsetY = 0
  }

  for (var x = 0; x < columns; x++) {
    for (var y = 0; y < rows; y++) {
      this.drawGridRect(graphics, offsetX + x * tileWidth, offsetY + y * tileHeight, tileWidth, tileHeight, color, alpha);
    }
  }

  this.render(graphics);
};

GridLayerTexture.prototype.drawGridRect = function(graphics, x, y, w, h, color, alpha, length) {
  color = color || 0x333333;
  alpha = alpha || 0.4;
  length = length || 1;

  graphics.beginFill(color, alpha);
  graphics.drawRect(x, y, w, length);
  graphics.drawRect(x, y + h - length, w, length);
  graphics.drawRect(x + w - length, y, length, h);
  graphics.drawRect(x, y, length, h);

  graphics.endFill();
};