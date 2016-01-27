STUDIO.MapEditor = {};

(function(namespace){
  var fs = require("fs");
  var path = require("path");
  var gui = require('nw.gui');
  var win = gui.Window.get();

  namespace.tilesetZoomLevel = 1;
  namespace.mapZoomLevel = 1;
  namespace._currentTool = 'brush';
  namespace._currentDrawType = 'tile';
  namespace._currentTilesetIndex = -1;
  namespace._pickedRow = 0;
  namespace._pickedColumn = 0;
  namespace._currentMapName = '';
  namespace._currentMapData = null;
  namespace._tileCache = {};
  namespace._layerCache = {};
  // namespace._currentBrushSize = 1;
  namespace._currentTileId = -1;
  namespace._currentLayerIndex = 0;
  namespace._clickedPos = false;

  //Preloads the transparent png
  namespace._transparentSpriteTexture = PIXI.Texture.fromImage(path.join('img', 'transparent.png'));

  namespace.openMapEditor = function(mapName, callback) {
    var mapData = STUDIO.getMapData(mapName);
    if (!mapData) {
      throw new Error("Couldn't find map " + mapName + " data.");
    }
    namespace._currentMapName = mapName;
    namespace._currentMapData = mapData;

    //Copy the map data to the mapEditor folder
    namespace.saveMapToEditor(mapName, mapData);

    STUDIO.openWindow('map-editor', function(){
      var editorWidth = window.innerWidth - 524;
      var editorHeight = window.innerHeight - 104;
      
      $('#editor-wrapper').css('height', (editorHeight) + 'px');

      var mapWidth = mapData.width * mapData.tilewidth;
      var mapHeight = mapData.height * mapData.tileheight;

      namespace.initMapEditor();

      namespace.attachEvents();
      namespace.loadTilesetList();
      namespace.loadLayerList();
      namespace.refreshTilesetWindow();

      if (!!callback) {
        callback();
      }
    });    
  };

  namespace.onMapChange = function() {
    var mapName = namespace._currentMapName;
    var mapData = namespace._currentMapData;
    STUDIO.changeMap(mapName, mapData);
  };

  namespace.attachEvents = function() {
    $('#mapeditor-tile-btn').on('click', function(event){ event.preventDefault(); namespace.changeDrawTypeToTile(); });
    $('#mapeditor-line-btn').on('click', function(event){ event.preventDefault(); namespace.changeDrawTypeToLine(); });
    $('#mapeditor-tint-btn').on('click', function(event){ event.preventDefault(); namespace.changeDrawTypeToTint(); });
    
    $('#mapeditor-pencil-btn').on('click', function(event){ event.preventDefault(); namespace.changeToolToPencil(); });
    $('#mapeditor-brush-btn').on('click', function(event){ event.preventDefault(); namespace.changeToolToBrush(); });
    $('#mapeditor-autotiles-btn').on('click', function(event){ event.preventDefault(); namespace.changeToolToAutoTile(); });
    $('#mapeditor-eraser-btn').on('click', function(event){ event.preventDefault(); namespace.changeToolToEraser(); });

    $('#mapeditor-zoomin-btn').on('click', function(event){ event.preventDefault(); namespace.zoomIn(); });
    $('#mapeditor-zoomout-btn').on('click', function(event){ event.preventDefault(); namespace.zoomOut(); });

    $('#map-editor-tileset-zoom-in').on('click', function(event) {
      event.preventDefault();
      namespace.increaseTilesetZoom();
    });

    $('#map-editor-tileset-zoom-out').on('click', function(event) {
      event.preventDefault();
      namespace.decreaseTilesetZoom();
    });

    $('#map-editor-new-layer-btn').on('click', function(event) {
      event.preventDefault();
      namespace.createNewLayer();
    });
  };

  namespace.saveMapToEditor = function(mapName, mapData) {
    if (!mapData) {
      mapData = STUDIO.getMapData(mapName);
    }

    var mapEditorFolder = path.join('www', 'mapEditor');
    var originalMapFolder = path.join(STUDIO.loadedGame.folder, 'maps');

    var tilesetsFolder = path.join(mapEditorFolder, 'assets', 'tilesets');
    var referencedTilesetsFolder = path.join('..', 'assets', 'tilesets');
    STUDIO.forceDirSync(tilesetsFolder);
    STUDIO.removeFolderContent(tilesetsFolder);

    for (var i = 0; i < mapData.tilesets.length; i++) {
      var originalFile = path.join(originalMapFolder, mapData.tilesets[i].image);
      var fileName = path.basename(originalFile);

      var newFileName = path.join(tilesetsFolder, fileName);
      var referencedFileName = path.join(referencedTilesetsFolder, fileName);
      mapData.tilesets[i].image = referencedFileName;

      if (fs.existsSync(originalFile)) {
        STUDIO.copyFileSync(originalFile, newFileName);
      }
    }
    
    var mapFileName = path.join(mapEditorFolder, 'maps', 'map.json');
    STUDIO.saveJson(mapFileName, mapData);
  };

  namespace.updateTilesetZoom = function() {
    if (!!namespace._tilesetWindow) {
      namespace._tilesetWindow.zoomLevel = namespace.tilesetZoomLevel;

      namespace._tilesetWindow.window.updateWindowSize(namespace._tilesetWindow);
      namespace._tilesetWindow.focus();
    }
  };

  namespace.increaseTilesetZoom = function() {
    if (namespace.tilesetZoomLevel < 4) {
      namespace.tilesetZoomLevel++;
    }

    namespace.updateTilesetZoom();
  };

  namespace.decreaseTilesetZoom = function() {
    if (namespace.tilesetZoomLevel > -2) {
      namespace.tilesetZoomLevel--;
    }

    namespace.updateTilesetZoom();
  };

  namespace.changeTool = function(toolName, iconClass) {
    namespace._currentTool = toolName;
    $('#map-editor-tool-types').html('<i class="fa fa-' + iconClass + ' fa-fw red-color"></i> <i class="fa fa-caret-down"></i>');

    namespace._pickedColumn = 0;
    namespace._pickedRow = 0;

    namespace.refreshTilesetWindow();
  };

  namespace.changeDrawType = function(drawType, iconClass) {
    namespace._currentDrawType = drawType;
    $('#map-editor-draw-types').html('<i class="fa fa-' + iconClass + ' fa-fw red-color"></i> <i class="fa fa-caret-down"></i>');
  };

  namespace.convertPickedTileFromPencilToBrush = function() {
    //Nothing needs to be done
  };

  namespace.convertPickedTileFromBrushToPencil = function() {
    if (namespace._pickedColumn % 2 == 1) {
      namespace._pickedColumn -= 1;
    }

    if (namespace._pickedRow % 2 == 1) {
      namespace._pickedRow -= 1;
    }
  };

  namespace.changeToolToPencil = function() {
    if (namespace._currentTool == 'brush') {
      namespace.convertPickedTileFromBrushToPencil();
    }

    namespace.changeTool('pencil', 'pencil');
    namespace.updatePickedTile();
  };

  namespace.changeToolToBrush = function() {
    if (namespace._currentTool == 'pencil') {
      namespace.convertPickedTileFromPencilToBrush();
    }

    namespace.changeTool('brush', 'paint-brush');
    namespace.updatePickedTile();
  };

  namespace.changeToolToAutoTile = function() {
    namespace.changeTool('auto-tile', 'magic');
  };

  namespace.changeToolToEraser = function() {
    namespace.changeTool('eraser', 'eraser');
  };

  namespace.changeDrawTypeToTile = function() {
    namespace.changeDrawType('tile', 'map-pin');
  };

  namespace.changeDrawTypeToLine = function() {
    namespace.changeDrawType('rectangle', 'square-o');
  };

  namespace.changeDrawTypeToTint = function() {
    namespace.changeDrawType('tint', 'tint');
  };

  namespace.zoomIn = function() {

  };

  namespace.zoomOut = function() {

  };

  namespace.closeTilesets = function() {
    if (!!namespace._tilesetWindow) {
      namespace._tilesetWindow.close();
      namespace._tilesetWindow = undefined;
    }
  };

  namespace.loadLayerList = function() {
    var list = $('#map-editor-layer-list');
    list.html('');

    list.append('<li><a class="map-editor-manage-layers" href="#"><i class="fa fa-cog fa-fw"></i> Manage Layers </a></li>');
    list.append('<li class="divider"></li>');

    var layers = namespace._currentMapData.layers;
    for (var i = 0; i < layers.length; i++) {
      var icon = 'fa-th';

      switch (layers[i].type) {
        case 'objectgroup' :
          icon = 'fa-map-signs';
          break;
        case 'image' :
          icon = 'fa-image';
          break;
      }

      list.append('<li><a class="map-editor-layer-link" data-index="' + i + '" href="#"><i class="fa ' + icon + ' fa-fw layer-icon"></i> ' + layers[i].name + '</a></li>');
    }

    $('.map-editor-layer-link').on('click', function(event) {
      event.preventDefault();

      var link = $(event.currentTarget);
      var layerIndex = event.currentTarget.dataset.index;
      namespace.changeLayerIndex(layerIndex);
    });
  };

  namespace.changeLayerIndex = function(index) {
    namespace._currentLayerIndex = index;
  };

  namespace.loadTilesetList = function() {
    var list = $('#tileset-list');
    list.html('');

    var tilesets = namespace._currentMapData.tilesets;
    for (var i = 0; i < tilesets.length; i++) {
      list.append('<li><a class="map-editor-tileset-link" data-index="' + i + '" href="#"><i class="fa fa-folder-o fa-fw tileset-icon"></i> ' + tilesets[i].name + '</a></li>');
    }

    $('.map-editor-tileset-link').on('click', function(event) {
      event.preventDefault();

      $('.tileset-icon').removeClass('fa-folder-open-o');
      $('.tileset-icon').addClass('fa-folder-o');

      var link = $(event.currentTarget);
      link.children('.tileset-icon').addClass('fa-folder-open-o');
      link.children('.tileset-icon').removeClass('fa-folder-o');

      var tilesetIndex = event.currentTarget.dataset.index;
      namespace._currentTilesetIndex = tilesetIndex;

      var tileset = tilesets[tilesetIndex];

      namespace.openTileset(tileset);
    });
  };

  namespace.getFakeTileSize = function() {
    var tileWidth = namespace._currentMapData.tilewidth;
    var tileHeight = namespace._currentMapData.tileheight;

    switch(namespace._currentTool) {
      case 'pencil' :
        break;
      case 'auto-tile' :
        tileWidth *= 4;
        tileHeight *= 6;
        break;
      default :
        tileWidth *= 2;
        tileHeight *= 2;
        break;
    }

    return {
      width : tileWidth,
      height : tileHeight
    };
  };

  namespace.refreshTilesetWindow = function(tileset) {
    if (!namespace._tilesetWindow) return;
    if (!tileset) {
      if (!namespace._currentTileset) {
        return;
      }

      tileset = namespace._currentTileset;
    }

    namespace._currentTileset = tileset;
    var imgPath = path.join('..', '..', 'mapEditor', 'maps', tileset.image);
    var width = tileset.imagewidth;
    var height = tileset.imageheight;

    var size = namespace.getFakeTileSize();
    var tileWidth = size.width;
    var tileHeight = size.height;

    var columns = width / tileWidth;
    var rows = height / tileHeight;

    namespace._tilesetWindow.title = tileset.name;
    namespace._tilesetWindow.window.setup(STUDIO.win, namespace._tilesetWindow, imgPath, tileWidth, tileHeight, columns, rows);
    namespace._tilesetWindow.window.pickTile = namespace.pickTile;
  };

  namespace.pickTile = function(column, row) {
    namespace._pickedColumn = Number(column);
    namespace._pickedRow = Number(row);

    namespace.updatePickedTile();
  };

  namespace.updatePickedTile = function() {
    var size = namespace.getFakeTileSize();
    var tilesetIndex = namespace._currentTilesetIndex;
    var mapData = namespace._currentMapData;

    if (tilesetIndex < 0) return;
    if (tilesetIndex >= mapData.tilesets.length) return;
    if (!tilesetIndex && tilesetIndex !== 0) return;

    var tileset = mapData.tilesets[tilesetIndex];
    var column = namespace._pickedColumn;
    var row = namespace._pickedRow;
    var tileWidth = size.width;
    var tileHeight = size.height;
    var x = column * tileWidth;
    var y = row * tileHeight;

    var realTileWidth = tileset.tilewidth;
    var realTileHeight = tileset.tileheight;
    var realColumn = Math.floor(x / realTileWidth);
    var realRow = Math.floor(y / realTileHeight);

    var totalColumns = tileset.imagewidth / realTileWidth;
    var totalRows = tileset.imageheight / realTileHeight;

    var tileId = realRow * totalColumns + realColumn + tileset.firstgid;

    // namespace._currentBrushSize = tileWidth / mapData.tilewidth;
    namespace._currentTileId = tileId;
  };

  namespace.openTileset = function(tileset) {
    if (!namespace._tilesetWindow) {
      namespace.openTilesetWindow(tileset);
    } else {
      namespace.refreshTilesetWindow(tileset);
    }
  };

  namespace.openTilesetWindow = function(tileset) {
    if (!!namespace._tilesetWindow) {
      namespace._tilesetWindow.close(true);
      namespace._tilesetWindow = undefined;
    }

    var newWin = gui.Window.open('/pages/windows/tileset.html', {
      title : 'Tileset',
      toolbar : false,
      min_width : 200,
      min_height : 200,
      "always-on-top" : true
    });

    namespace._tilesetWindow = newWin;

    newWin.on('close', function() {
      namespace._tilesetWindow = undefined;
      namespace._currentTilesetIndex = false;
      $('.tileset-icon').removeClass('fa-folder-open-o');
      $('.tileset-icon').addClass('fa-folder-o');

      newWin.close(true);
    });

    newWin.on('loaded', function() {
      namespace.refreshTilesetWindow(tileset);

      delete newWin._events.loaded;
    });
  };

  namespace.checkIfLayerNameExists = function(layerName) {
    var mapData = namespace._currentMapData;
    for (var i = 0; i < mapData.layers.length; i++) {
      if (mapData.layers[i].name == layerName) {
        return true;
      }
    }

    return false;
  };

  namespace.createNewLayer = function() {
    STUDIO.openPopupForm('map-editor-new-layer', 'New Layer', function(){
      var layerName = $('#map-editor-new-layer-name').val();
      if (!layerName || !layerName.trim()) {
        throw new Error("Please give this layer a name.");
      }

      if (namespace.checkIfLayerNameExists(layerName)) {
        throw new Error("There's already a layer called " + layerName);
      }

      var layerType = $('#map-editor-new-layer-type').val();
      var newLayer = {
        name : layerName,
        visible : true,
        x : 0,
        y : 0,
        opacity : 1,
        type : layerType,
        width : namespace._currentMapData.width,
        height : namespace._currentMapData.height,
        properties : []
      }

      switch(layerType) {
        case 'tilelayer' :
          newLayer.data = [];
          var tiles = namespace._currentMapData.width * namespace._currentMapData.height;
          for (var i = 0; i < tiles; i++) {
            newLayer.data[i] = 0;
          }

          break;
        case 'objectgroup' :
          newLayer.objects = [];

          break;
      }


      namespace._currentMapData.layers.push(newLayer);
      namespace.onMapChange();

      namespace.openMapEditor(namespace._currentMapName);
    }, function(){

    });
  };

  var mouseClicked = [];
  var mousePos = {x : 0, y : 0};

  namespace.getMousePos = function(canvas, evt) {
    return namespace._renderer.plugins.interaction.eventData.data.global;
  };

  namespace.isLeftMouseClicked = function() {
    return !!mouseClicked[0];
  };

  namespace.isRightMouseClicked = function() {
    return !!mouseClicked[2];
  };

  namespace.initMapEditor = function(){
    var mapData = namespace._currentMapData;
    var width = mapData.width * mapData.tilewidth;
    var height = mapData.height * mapData.tileheight;

    if (!namespace._renderer) {
      namespace._renderer = PIXI.autoDetectRenderer(width, height, {
        transparent : true
      });

      namespace._renderer.view.addEventListener("mousedown", function(evt) {
        var pos = namespace.getMousePos(this, evt);
        mouseClicked[evt.button] = true;
        mousePos = pos;
      });

      namespace._renderer.view.addEventListener("mousemove", function(evt) {
        mousePos = namespace.getMousePos(this, evt);
      });

      namespace._renderer.view.addEventListener("mouseout", function(evt) {
        for (var i = 0; i < mouseClicked.length; i++) {
          mouseClicked[i] = false;
        }
      });

      namespace._renderer.view.addEventListener("mouseup", function(evt) {
        mouseClicked[evt.button] = false;
        mousePos = namespace.getMousePos(this, evt);
      });

      window.addEventListener('blur', function(){
        for (var i = 0; i < mouseClicked.length; i++) {
          mouseClicked[i] = false;
        }        
      });
    }

    $('.map-editor').html('');
    $('.map-editor')[0].appendChild(namespace._renderer.view);
    namespace._renderer.view.style.width = width + "px";
    namespace._renderer.view.style.height = height + "px";

    namespace._stage = new PIXI.Container();

    namespace.createLayers(width, height);
    namespace.requestAnimationFrame();
  };

  namespace.createTransparentLayer = function(width, height) {
    namespace._transparentLayerTexture = new PIXI.RenderTexture(namespace._renderer, width, height);
    
    var sprite = new PIXI.Sprite(namespace._transparentSpriteTexture);
    
    for (var y = 0; y < height; y += 32) {
      for (var x = 0; x < width; x += 32) {
        sprite.position.x = x;
        sprite.position.y = y;
        var container = new PIXI.Container();
        container.addChild(sprite);

        namespace._transparentLayerTexture.render(container);
      }
    }

    namespace._stage.addChild(new PIXI.Sprite(namespace._transparentLayerTexture));
  };

  namespace.getTileTexture = function(tileId) {
    if (!!namespace._tileCache[tileId]) {
      return namespace._tileCache[tileId];
    }

    var mapData = namespace._currentMapData;
    var tilesets = mapData.tilesets;
    var theTileset;

    tilesets.forEach(function(tileset){
      if (tileId < tileset.firstgid) return;
      if (tileId > tileset.firstgid + tileset.tilecount) return;
      theTileset = tileset;

      return false;
    });

    var columns = theTileset.imagewidth / theTileset.tilewidth;
    var subTileId = tileId - theTileset.firstgid;
    var column = subTileId % columns;
    var line = Math.floor(subTileId / columns);

    var frame = {
      width : theTileset.tilewidth,
      height : theTileset.tileheight,
      x : column * theTileset.tilewidth,
      y : line * theTileset.tileheight
    };

    var baseTexture = PIXI.Texture.fromImage(path.join(STUDIO.loadedGame.folder, 'map', theTileset.image));
    var texture = new PIXI.Texture(baseTexture);
    if (texture.baseTexture.isLoading) {
      texture.baseTexture.addListener('loaded', function(){
        texture.frame = frame;
      });
    } else {
      texture.frame = frame;
    }

    namespace._tileCache[tileId] = texture;
    return texture;
  };

  namespace.addTileSprite = function(layerTexture, texture, x, y, tileId) {
    var sprite = new PIXI.Sprite(texture);
    sprite.x = x * namespace._currentMapData.tilewidth;
    sprite.y = y * namespace._currentMapData.tileheight;
    sprite.tileId = tileId;

    var container = new PIXI.Container();
    container.addChild(sprite);

    layerTexture.render(container);
  };

  namespace.createLayers = function(width, height) {
    namespace._stage.removeChildren();
    namespace._transparentLayerTexture = null;

    namespace.createTransparentLayer(width, height);

    var mapData = namespace._currentMapData;
    var layers = mapData.layers;

    for (var i = 0; i < layers.length; i++) {
      var layerData = layers[i];

      var layerTexture = namespace._layerCache[layerData.name];
      if (!layerTexture) {
        layerTexture = new PIXI.RenderTexture(namespace._renderer, width, height);

        if (layerData.type == 'tilelayer') {
          var index = -1;

          for (var y = 0; y < layerData.height; y++) {
            for (var x = 0; x < layerData.width; x++) {
              index++;

              var tileId = layerData.data[index];
              if (tileId === 0) continue;

              var tileTexture = namespace.getTileTexture(tileId);
              if (tileTexture.baseTexture.isLoading) {
                tileTexture.baseTexture.addListener('loaded', function(){
                  namespace.addTileSprite(this.layerTexture, this.texture, this.x, this.y, this.tileId);
                }.bind({
                  x : x,
                  y : y,
                  tileId : tileId,
                  texture : tileTexture,
                  layerTexture : layerTexture
                }));
              } else {
                namespace.addTileSprite(layerTexture, tileTexture, x, y, tileId);
              }
            }
          }
        }
      }

      namespace._layerCache[layerData.name] = layerTexture;
      namespace._stage.addChild(new PIXI.Sprite(layerTexture));
    }
  };

  namespace.requestAnimationFrame = function() {
    if ($('.map-editor').length > 0) {
      window.requestAnimationFrame(namespace.update.bind(namespace));
    }
  };

  namespace.changeTile = function(x, y) {
    if (namespace._currentTileId < 0) return;

    var mapData = namespace._currentMapData;

    if (namespace._currentLayerIndex >= mapData.layers.length) {
      namespace._currentLayerIndex = 0;
    }
    if (mapData.layers.length <= 0) return;
    var layer = mapData.layers[namespace._currentLayerIndex];
    if (layer.type != "tilelayer") return;

    var tileWidth = mapData.tilewidth;
    var tileHeight = mapData.tileheight;

    var totalColumns = mapData.width;
    var totalRows = mapData.height;

    var tileset = mapData.tilesets[namespace._currentTilesetIndex];
    if (!tileset) return;

    var columns = tileset.imagewidth / tileWidth;

    var column;
    var row;
    var index;

    switch(namespace._currentTool) {
      case 'pencil' :
        column = Math.floor(x / tileWidth);
        row = Math.floor(y / tileHeight);
        index = totalColumns * row + column;

        layer.data[index] = namespace._currentTileId;
        break;
      case 'brush' :
        column = Math.floor(x / (tileWidth * 2)) * 2;
        row = Math.floor(y / (tileHeight * 2)) * 2;
        index = totalColumns * row + column;

        layer.data[index] = namespace._currentTileId;
        layer.data[index + 1] = namespace._currentTileId + 1;
        layer.data[index + totalColumns] = namespace._currentTileId + columns;
        layer.data[index + totalColumns + 1] = namespace._currentTileId + columns + 1;
        break;
      case 'eraser' :
        column = Math.floor(x / tileWidth);
        row = Math.floor(y / tileHeight);
        index = totalColumns * row + column;

        layer.data[index] = 0; 
        break;
    }

    namespace._layerCache[layer.name] = false;
    namespace._needsRefresh = true;
  };

  namespace.changeRectangle = function(x, y, x2, y2) {
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

    var mapData = namespace._currentMapData;
    var tileWidth = mapData.tilewidth;
    var tileHeight = mapData.tileheight;

    for (var tileX = left; tileX <= right; tileX += tileWidth) {
      for (var tileY = top; tileY <= bottom; tileY += tileHeight) {
        namespace.changeTile(tileX, tileY);
      }
    }
  };

  namespace.pickPos = function(x, y) {
    var mapData = namespace._currentMapData;
    if (mapData.layers.length <= 0) return;
    var layer = mapData.layers[namespace._currentLayerIndex];
    if (layer.type != "tilelayer") return;

    var tileWidth = mapData.tilewidth;
    var tileHeight = mapData.tileheight;

    var column = Math.floor(x / (tileWidth * 2)) * 2;
    var row = Math.floor(y / (tileHeight * 2)) * 2;

    var totalColumns = mapData.width;
    var totalRows = mapData.height;

    var index = totalColumns * row + column;

    namespace._currentTileId = layer.data[index];
  };

  namespace.update = function(){
    namespace._renderer.render(namespace._stage);
    namespace.requestAnimationFrame();
    namespace._needsRefresh = false;

    var pos = namespace.getMousePos();

    if (namespace.isLeftMouseClicked()) {
      if (namespace._currentDrawType != 'rectangle') {
        namespace.changeTile(pos.x, pos.y);
      } else if (!namespace._clickedPos) {
        namespace._clickedPos = {
          x : pos.x,
          y : pos.y
        };
      }
    } else if (namespace.isRightMouseClicked()) {
      namespace.pickPos(pos.x, pos.y);
    } else {
      if (!!namespace._clickedPos) {
        namespace.changeRectangle(namespace._clickedPos.x, namespace._clickedPos.y, pos.x, pos.y);
        namespace._clickedPos = false;
      }
    }

    if (namespace._needsRefresh) {
      namespace.onMapChange()
      namespace.createLayers(namespace._renderer.width, namespace._renderer.height);
    }

  };

})(STUDIO.MapEditor);