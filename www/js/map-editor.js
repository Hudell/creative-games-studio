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
      var editorHeight = window.innerHeight - 52;
      
      $('#editor-wrapper').css('height', (editorHeight) + 'px');

      var mapWidth = mapData.width * mapData.tilewidth;
      var mapHeight = mapData.height * mapData.tileheight;

      var iframe = $('.map-editor').children('iframe');

      if (mapWidth < editorWidth) {
        mapWidth = editorWidth;
      }
      if (mapHeight < editorHeight) {
        mapHeight = editorHeight;
      }

      iframe.css('width', mapWidth);
      iframe.css('height', mapHeight);

      namespace.attachEvents();
      namespace.loadTilesetList();
      namespace.loadLayerList();
      namespace.refreshTilesetWindow();

      $('.map-editor').find('iframe')[0].contentWindow.onMapChange = namespace.onMapChange;

      if (!!callback) {
        callback();
      }
    });    
  };

  namespace.onMapChange = function(mapData) {
    var mapName = namespace._currentMapName;

    namespace._currentMapData = mapData;
    STUDIO.changeMap(mapName, mapData);
  };

  namespace.getMapEditor = function() {
    return $('.map-editor').find('iframe')[0].contentWindow.TCHE.MapEditor;
  };

  namespace.attachEvents = function() {
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

    namespace.getMapEditor().setSelectedTool(namespace._currentTool);
  };

  namespace.changeDrawType = function(drawType, iconClass) {
    namespace._currentDrawType = drawType;
    $('#map-editor-draw-types').html('<i class="fa fa-' + iconClass + ' fa-fw red-color"></i> <i class="fa fa-caret-down"></i>');

    namespace.getMapEditor().setSelectedDrawType(drawType);
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
    namespace.applyPickedTile();
  };

  namespace.changeToolToBrush = function() {
    if (namespace._currentTool == 'pencil') {
      namespace.convertPickedTileFromPencilToBrush();
    }

    namespace.changeTool('brush', 'paint-brush');
    namespace.applyPickedTile();
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
    var list = $('#layer-list');
    list.html('');

    var layers = namespace._currentMapData.layers;
    for (var i = 0; i < layers.length; i++) {
      var icon = 'fa-map-o';

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
    namespace.getMapEditor().setSelectedLayer(index);
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

    namespace.applyPickedTile();
  };

  namespace.applyPickedTile = function() {
    var size = namespace.getFakeTileSize();
    namespace.getMapEditor().setSelectedTile(namespace._currentTilesetIndex, namespace._pickedColumn, namespace._pickedRow, size.width, size.height);
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

  namespace.createNewLayer = function() {
    STUDIO.openPopupForm('map-editor-new-layer', 'New Layer', function(){
    }, function(){

    });
  };

})(STUDIO.MapEditor);