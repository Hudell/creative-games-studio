STUDIO.MapEditor = {};

(function(namespace){
  var fs = require('fs');
  var path = require('path');
  var gui = require('nw.gui');
  var win = gui.Window.get();

  namespace._currentTool = 'brush';
  namespace._currentDrawType = 'tile';
  namespace._currentTilesetIndex = -1;
  namespace._pickedArea = {
    top : 0,
    bottom : 0,
    left : 0,
    right : 0
  };
  namespace._currentMapName = '';
  namespace._currentMapData = null;
  namespace._tileCache = {};
  namespace._layerCache = {};
  namespace._currentTileIds = [];
  namespace._currentLayerIndex = 0;
  namespace._clickedPos = false;
  namespace._tilesetClickedPos = false;
  namespace._history = [];
  namespace._drawingRectangle = false;
  namespace._drawingTile = false;
  namespace._needsGridRefresh = false;
  namespace._lostContext = false;

  //I've left this here so that I can later check if the requestAnimationFrame was called more times than it should
  namespace._loops = 0;

  //Preloads the transparent png
  namespace._transparentSpriteTexture = PIXI.Texture.fromImage(path.join('img', 'transparent.png'));

  namespace.closeProject = function() {
    namespace._currentMapName = '';
    namespace._currentMapData = null;
    namespace._currentLayerIndex = 0;
    namespace._clickedPos = false;
    namespace._history = [];
    namespace._drawingRectangle = false;
    namespace._drawingTile = false;

    namespace.clearCaches();
  };

  namespace.openMapEditor = function(mapName, callback) {
    if (namespace._lostContext) {
      STUDIO.openWindow('context-lost');
      return;
    }

    STUDIO.gameData._lastMapName = mapName;

    var mapData = STUDIO.getMapData(mapName);
    if (!mapData) {
      throw new Error(t("Couldn't find the data for the map ") + mapName);
    }
    namespace._currentMapName = mapName;
    namespace._currentMapData = mapData;
    namespace._history = [];

    STUDIO.openWindow('map-editor', function(){
      var editorWidth = window.innerWidth - 524;
      var editorHeight = window.innerHeight - 104;
      
      $('#editor-wrapper').css('height', (editorHeight) + 'px');

      var mapWidth = mapData.width * mapData.tilewidth;
      var mapHeight = mapData.height * mapData.tileheight;

      namespace.showAvailableTools();
      namespace.initMapEditor();

      namespace.changeLayerIndex(0);

      namespace.loadTilesetList();
      namespace.loadLayerList();
      namespace.openFirstTileset();
      namespace.attachEvents();
      namespace.refreshoffgridPlacementIcon();
      namespace.refreshGridIcon();
      namespace.refreshObjectsAnywhereIcon();

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

  namespace.showAvailableTools = function() {
    $('#mapeditor-pencil-btn').removeClass('hidden');

    switch(namespace.mapType()) {
      case 'tche' :
        $('#mapeditor-brush-btn').removeClass('hidden');
        $('#mapeditor-autotiles-btn').removeClass('hidden');
        $('#mapeditor-options-offgrid').removeClass('hidden');
        
        namespace.changeToolToBrush();
        break;
      case 'tiled' :
        $('#mapeditor-brush-btn').addClass('hidden');
        $('#mapeditor-autotiles-btn').addClass('hidden');
        $('#mapeditor-options-offgrid').addClass('hidden');
        
        STUDIO.settings.offgridPlacement = false;
        namespace.changeToolToPencil();
        break;
    }
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
    $('#mapeditor-undo-btn').on('click', function(event){ event.preventDefault(); namespace.undo(); });

    $('#map-editor-tileset-zoom-in').on('click', function(event) {
      event.preventDefault();
      namespace.increaseTilesetZoom();
    });

    $('#map-editor-tileset-zoom-out').on('click', function(event) {
      event.preventDefault();
      namespace.decreaseTilesetZoom();
    });

    $('#map-editor-tileset-new').on('click', function(event){
      event.preventDefault();
      namespace.createNewTileset();
    });

    $('#map-editor-tileset-remove').on('click', function(event) {
      event.preventDefault();
      namespace.removeCurrentTilesetConfirmation();
    });

    $('#mapeditor-options-offgrid').on('click', function(event){
      event.preventDefault();
      namespace.toggleoffgridPlacement();
    });

    $('#mapeditor-options-show-grid').on('click', function(event){
      event.preventDefault();
      namespace.toggleGrid();
    });

    $('#mapeditor-options-objects-anywhere').on('click', function(event){
      event.preventDefault();
      namespace.toggleObjectsAnywhere();
    });

    $('#map-editor-object-new').on('click', function(event){
      event.preventDefault();
      namespace.createNewMapObject();
    });
  };

  namespace.mapType = function() {
    return STUDIO.gameData.maps[namespace._currentMapName];
  };

  namespace.updateMapZoom = function() {
    if (!namespace._renderer) return;

    var width = namespace._renderer.width;
    var height = namespace._renderer.height;

    width *= STUDIO.settings.mapZoomLevel;
    height *= STUDIO.settings.mapZoomLevel;

    namespace._renderer.view.style.width = width + 'px';
    namespace._renderer.view.style.height = height + 'px';
  };

  namespace.updateTilesetZoom = function() {
    namespace.refreshTilesetWindow();
  };

  namespace.increaseTilesetZoom = function() {
    if (STUDIO.settings.tilesetZoomLevel < 2) {
      STUDIO.settings.tilesetZoomLevel += 0.25;
    }

    namespace.updateTilesetZoom();
  };

  namespace.decreaseTilesetZoom = function() {
    if (STUDIO.settings.tilesetZoomLevel > 0.25) {
      STUDIO.settings.tilesetZoomLevel -= 0.25;
    }

    namespace.updateTilesetZoom();
  };

  namespace.changeTool = function(toolName, iconClass) {
    namespace._currentTool = toolName;
    $('#map-editor-tool-types').html('<i class="fa fa-' + iconClass + ' fa-fw red-color"></i> <i class="fa fa-caret-down"></i>');

    switch (toolName) {
      case 'brush' :
        namespace._pickedArea = {top : 0, bottom : 0.5, right : 0.5, left : 0};
        break;
      default :
        namespace._pickedArea = {top : 0, bottom : 0, right : 0, left : 0};
        break;
    }

    namespace.refreshGrid();
    namespace.refreshTilesetWindow();
  };

  namespace.changeDrawType = function(drawType, iconClass) {
    namespace._currentDrawType = drawType;
    $('#map-editor-draw-types').html('<i class="fa fa-' + iconClass + ' fa-fw red-color"></i> <i class="fa fa-caret-down"></i>');
  };

  namespace.changeToolToPencil = function() {
    namespace.changeTool('pencil', 'pencil');
    namespace.updatePickedArea();
  };

  namespace.changeToolToBrush = function() {
    namespace.changeTool('brush', 'paint-brush');
    namespace.updatePickedArea();
  };

  namespace.changeToolToAutoTile = function() {
    namespace.changeTool('auto-tile', 'magic');
  };

  namespace.changeToolToEraser = function() {
    namespace.changeTool('eraser', 'eraser');
    namespace.updatePickedArea();
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
    if (STUDIO.settings.mapZoomLevel < 4) {
      STUDIO.settings.mapZoomLevel += 0.25;
    }

    namespace.updateMapZoom();
  };

  namespace.zoomOut = function() {
    if (STUDIO.settings.mapZoomLevel > 0.25) {
      STUDIO.settings.mapZoomLevel -= 0.25;
    }

    namespace.updateMapZoom();
  };

  namespace.loadLayerList = function() {
    var list = $('#map-editor-layer-list');
    list.html('');

    list.append('<li><a class="map-editor-manage-layers" id="map-editor-manage-layers-btn" href="#"><i class="fa fa-cogs fa-fw"></i> ' + t("Manage Layers") + ' </a></li>');
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
    list.append('<li class="divider"></li>');
    list.append('<li><a class="map-editor-layer-new" href="#"><i class="fa fa-plus fa-fw"></i> ' + t("New Layer") + ' </a></li>');

    $('.map-editor-layer-link').on('click', function(event) {
      event.preventDefault();

      var link = $(event.currentTarget);
      var layerIndex = event.currentTarget.dataset.index;
      namespace.changeLayerIndex(layerIndex);
    });

    $('.map-editor-layer-new').on('click', function(event){
      event.preventDefault();
      namespace.createNewLayer();
    });

    $('#map-editor-manage-layers-btn').on('click', function(event){
      event.preventDefault();
      namespace.manageLayers();
    });    
  };

  namespace.changeLayerIndex = function(index) {
    namespace._currentLayerIndex = index;

    var layersStr = t("Layers");

    if (namespace._currentMapData.layers.length > index && index >= 0) {
      var layerName = namespace._currentMapData.layers[index].name;
      $('#map-editor-layer-name').html(layersStr + ' - ' + layerName);
    } else {
      $('#map-editor-layer-name').html(layersStr);
    }

    namespace.refreshTilesetWindow();
  };

  namespace.loadTilesetList = function() {
    var list = $('#map-editor-tileset-list');
    list.html('');

    var tilesets = namespace._currentMapData.tilesets;
    for (var i = 0; i < tilesets.length; i++) {
      list.append('<li><a class="map-editor-tileset-link" data-index="' + i + '" href="#"><i class="fa fa-folder-o fa-fw tileset-icon"></i> ' + tilesets[i].name + '</a></li>');
    }

    list.append('<li class="divider"></li>');
    list.append('<li><a class="map-editor-tileset-new" href="#"><i class="fa fa-plus fa-fw"></i> ' + t("Add New Tileset") + '</a></li>');

    $('.map-editor-tileset-link').on('click', function(event) {
      event.preventDefault();
      namespace.registerOpenTileset(event.currentTarget.dataset.index);
    });

    $('.map-editor-tileset-new').on('click', function(event){
      event.preventDefault();
      namespace.createNewTileset();
    });
  };

  namespace.registerOpenTileset = function(index) {
    $('.tileset-icon').removeClass('fa-folder-open-o');
    $('.tileset-icon').addClass('fa-folder-o');

    var tilesets = namespace._currentMapData.tilesets;
    $('#map-editor-tileset-tiles').html('');
    if (tilesets.length < index || index < 0) return;

    var link = $('a[data-index=' + index + ']');
    link.children('.tileset-icon').addClass('fa-folder-open-o');
    link.children('.tileset-icon').removeClass('fa-folder-o');

    namespace._currentTilesetIndex = index;
    var tileset = tilesets[index];
    namespace.openTileset(tileset);
  };

  namespace.resizeLayer = function(layer, width, height) {
    if (layer.type !== "tilelayer") return;

    var organizedData = [];
    var index = -1;
    for (var y = 0; y < layer.height; y++) {
      organizedData[y] = [];

      for (var x = 0; x < layer.width; x++) {
        index++;

        organizedData[y][x] = layer.data[index];
      }
    }

    index = -1;
    for (y = 0; y < height; y++) {
      for (x = 0; x < width; x++) {
        index++;

        if (!!organizedData[y]) {
          layer.data[index] = organizedData[y][x] || 0;
        } else {
          layer.data[index] = 0;
        }
      }
    }

    layer.width = width;
    layer.height = height;
  };

  namespace.openMapSettings = function() {
    var mapData = namespace._currentMapData;
    STUDIO.openPopupForm('map-settings', t("Map Settings"), function(){
      var newWidth = parseInt($('#map-settings-width').val(), 10);
      var newHeight = parseInt($('#map-settings-height').val(), 10);

      if (newWidth <= 0) {
        throw new Error(t("The width needs to be a positive number."));
      }

      if (newHeight <= 0) {
        throw new Error(t("The height needs to be a positive number."));
      }

      mapData.width = newWidth;
      mapData.height = newHeight;

      if (namespace.mapType() == 'tche') {
        mapData.width *= 2;
        mapData.height *= 2;
      }

      for (var i = 0; i < mapData.layers.length; i++) {
        namespace.resizeLayer(mapData.layers[i], mapData.width, mapData.height);
      }

      namespace.onMapChange();
      namespace.openMapEditor(namespace._currentMapName);
    }, function(){

      var oldWidth = mapData.width;
      var oldHeight = mapData.height;

      if (namespace.mapType() == 'tche') {
        oldWidth /= 2;
        oldHeight /= 2;
      }

      $('#map-settings-width').val(oldWidth);
      $('#map-settings-height').val(oldHeight);
    });
  };

  namespace.getSelectionSize = function() {
    var mapData = namespace._currentMapData;
    var tileWidth = mapData.tilewidth;
    var tileHeight = mapData.tileheight;
    var mapColumns = mapData.width;

    var layer = mapData.layers[namespace._currentLayerIndex];
    if (!!layer && layer.type == 'objectgroup') {
      return {
        width : tileWidth * 2,
        height : tileHeight * 2
      };
    }

    var tiles = namespace._currentTileIds;

    var width = 0;
    var height = 0;

    for (var i = 0; i < tiles.length; i++) {
      var tileId = tiles[i];
      if (tileId === undefined) continue;

      if (i < mapColumns && i >= width) {
        width = i + 1;
      }

      var aux = i;
      var row = 1;
      while (aux >= mapColumns) {
        aux -= mapColumns;
        row++;
      }

      if (row > height) {
        height = row;
      }
    }

    return {
      width : width * tileWidth,
      height : height * tileHeight
    };
  };

  namespace.getFakeTileSize = function() {
    var mapData = namespace._currentMapData;
    var tileWidth = mapData.tilewidth;
    var tileHeight = mapData.tileheight;
    var tileWidthWithSpacing = mapData.tilewidth;
    var tileHeightWithSpacing = mapData.tileheight;
    var realWidth = mapData.tilewidth;
    var realHeight = mapData.tileheight;
    var realWidthWithSpacing = realWidth;
    var realHeightWithSpacing = realHeight;
    var allowHalf = false;
    var spacing = 0;
    var halfSpacing = 0;

    var tileset = mapData.tilesets[namespace._currentTilesetIndex];
    if (!!tileset) {
      spacing = tileset.spacing;
      halfSpacing = spacing;
    }

    if (namespace.mapType() == 'tche') {
      halfSpacing /= 2;
      realWidthWithSpacing += halfSpacing;
      realHeightWithSpacing += halfSpacing;
      switch(namespace._currentTool) {
        case 'pencil' :
          tileWidthWithSpacing += halfSpacing;
          tileHeightWithSpacing += halfSpacing;
          break;
        case 'auto-tile' :
          tileWidth *= 4;
          tileHeight *= 6;
          break;
        case 'eraser' :
          tileWidthWithSpacing += halfSpacing;
          tileHeightWithSpacing += halfSpacing;
          break;
        default :
          tileWidth *= 2;
          tileHeight *= 2;
          tileWidthWithSpacing = tileWidth + spacing;
          tileHeightWithSpacing = tileHeight + spacing;
          allowHalf = true;
          break;
      }
    } else {
      tileWidthWithSpacing += spacing;
      tileHeightWithSpacing += spacing;
      realWidthWithSpacing += spacing;
      realHeightWithSpacing += spacing;
    }

    return {
      width : tileWidth,
      height : tileHeight,
      allowHalf  : allowHalf,
      spacing : spacing,
      halfSpacing : halfSpacing,
      widthWithSpacing : tileWidthWithSpacing,
      heightWithSpacing : tileHeightWithSpacing,
      realWidth : realWidth,
      realHeight : realHeight,
      realWidthWithSpacing : realWidthWithSpacing,
      realHeightWithSpacing : realHeightWithSpacing
    };
  };

  namespace.refreshGrid = function(){
    if (!!namespace._gridLayerTexture) {
      namespace._gridLayerTexture.refreshGrid();
    }
  };

  namespace.refreshTilesetWindow = function(tileset) {
    if (!tileset) {
      if (!namespace._currentTileset) {
        return;
      }

      tileset = namespace._currentTileset;
    }

    namespace._currentTileset = tileset;

    var mapData = namespace._currentMapData;
    var layer = mapData.layers[namespace._currentLayerIndex];
    if (!!layer && layer.type == 'objectgroup') {
      namespace.setupObjectList();
    } else {
      var imgPath = path.join(STUDIO.settings.folder, 'maps', tileset.image);
      var width = tileset.imagewidth;
      var height = tileset.imageheight;

      var size = namespace.getFakeTileSize();
      var tileWidth = size.width;
      var tileHeight = size.height;

      var columns = width / tileWidth;
      var rows = height / tileHeight;

      namespace.setupTileset(imgPath, tileWidth, tileHeight, columns, rows, size.allowHalf);
    }
  };

  namespace.setupObjectList = function() {
    var el = $('.map-editor-tileset');
    el.html('');

    if (!!namespace._tilesetRenderer) {
      STUDIO.renderers.splice(STUDIO.renderers.indexOf(namespace._tilesetRenderer), 1);
      namespace._tilesetRenderer.destroy();
      namespace._tilesetRenderer = null;
    }

    $('#object-toolbar').removeClass('hidden');
    $('#tileset-toolbar').addClass('hidden');

    el.html('<ul class="nav object-list"></ul>');

    var mapData = namespace._currentMapData;
    if (!mapData) return;

    var layer = mapData.layers[namespace._currentLayerIndex];
    if (!layer) return;
    if (layer.type !== 'objectgroup') return;

    var list = el.find('.object-list');
    for (var i = 0; i < layer.objects.length; i++) {
      var object = layer.objects[i];

      var name = object.name;
      if (name.trim() === '') {
        name = t("Object") + ' #' + object.id;
      }

      list.append('<li><a href="#"><i class="menu-option fa fa-umbrella fa-fw"></i> ' + name + '</span></a></li>');
    }
  };

  namespace.checkIfObjectNameExists = function(objectName) {
    objectName = objectName.toLowerCase();

    var mapData = namespace._currentMapData;
    if (!mapData) return false;

    for (var layerIndex = 0; layerIndex < mapData.layers.length; layerIndex++) {
      var layer = mapData.layers[layerIndex];
      if (layer.type !== 'objectgroup') continue;

      for (var i = 0; i < layer.objects.length; i++) {
        if (layer.objects[i].name.toLowerCase() == objectName) {
          return true;
        }
      }
    }

    return false;
  };

  namespace.checkIfObjectIdExists = function(objectId) {
    var mapData = namespace._currentMapData;
    if (!mapData) return false;

    for (var layerIndex = 0; layerIndex < mapData.layers.length; layerIndex++) {
      var layer = mapData.layers[layerIndex];
      if (layer.type !== 'objectgroup') continue;

      for (var i = 0; i < layer.objects.length; i++) {
        if (layer.objects[i].d == objectId) {
          return true;
        }
      }
    }

    return false;
  };

  namespace.getNameForNewObject = function() {
    var name = t("Object") + ' ';
    var index = 1;

    while (namespace.checkIfObjectNameExists(name + index)) {
      index++;
    }

    return name + index;
  };

  namespace.getIdForNewObject = function() {
    var id = 1;

    while (namespace.checkIfObjectIdExists(id)) {
      id++;
    }

    return id;
  };

  namespace.updateSpriteThumbnail = function() {

  };

  namespace.createNewMapObject = function(x, y) {
    var mapData = namespace._currentMapData;
    var layer = mapData.layers[namespace._currentLayerIndex];
    x = x || 0;
    y = y || 0;

    if (!STUDIO.settings.placeObjectsAnywhere) {
      x = Math.floor(x / (mapData.tilewidth * 2)) * mapData.tilewidth * 2;
      y = Math.floor(y / (mapData.tileheight * 2)) * mapData.tileheight * 2;
    }

    STUDIO.openPopupForm('new-map-object', t("New Map Object"), function(){
      var newObject = {
        height : mapData.tileheight * 2,
        width : mapData.tilewidth * 2,
        id : namespace.getIdForNewObject(),
        properties : {
          sprite : ""
        },
        rotation : 0,
        visible : true,
        type : "",
        name : "",
        x : 0,
        y : 0
      };

      newObject.name = $('#map-object-name').val();
      newObject.type = $('#map-object-type').val();
      newObject.properties.sprite = $('#map-object-sprite').val();
      newObject.x = parseInt($('#map-object-x').val(), 10);
      newObject.y = parseInt($('#map-object-y').val(), 10);

      //#ToDo: Validate type and sprite

      layer.objects.push(newObject);
      namespace.onMapChange();

      namespace.setupObjectList();
    }, function(){
      // STUDIO.ObjectManager.fillFilteredObjects('objectType', 'MapObject');
      // STUDIO.fillSprites('objectSprite');

      $('#map-object-name').val(namespace.getNameForNewObject());
      $('#map-object-x').attr('max', mapData.width * mapData.tilewidth);
      $('#map-object-y').attr('max', mapData.height * mapData.tileheight);
      $('#map-object-sprite-btn').on('click', function(){
        STUDIO.Picker.pickSprite(function(spriteName){
          $('#map-object-sprite').val(spriteName);
          if (!!spriteName) {
            $('#map-object-sprite-btn').html(spriteName);
          } else {
            $('#map-object-sprite-btn').html(t("Choose a Sprite"));
          }
        });
      });
      $('#map-object-type-btn').on('click', function(){
        STUDIO.Picker.pickType('MapObject', function(typeName){
          $('#map-object-type').val(typeName);
          $('#map-object-type-btn').html(typeName);
        });
      });

      $('#map-object-x').val(x);
      $('#map-object-y').val(y);
    });
  };

  namespace.openTileProperties = function(pos) {
    console.log(pos);
  };

  namespace.createRenderer = function(width, height) {
    var options = {
      transparent : true
    };

    // return new PIXI.CanvasRenderer(width, height, options);
    return PIXI.autoDetectRenderer(width, height, options);
  };

  namespace.setupTileset = function(imagePath, tileWidth, tileHeight, columns, rows, allowHalf) {
    $('.map-editor-tileset').html('');
    $('#tileset-toolbar').removeClass('hidden');
    $('#object-toolbar').addClass('hidden');

    var img = new Image();
    img.onload = function() {
      var imageWidth = img.width;
      var imageHeight = img.height;
      var zoomLevel = STUDIO.settings.tilesetZoomLevel;

      imageWidth *= zoomLevel;
      imageHeight *= zoomLevel;

      $('.map-editor-tileset').css('height', $('#editor-wrapper').css('height'));

      var tilesetEditor = $('.map-editor-tileset');

      namespace._tileMouseDown = false;
      if (!!namespace._tilesetRenderer) {
        STUDIO.renderers.splice(STUDIO.renderers.indexOf(namespace._tilesetRenderer), 1);
        namespace._tilesetRenderer.destroy();
        namespace._tilesetRenderer = null;
        tilesetEditor.html('');
      }

      if (tilesetEditor.length > 0) {
        STUDIO.renderers = STUDIO.renderers || [];
        namespace._tilesetRenderer = namespace.createRenderer(img.width, img.height);
        STUDIO.renderers.push(namespace._tilesetRenderer);

        tilesetEditor.html('');
        tilesetEditor[0].appendChild(namespace._tilesetRenderer.view);

        namespace._tilesetRenderer.view.style.width = imageWidth + 'px';
        namespace._tilesetRenderer.view.style.height = imageHeight + 'px';
        var canvas = $(namespace._tilesetRenderer.view);

        canvas.on('webglcontextlost', function(evt){
          evt.preventDefault();
          namespace._lostContext = true;
          
          console.log("WebGL Context lost");
          STUDIO.openWindow('context-lost');
        });
        canvas.on('webglcontextrestored', function(evt){
          console.log("WebGL Context restored");
          namespace._lostContext = false;
          STUDIO.showMessage(t("Creative Studio recovered from a WebGl context loss. You can continue modifying your map now."));
          namespace.openMapEditor(namespace._currentMapName);
        });

        canvas.addClass('tileset-canvas');
        namespace._tilesetStage = new PIXI.Container();

        var imageTexture = PIXI.Sprite.fromImage(imagePath);
        namespace._tilesetStage.addChild(imageTexture);

        namespace.createTilesetSelectionLayer(img.width, img.height);
        namespace._tilesetStage.addChild(new PIXI.Sprite(namespace._tilesetSelectionLayerTexture));
        namespace._tilesetSelectionLayerTexture.refreshSelection();
        
        var getPosFromEvent = function(event, allowFloat) {
          allowFloat = allowFloat || false;

          var posX = event.offsetX;
          var posY = event.offsetY;

          posX /= STUDIO.settings.tilesetZoomLevel;
          posY /= STUDIO.settings.tilesetZoomLevel;

          console.log(posX, posY);
          var size = namespace.getFakeTileSize();

          var tileWidth = size.widthWithSpacing;
          var tileHeight = size.heightWithSpacing;

          if (size.allowHalf && allowFloat) {
            tileWidth /= 2;
            tileHeight /= 2;
          }

          var column = Math.floor(posX / tileWidth);
          var row = Math.floor(posY / tileHeight);

          if (size.allowHalf && allowFloat) {
            column /= 2;
            row /= 2;
          }

          return {column : column, row : row};
        };
        
        canvas.on('mousedown', function(event) {
          event.preventDefault();
          if (event.button === 0) {
            namespace._tileMouseDown = getPosFromEvent(event);
          } else if (event.button == 2) {
            namespace.openTileProperties(getPosFromEvent(event));
          }
        });

        canvas.on('mousemove', function(evt){
          namespace._needsTilesetRefresh = true;
        });

        canvas.on('mouseout', function(evt){
          namespace._needsTilesetRefresh = true;
        });

        canvas.on('mouseup', function(event) {
          event.preventDefault();
          var pos = getPosFromEvent(event);
          var size = namespace.getFakeTileSize();

          if (event.button === 0) {
            if (!!namespace._tileMouseDown) {
              var oldPos = namespace._tileMouseDown;

              namespace.pickArea(oldPos.column, oldPos.row, pos.column, pos.row);
              namespace._tileMouseDown = false;
            } else {
              if (size.allowHalf) {
                namespace.pickArea(pos.column, pos.row, pos.column + 0.5, pos.row + 0.5);
              } else {
                namespace.pickTile(pos.column, pos.row);
              }
            }
          }
        });

        canvas.on('dblclick', function(event){
          event.preventDefault();

          var pos = getPosFromEvent(event, true);
          var size = namespace.getFakeTileSize();

          if (size.allowHalf) {
            namespace.pickArea(pos.column, pos.row, pos.column + 0.5, pos.row + 0.5, true);
          }
        });
      }
    };

    img.src = imagePath;
  };

  namespace.pickArea = function(column, row, column2, row2, isOffGridBrush) {
    var left = column;
    var right = column2;
    var top = row;
    var bottom = row2;

    //isOffGridBrush represents the alternative area that is highlighted with a red square when the brush is used
    isOffGridBrush = isOffGridBrush || false;

    if (left > right) {
      right = column;
      left = column2;
    }

    if (top > bottom) {
      top = row2;
      bottom = row;
    }

    var size = namespace.getFakeTileSize();
    if (size.allowHalf) {
      if (!isOffGridBrush) {
        if (left != Math.floor(left)) {
          left -= 0.5;
        }

        if (right != Math.floor(right)) {
          right -= 0.5;
        }

        if (right == Math.floor(right)) {
          right += 0.5;
        }

        if (bottom == Math.floor(bottom)) {
          bottom += 0.5;
        }
      }
    }

    namespace._pickedArea = {
      top : top,
      bottom : bottom,
      right : right,
      left : left
    };

    namespace.updatePickedArea();
  };

  namespace.pickTile = function(column, row) {
    if (namespace._currentTool == 'eraser') {
      namespace.changeToolToBrush();
    }

    namespace._pickedArea = {
      top : parseFloat(row),
      bottom : parseFloat(row),
      left : parseFloat(column),
      right : parseFloat(column)
    };

    namespace.updatePickedArea();
  };

  namespace.updatePickedArea = function() {
    var size = namespace.getFakeTileSize();
    var tilesetIndex = namespace._currentTilesetIndex;
    var mapData = namespace._currentMapData;

    if (tilesetIndex < 0) return;
    if (tilesetIndex >= mapData.tilesets.length) return;
    if (!tilesetIndex && tilesetIndex !== 0) return;

    var tileset = mapData.tilesets[tilesetIndex];
    var left = namespace._pickedArea.left;
    var top = namespace._pickedArea.top;
    var right = namespace._pickedArea.right;
    var bottom = namespace._pickedArea.bottom;

    var mapColumns = mapData.width;

    var tileWidth = size.width;
    var tileHeight = size.height;
    var tileWidthWithSpacing = size.widthWithSpacing;
    var tileHeightWithSpacing = size.heightWithSpacing;
    var realTileWidthWithSpacing = size.realWidthWithSpacing;
    var realTileHeightWithSpacing = size.realHeightWithSpacing;
    var totalColumns = (tileset.imagewidth + size.spacing) / realTileWidthWithSpacing;
    var totalRows = (tileset.imageheight + size.spacing) / realTileHeightWithSpacing;

    namespace._currentTileIds = [];

    var increment = 1;
    if (size.allowHalf) {
      increment = 0.5;

      var diff = right - left;
      if (diff % 2 == 1) {
        right += 0.5;
      }

      diff = bottom - top;
      if (diff % 2 == 1) {
        bottom += 0.5;
      }
    }

    var leftX = Math.ceil(left * tileWidthWithSpacing);
    var topY = Math.ceil(top * tileHeightWithSpacing);

    var realLeftColumn = Math.floor(leftX / realTileWidthWithSpacing);
    var realTopRow = Math.floor(topY / realTileHeightWithSpacing);
    var mapType = namespace.mapType();

    for (var column = left; column <= right; column += increment) {
      for (var row = top; row <= bottom; row += increment) {
        var x = Math.ceil(column * tileWidthWithSpacing);
        var y = Math.ceil(row * tileHeightWithSpacing);

        var realColumn = Math.floor(x / realTileWidthWithSpacing);
        var realRow = Math.floor(y / realTileHeightWithSpacing);
        
        var tileId = realRow * totalColumns + realColumn + tileset.firstgid;
        var index = realColumn - realLeftColumn;
        index += (realRow - realTopRow) * mapColumns;

        namespace._currentTileIds[index] = tileId;
      }
    }

    namespace._needsTilesetRefresh = true;
  };

  namespace.openFirstTileset = function() {
    var mapData = namespace._currentMapData;
    if (mapData.tilesets.length > 0) {
      namespace.registerOpenTileset(0);
    }
    else {
      namespace.refreshTilesetWindow();
    }
  };

  namespace.openTileset = function(tileset) {
    namespace.openTilesetWindow(tileset);
  };

  namespace.openTilesetWindow = function(tileset) {
    $('#map-editor-tileset-tiles').html('');

    STUDIO.requestPage(path.join('windows', 'tileset.html'), function(result, xhr){
      var html = xhr.responseText;

      $('#map-editor-tileset-tiles').html(html);
      $('.map-editor-tileset').css('height', $('#editor-wrapper').css('height'));

      namespace.refreshTilesetWindow(tileset);
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

  namespace.toggleoffgridPlacement = function() {
    STUDIO.settings.offgridPlacement = !STUDIO.settings.offgridPlacement;
    namespace.refreshoffgridPlacementIcon();
    this.refreshGrid();
  };

  namespace.toggleGrid = function() {
    STUDIO.settings.showGrid = !STUDIO.settings.showGrid;
    namespace.refreshGridIcon();
    namespace.refreshGrid();
  };

  namespace.toggleObjectsAnywhere = function() {
    STUDIO.settings.placeObjectsAnywhere = !STUDIO.settings.placeObjectsAnywhere;
    namespace.refreshObjectsAnywhereIcon();
  };

  namespace.refreshCheckIcon = function(el, checked) {
    if (!!checked) {
      el.removeClass('fa-square-o');
      el.addClass('fa-check-square-o');
    } else {
      el.removeClass('fa-check-square-o');
      el.addClass('fa-square-o');
    }
  };

  namespace.refreshoffgridPlacementIcon = function() {
    var el = $('#mapeditor-options-offgrid').find('i');
    namespace.refreshCheckIcon(el, !!STUDIO.settings.offgridPlacement);
  };

  namespace.refreshGridIcon = function() {
    var el = $('#mapeditor-options-show-grid').find('i');
    namespace.refreshCheckIcon(el, !!STUDIO.settings.showGrid);
  };

  namespace.refreshObjectsAnywhereIcon = function() {
    var el = $('#mapeditor-options-objects-anywhere').find('i');
    namespace.refreshCheckIcon(el, !!STUDIO.settings.placeObjectsAnywhere);
  };

  namespace.removeCurrentTilesetConfirmation = function() {
    var mapData = namespace._currentMapData;
    var index = namespace._currentTilesetIndex;

    if (index < 0 || index >= mapData.tilesets.length) {
      throw new Error(t("There's no Tileset to remove."));
    }

    STUDIO.confirm(t("The current tileset will be removed from this map"), function(){
      namespace.removeCurrentTileset();
    }, t("Delete Confirmation"));
  };

  namespace.removeCurrentTileset = function() {
    var mapData = namespace._currentMapData;
    var index = namespace._currentTilesetIndex;

    if (index < 0 || index >= mapData.tilesets.length) {
      throw new Error(t("There's no Tileset to remove."));
    }

    namespace.removeTilesetFromMap(mapData, index);
    namespace._currentTilesetIndex = -1;

    index--;
    if (index < 0 && mapData.tilesets.length > 0) {
      index = 0;
    }

    namespace.registerOpenTileset(index);
  };

  namespace.removeCurrentMapConfirmation = function() {
    if (STUDIO._windowName !== 'map-editor') {
      throw new Error(t("There's no map loaded."));
    }

    STUDIO.confirm(t("The following map will be removed:" + STUDIO.removeFileExtension(namespace._currentMapName)), function(){
      namespace.removeCurrentMap();
    });
  };

  namespace.removeCurrentMap = function() {
    STUDIO.changeMap(namespace._currentMapName, null);
    delete STUDIO.gameData.maps[namespace._currentMapName];

    STUDIO.openWindow('maps');
  };

  namespace.removeTilesetFromMap = function(mapData, tilesetIndex) {
    var tilesetData = mapData.tilesets[tilesetIndex];
    var minTileId = tilesetData.firstgid;
    var maxTileId = minTileId + tilesetData.tilecount - 1;

    for (var layerIndex = 0; layerIndex < mapData.layers.length; layerIndex++) {
      var layer = mapData.layers[layerIndex];
      if (!layer) return;
      if (layer.type !== 'tilelayer') continue;

      namespace._layerCache[layer.name] = false;

      for (var i = 0; i < layer.data.length; i++) {
        if (layer.data[i] >= minTileId) {
          if (layer.data[i] <= maxTileId) {
            layer.data[i] = 0;
          } else {
            layer.data[i] -= tilesetData.tilecount;
          }
        }
      }
    }

    mapData.tilesets.splice(tilesetIndex, 1);
    
    namespace.adjustMapTilesetsData(mapData);
    STUDIO.changeMap(namespace._currentMapName, mapData);
    namespace.loadTilesetList();

    namespace._tileCache = {};
    namespace._needsRefresh = true;
    namespace._needsTilesetRefresh = true;
  };

  namespace.hasAnyTileset = function() {
    if (!STUDIO.gameData.tilesets) {
      return false;
    }

    for (var key in STUDIO.gameData.tilesets) {
      return true;
    }

    return false;
  };

  namespace.createNewTileset = function() {
    if (!namespace.hasAnyTileset()) {
      throw new Error(t("There are no registered tilesets. <br/>You need to register them on the Database before using on maps."));
    }

    STUDIO.openPopupForm('map-editor-new-tileset', t("Add Tileset"), function(){
      var tilesetName = $('#map-editor-new-tileset-name').val();
      if (!tilesetName || !tilesetName.trim()) {
        throw new Error(t("Select a Tileset."));
      }
      
      namespace.addTilesetToMap(namespace._currentMapData, tilesetName, true);
    }, function(){
      STUDIO.TilesetManager.fillTilesets('map-editor-new-tileset-name');
    });
  };

  namespace.addTilesetToMap = function(mapData, tilesetName, switchMap) {
    var tilesetData = STUDIO.gameData.tilesets[tilesetName];
    if (!tilesetData) {
      throw new Error(t("Tileset not found."));
    }

    if (tilesetData.tileWidth > 0 && tilesetData.tileWidth !== mapData.tilewidth) {
      throw new Error(t("This tileset is not compatible with this map."));
    }

    if (tilesetData.tileHeight > 0 && tilesetData.tileHeight !== mapData.tileheight) {
      throw new Error(t("This tileset is not compatible with this map."));
    }

    var relativeFileName = path.join('..', tilesetData.image);
    var fullPath = path.join(STUDIO.settings.folder, tilesetData.image);

    namespace._history = [];

    var img = new Image();
    img.onload = function(){
      var imageheight = img.height;
      var imagewidth = img.width;
      var columns = Math.floor(imagewidth / mapData.tilewidth);
      var rows = Math.floor(imageheight / mapData.tileheight);

      var newTileset = {
        columns : columns,
        image : relativeFileName,
        imageheight : imageheight,
        imagewidth : imagewidth,
        margin : 0,
        name : tilesetName,
        spacing : tilesetData.spacing,
        tilecount : columns * rows,
        tileheight : tilesetData.tileHeight || mapData.tileheight,
        tilewidth : tilesetData.tileWidth || mapData.tilewidth,
        // The firstgid property will be filled by the adjustMapTilesetsData method
        firstgid : 0,
        properties :  {
        }
      };

      var index = mapData.tilesets.length;
      mapData.tilesets.push(newTileset);
      namespace.adjustMapTilesetsData(mapData);
      STUDIO.changeMap(namespace._currentMapName, namespace._currentMapData);
      namespace.loadTilesetList();

      if (switchMap) {
        namespace.registerOpenTileset(index);
      }
    };

    img.name = fullPath;
    img.src = fullPath;
  };

  namespace.adjustMapTilesetsData = function(mapData) {
    var gid = 1;
    for (var i = 0; i < mapData.tilesets.length; i++) {
      mapData.tilesets[i].firstgid = gid;
      gid += mapData.tilesets[i].tilecount;
    }
  };

  namespace.addLayerToMap = function(mapData, layerName, layerType) {
    var newLayer = {
      name : layerName,
      visible : true,
      x : 0,
      y : 0,
      opacity : 1,
      type : layerType,
      width : mapData.width,
      height : mapData.height,
      properties : []
    };

    switch(layerType) {
      case 'tilelayer' :
        newLayer.data = [];
        var tiles = mapData.width * mapData.height;
        for (var i = 0; i < tiles; i++) {
          newLayer.data[i] = 0;
        }

        break;
      case 'objectgroup' :
        newLayer.objects = [];

        break;
    }

    mapData.layers.push(newLayer);
  };

  namespace.loadLayerManagerList = function() {
    var list = $('#layer-manager-layer-list');
    list.html('');

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

      var item = '';
      item += '<i class="fa fa-trash fa-fw" data-index=' + i + '></i>';

      if (layers[i].visible) {
        item += '<i class="fa fa-eye fa-fw" data-index=' + i + '></i>';
      } else {
        item += '<i class="fa fa-eye-slash fa-fw" data-index=' + i + '></i>';
      }
      
      if (i > 0) {
        item += '<i class="fa fa-arrow-up fa-fw" data-index=' + i + '></i>';
      } else {
        item += '<i class="fa fa-fw"></i>';
      }
      if (i < layers.length - 1) {
        item += '<i class="fa fa-arrow-down fa-fw" data-index=' + i + '></i>';
      } else {
        item += '<i class="fa fa-fw"></i>';
      }
      
      item += '<i class="fa fa-fw"></i>';
      item += '<i class="fa ' + icon + ' fa-fw layer-icon"></i>';
      item += ' ';
      item += layers[i].name;
      item += '</br>';

      list.append(item);
    }

    $('#layer-manager-layer-list').find('.fa-trash').on('click', function(event){
      var link = $(event.currentTarget);
      var layerIndex = event.currentTarget.dataset.index;
      namespace.trashLayerConfirmation(layerIndex);
    });

    $('#layer-manager-layer-list').find('.fa-eye').on('click', function(event){
      var link = $(event.currentTarget);
      var layerIndex = event.currentTarget.dataset.index;

      namespace.toggleLayerVisibility(layerIndex);
    });

    $('#layer-manager-layer-list').find('.fa-eye-slash').on('click', function(event){
      var link = $(event.currentTarget);
      var layerIndex = event.currentTarget.dataset.index;
      namespace.toggleLayerVisibility(layerIndex);
    });

    $('#layer-manager-layer-list').find('.fa-arrow-down').on('click', function(event){
      var link = $(event.currentTarget);
      var layerIndex = event.currentTarget.dataset.index;
      namespace.moveLayerDown(layerIndex);
    });

    $('#layer-manager-layer-list').find('.fa-arrow-up').on('click', function(event){
      var link = $(event.currentTarget);
      var layerIndex = event.currentTarget.dataset.index;
      namespace.moveLayerUp(layerIndex);
    });
  };

  namespace.swapLayers = function(oldIndex, newIndex) {
    if (oldIndex == newIndex) return;

    var mapData = namespace._currentMapData;
    if (!mapData) return;

    if (oldIndex >= 0 && oldIndex < mapData.layers.length && newIndex >= 0 && newIndex < mapData.layers.length) {
      var oldLayer = mapData.layers[oldIndex];
      var newLayer = mapData.layers[newIndex];

      mapData.layers[oldIndex] = newLayer;
      mapData.layers[newIndex] = oldLayer;

      namespace.onMapChange();
      namespace.loadLayerManagerList();
    }
  };

  namespace.moveLayerUp = function(layerIndex) {
    namespace.swapLayers(layerIndex, Number(layerIndex) -1);
  };

  namespace.moveLayerDown = function(layerIndex) {
    namespace.swapLayers(layerIndex, Number(layerIndex) + 1);
  };

  namespace.toggleLayerVisibility = function(layerIndex) {
    var mapData = namespace._currentMapData;
    if (!mapData) return;

    if (layerIndex >= 0 && layerIndex < mapData.layers.length) {
      mapData.layers[layerIndex].visible = !mapData.layers[layerIndex].visible;
      namespace.onMapChange();
      namespace.loadLayerManagerList();
    }
  };

  namespace.trashLayerConfirmation = function(layerIndex) {
    STUDIO.confirm(t("The layer will be removed"), function(){
      namespace.trashLayer(layerIndex);
    }, t("Delete Confirmation"));
  };

  namespace.trashLayer = function(layerIndex) {
    var mapData = namespace._currentMapData;
    if (!mapData) return;

    if (layerIndex >= 0 && layerIndex < mapData.layers.length) {
      mapData.layers.splice(layerIndex, 1);
      namespace.onMapChange();
      namespace.loadLayerManagerList();
    }
  };

  namespace.manageLayers = function() {
    STUDIO.openPopupForm('map-editor-manage-layers', t("Manage Layers"), function(){
      namespace.refreshLayers();
    }, function(){
      namespace.loadLayerManagerList();
    }, function(){
      namespace.refreshLayers();
    });
  };

  namespace.refreshLayers = function() {
    namespace.createLayers(namespace._renderer.width, namespace._renderer.height);
    namespace.loadLayerList();

    while (namespace._currentTilesetIndex >= namespace._currentMapData.layers.length - 1) {
      namespace._currentTilesetIndex -= 1;
    }

    if (namespace._currentTilesetIndex < 0) {
      namespace._currentTilesetIndex = -1;
    }

    namespace.registerOpenTileset(namespace._currentTilesetIndex);
    namespace.changeLayerIndex(namespace._currentTilesetIndex);
  };

  namespace.createNewLayer = function() {
    STUDIO.openPopupForm('map-editor-new-layer', t("New Layer"), function(){
      var layerName = $('#map-editor-new-layer-name').val();
      if (!layerName || !layerName.trim()) {
        throw new Error(t("Please give this layer a name."));
      }

      if (namespace.checkIfLayerNameExists(layerName)) {
        throw new Error(t("There's already a layer called ") + layerName);
      }

      var layerType = $('#map-editor-new-layer-type').val();
      namespace.addLayerToMap(namespace._currentMapData, layerName, layerType);
      namespace.onMapChange();

      namespace.openMapEditor(namespace._currentMapName);
    }, function(){

    });
  };

  var mouseClicked = [];

  namespace.getMousePos = function() {
    return namespace._renderer.plugins.interaction.mouse.global;
  };

  namespace.getTilesetMousePos = function() {
    return namespace._tilesetRenderer.plugins.interaction.mouse.global;
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

    if (!!namespace._renderer) {
      namespace._renderer.resize(width, height);
    }

    namespace.clearCaches();
    namespace._history = [];

    if (!namespace._renderer) {
      STUDIO.renderers = STUDIO.renderers || [];
      namespace._renderer = namespace.createRenderer(width, height);
      STUDIO.renderers.push(namespace._renderer);

      namespace._renderer.view.addEventListener('mousedown', function(evt) {
        var pos = namespace.getMousePos();
        mouseClicked[evt.button] = true;
      });

      namespace._renderer.view.addEventListener('mousemove', function(evt) {
        namespace._needsSelectionRefresh = true;
      });

      namespace._renderer.view.addEventListener('mouseout', function(evt) {
        namespace._needsSelectionRefresh = true;
      });

      namespace._renderer.view.addEventListener('webglcontextlost', function(evt){
        evt.preventDefault();
      }, false);
      namespace._renderer.view.addEventListener('webglcontextrestored', function(evt){
        namespace.openMapEditor(namespace._currentMapName);
      });

      namespace._renderer.view.addEventListener('dblclick', function(event){
        event.preventDefault();

        var layer = mapData.layers[namespace._currentLayerIndex];
        if (!layer) return;
        if (layer.type !== 'objectgroup') return;

        var pos = namespace.getMousePos();
        namespace.createNewMapObject(pos.x, pos.y);
      });

      if (!namespace._addedWindowEvents) {
        window.addEventListener('mouseout', function(evt){
          namespace._needsSelectionRefresh = true;
          namespace._needsTilesetRefresh = true;
        });

        window.addEventListener('mouseup', function(evt) {
          mouseClicked[evt.button] = false;
          if (evt.button === 0) {
            namespace._tileMouseDown = false;
          }
        });

        window.addEventListener('blur', function(){
          for (var i = 0; i < mouseClicked.length; i++) {
            mouseClicked[i] = false;
          }
          namespace._tileMouseDown = false;
          namespace._needsTilesetRefresh = true;
          namespace._needsSelectionRefresh = true;
        });

        namespace._addedWindowEvents = true;
      }
    }

    $('.map-editor').html('');
    $('.map-editor')[0].appendChild(namespace._renderer.view);
    
    namespace._renderer.view.style.width = (width * STUDIO.settings.mapZoomLevel) + 'px';
    namespace._renderer.view.style.height = (height * STUDIO.settings.mapZoomLevel) + 'px';
    namespace._currentTileIds = [];

    namespace._stage = new PIXI.Container();

    namespace.createLayers(width, height);
    namespace.requestAnimationFrame();
    namespace._loops++;
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
    if (tileId < 0) {
      return PIXI.Texture.fromImage(path.join('img', 'transparent.png'));
    }

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
    var tileSpacing = theTileset.spacing;

    var mapType = namespace.mapType();
    if (tileSpacing > 0) {
      if (mapType == 'tche') {
        tileSpacing /= 2;
      }

      columns = (theTileset.imagewidth + theTileset.spacing) / (theTileset.tilewidth + tileSpacing);
    }

    var subTileId = tileId - theTileset.firstgid;
    var column = subTileId % columns;
    var line = Math.floor(subTileId / columns);

    var frame = {
      width : theTileset.tilewidth,
      height : theTileset.tileheight,
      x : 0,
      y : 0
    };

    if (mapType == 'tche') {
      frame.x = column * theTileset.tilewidth + Math.floor(column / 2) * theTileset.spacing;
      frame.y = line * theTileset.tileheight  + Math.floor(line / 2) * theTileset.spacing;
    } else {
      frame.x = column * (theTileset.tilewidth + tileSpacing);
      frame.y = line * (theTileset.tileheight + tileSpacing);
    }

    var baseTexture = PIXI.Texture.fromImage(path.join(STUDIO.settings.folder, 'map', theTileset.image));
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

  namespace.addTileSprite = function(layerTexture, texture, x, y, tileId, alpha) {
    var sprite = new PIXI.Sprite(texture);
    sprite.x = x * namespace._currentMapData.tilewidth;
    sprite.y = y * namespace._currentMapData.tileheight;
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

    layerTexture.render(container);
  };

  namespace.createLayer = function(layerData, width, height, alpha) {
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
                namespace.addTileSprite(this.layerTexture, this.texture, this.x, this.y, this.tileId, alpha);
              }.bind({
                x : x,
                y : y,
                tileId : tileId,
                texture : tileTexture,
                layerTexture : layerTexture
              }));
            } else {
              namespace.addTileSprite(layerTexture, tileTexture, x, y, tileId, alpha);
            }
          }
        }
      }
    }

    namespace._layerCache[layerData.name] = layerTexture;
    if (layerData.visible) {
      namespace._stage.addChild(new PIXI.Sprite(layerTexture));
    }
  };

  namespace.createSelectionLayerIfNeeded = function() {
    if (!!namespace._selectionLayerTexture) return;

    var mapData = namespace._currentMapData;
    if (!mapData) return;

    var width = mapData.width * mapData.tilewidth;
    var height = mapData.height * mapData.tileheight;
    namespace.createSelectionLayer(width, height);
  };

  namespace.createTilesetSelectionLayerIfNeeded = function() {
    if (!!namespace._tilesetSelectionLayerTexture) return;

    var mapData = namespace._currentMapData;
    if (!mapData) return;

    var tileset = mapData.tilesets[namespace._currentTilesetIndex];
    if (!tileset) return;

    var width = tileset.imagewidth;
    var height = tileset.imageheight;

    namespace.createTilesetSelectionLayer(width, height);
  };

  namespace.createTilesetSelectionLayer = function(width, height) {
    namespace._tilesetSelectionLayerTexture = new TilesetSelectionLayerTexture(namespace._tilesetRenderer, width, height);
  };

  namespace.refreshTilesetSelection = function() {
    namespace.createTilesetSelectionLayerIfNeeded();
    namespace._tilesetSelectionLayerTexture.refreshSelection();
  };

  namespace.refreshSelectionLayer = function() {
    namespace.createSelectionLayerIfNeeded();
    if (!!namespace._selectionLayerTexture) {
      namespace._selectionLayerTexture.refreshSelection();
    }
  };

  namespace.createGridLayer = function(width, height) {
    if (!namespace._gridLayerTexture) {
      namespace._gridLayerTexture = new GridLayerTexture(namespace._renderer, width, height);
      namespace._needsGridRefresh = true;
    }
    namespace._stage.addChild(new PIXI.Sprite(namespace._gridLayerTexture));

    if (namespace._needsGridRefresh) {
      namespace._gridLayerTexture.refreshGrid();
      namespace._needsGridRefresh = false;
    }
  };

  namespace.createSelectionLayer = function(width, height) {
    if (!namespace._selectionLayerTexture) {
      namespace._selectionLayerTexture = new SelectionLayerTexture(namespace._renderer, width, height);
    }
  };

  namespace.clearCaches = function() {
    namespace._layerCache = {};
    namespace._tileCache = {};
    namespace._gridLayerTexture = false;
    namespace._selectionLayerTexture = false;
    namespace._currentTileIds = [];
  };

  namespace.createLayers = function(width, height) {
    namespace._stage.removeChildren();
    namespace._transparentLayerTexture = null;

    namespace.createTransparentLayer(width, height);

    var mapData = namespace._currentMapData;
    var layers = mapData.layers;

    for (var i = 0; i < layers.length; i++) {
      var layerData = layers[i];

      namespace.createLayer(layerData, width, height);
    }

    namespace.createGridLayer(width, height);

    namespace.createSelectionLayer(width, height);
    namespace._stage.addChild(new PIXI.Sprite(namespace._selectionLayerTexture));
    namespace._selectionLayerTexture.refreshSelection();
  };

  namespace.requestAnimationFrame = function() {
    window.requestAnimationFrame(namespace.update.bind(namespace));
  };

  namespace.drawTile = function(column, row, tileId, layer, tileset) {
    var mapData = namespace._currentMapData;
    var x = column * mapData.tilewidth;
    var y = row * mapData.tileheight;
    var tileWidth = mapData.tilewidth;
    var tilesetColumns = tileset.imagewidth / tileWidth;
    var totalColumns = mapData.width;
    var totalRows = mapData.height;

    index = totalColumns * row + column;

    if (tileId !== layer.data[index]) {
      namespace.addChangeToHistory({
        type : 'change',
        index : index,
        layer : layer,
        oldTileId : layer.data[index],
        newTileId : tileId
      });
    }

    layer.data[index] = tileId;
  };

  namespace.addChangeToHistory = function(change) {
    if (!!namespace._drawingTile) {
      namespace._drawingTile.changes.push(change);
    } else {
      namespace._history.push(change);
    }
  };

  namespace.startDrawingTile = function() {
    namespace._drawingTile = {
      type : 'tile',
      changes : []
    };
  };

  namespace.stopDrawingTile = function() {
    if (namespace._drawingTile.changes.length > 0) {
      if (!!namespace._drawingRectangle) {
        namespace._drawingRectangle.tiles.push(namespace._drawingTile);
      } else {
        namespace._history.push(namespace._drawingTile);
      }
    }

    namespace._drawingTile = false;
  };

  namespace.startDrawingRectangle = function() {
    namespace._drawingRectangle = {
      type : 'rectangle',
      tiles : []
    };
  };

  namespace.stopDrawingRectangle = function() {
    if (namespace._drawingRectangle.tiles.length > 0) {
      namespace._history.push(namespace._drawingRectangle);
    }
    namespace._drawingRectangle = false;
  };

  namespace.undoChange = function(change) {
    change.layer.data[change.index] = change.oldTileId;
    namespace._layerCache[change.layer.name] = false;
  };

  namespace.undoTile = function(tile) {
    for (var i = 0; i < tile.changes.length; i++) {
      namespace.undoChange(tile.changes[i]);
    }
  };

  namespace.undoRectangle = function(rectangle) {
    for (var i = 0; i < rectangle.tiles.length; i++) {
      namespace.undoTile(rectangle.tiles[i]);
    }
  };

  namespace.undo = function() {
    if (!namespace._history.length) return;

    var lastAction = namespace._history.pop();

    switch(lastAction.type) {
      case 'rectangle' :
        namespace.undoRectangle(lastAction);
        break;
      case 'tile' :
        namespace.undoTile(lastAction);
        break;
      default :
        namespace.undoChange(lastAction);
        break;
    }

    namespace._needsRefresh = true;    
  };

  namespace.changeTile = function(x, y) {
    if (namespace._currentTileIds.length == 0) return;
    if (namespace._currentTileIds[0] < 0) return;

    var mapData = namespace._currentMapData;

    if (x < 0) return;
    if (y < 0) return;
    if (x >= mapData.width * mapData.tilewidth) return;
    if (y >= mapData.height * mapData.tileheight) return;

    if (namespace._currentLayerIndex >= mapData.layers.length) {
      namespace._currentLayerIndex = 0;
    }
    if (mapData.layers.length <= 0) return;
    var layer = mapData.layers[namespace._currentLayerIndex];
    if (!layer) return;
    if (layer.type != 'tilelayer') return;

    var tileWidth = mapData.tilewidth;
    var tileHeight = mapData.tileheight;

    var totalColumns = mapData.width;
    var totalRows = mapData.height;

    var tileset = mapData.tilesets[namespace._currentTilesetIndex];
    if (!tileset) return;

    var fakeSize = STUDIO.MapEditor.getFakeTileSize();
    if (fakeSize.allowHalf && !STUDIO.settings.offgridPlacement && namespace._currentTool !== 'eraser') {
      x = Math.floor(x / fakeSize.width) * fakeSize.width;
      y = Math.floor(y / fakeSize.height) * fakeSize.height;
    }

    var column;
    var row;

    column = Math.floor(x / tileWidth);
    row = Math.floor(y / tileHeight);

    var previousIndex = 0;
    var previousRow = row;

    namespace.startDrawingTile();
    for (var i = 0; i < namespace._currentTileIds.length; i++) {
      var tileId = namespace._currentTileIds[i];

      if (tileId === undefined) continue;
      if (namespace._currentTool == 'eraser') {
        tileId = 0;
      }

      if (column >= totalColumns) continue;
      var newColumn = column + i;
      var newRow = row;

      while (newColumn >= totalColumns) {
        newColumn -= totalColumns;
        newRow++;
      }

      if (newColumn < column) {
        continue;
      }

      this.drawTile(newColumn, newRow, tileId, layer, tileset);
      previousIndex = i;
      previousRow = newRow;
    }
    namespace.stopDrawingTile();

    namespace._layerCache[layer.name] = false;
    namespace._needsRefresh = true;
  };

  namespace.changeRectangle = function(x, y, x2, y2) {
    var mapData = namespace._currentMapData;
    var maxX = mapData.width * mapData.tilewidth;
    var maxY = mapData.height * mapData.tileheight;

    if (x < 0) {
      x = 0;
    } else if (x > maxX) {
      x = maxX;
    }
    if (y < 0) {
      y = 0;
    } else if (y > maxY) {
      y = maxY;
    }

    if (x2 < 0) {
      x2 = 0;
    } else if (x2 > maxX) {
      x2 = maxX;
    }
    if (y2 < 0) {
      y2 = 0;
    } else if (y2 > maxY) {
      y2 = maxY;
    }

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

    var size = namespace.getSelectionSize();
    var xIncrement = size.width;
    var yIncrement = size.height;

    namespace.startDrawingRectangle();
    for (var tileX = left; tileX <= right; tileX += xIncrement) {
      for (var tileY = top; tileY <= bottom; tileY += yIncrement) {
        namespace.changeTile(tileX, tileY);
      }
    }
    namespace.stopDrawingRectangle();
  };

  namespace.pickPos = function(x, y) {
    var mapData = namespace._currentMapData;
    if (mapData.layers.length <= 0) return;
    var layer = mapData.layers[namespace._currentLayerIndex];
    if (layer.type != 'tilelayer') return;

    var tileWidth = mapData.tilewidth;
    var tileHeight = mapData.tileheight;

    var maxX = mapData.width * tileWidth;
    var maxY = mapData.height * tileHeight;
    if (x < 0) return;
    if (y < 0) return;
    if (x > maxX) return;
    if (y > maxY) return;

    var fakeSize = STUDIO.MapEditor.getFakeTileSize();
    if (fakeSize.allowHalf && !STUDIO.settings.offgridPlacement) {
      x = Math.floor(x / fakeSize.width) * fakeSize.width;
      y = Math.floor(y / fakeSize.height) * fakeSize.height;
    }    

    var column = Math.floor(x / tileWidth);
    var row = Math.floor(y / tileHeight);

    var totalColumns = mapData.width;
    var totalRows = mapData.height;

    var index = totalColumns * row + column;
    var tileId = layer.data[index];

    namespace._currentTileIds = [tileId];
    if (namespace._currentTool == 'brush') {
      if (column < totalColumns) {
        namespace._currentTileIds.push(layer.data[index + 1]);
      }
      if (row < totalRows) {
        index += totalColumns;
        namespace._currentTileIds[totalColumns] = layer.data[index];

        if (column < totalColumns) {
          namespace._currentTileIds[totalColumns + 1] = layer.data[index + 1];
        }
      }
    }

    namespace.selectTilesetByTileId(tileId);
    namespace._needsTilesetRefresh = true;
  };

  namespace.selectTilesetByTileId = function(tileId) {
    var mapData = namespace._currentMapData;
    var tilesetIndex = -1;

    for (var i = 0; i < mapData.tilesets.length; i++) {
      var tileset = mapData.tilesets[i];

      if (tileset.firstgid <= tileId && tileId < tileset.firstgid + tileset.tilecount) {
        tilesetIndex = i;
        break;
      }
    }

    if (tilesetIndex >= 0 && tilesetIndex !== namespace._currentTilesetIndex) {
      namespace.registerOpenTileset(tilesetIndex);
    }
  };

  namespace.update = function(){
    //Only continue the loop is the webgl context was not lost and the map editor is open
    if (!namespace._lostContext && $('.map-editor').length > 0) {
      namespace.requestAnimationFrame();

      namespace.updateMap();
      namespace.updateTileset();
    } else {
      namespace._loops--;
    }
  };

  namespace.updateMap = function(){
    if (!namespace._renderer) return;
    if (!namespace._stage) return;

    namespace._renderer.render(namespace._stage);

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
      namespace._needsRefresh = false;
      namespace._needsSelectionRefresh = false;
    } else if (namespace._needsSelectionRefresh) {
      namespace.refreshSelectionLayer();
      namespace._needsSelectionRefresh = false;
    }
  };

  namespace.updateTileset = function() {
    if (!namespace._tilesetRenderer) return;

    namespace._tilesetRenderer.render(namespace._tilesetStage);
    var pos = namespace.getTilesetMousePos();

    if (namespace._tileMouseDown) {
      if (!namespace._tilesetClickedPos) {
        namespace._tilesetClickedPos = {
          x : pos.x,
          y : pos.y
        };
      }
    } else {
      if (!!namespace._tilesetClickedPos) {
        namespace._tilesetClickedPos = false;
      }
    }

    if (namespace._needsTilesetRefresh) {
      namespace.refreshTilesetSelection();
      namespace._needsTilesetRefresh = false;
    }
  };

  namespace.createNewMap = function() {
    STUDIO.openWindow('new-map');
  };
})(STUDIO.MapEditor);