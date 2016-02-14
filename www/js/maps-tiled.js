(function(){
  var path = require("path");
  var fs = require('fs');

  STUDIO.saveOldTiledMap = function(){
    var mapName = $('#edit-tiled-map-name').val();
    if (!mapName || !mapName.trim()) {
      throw new Error(t("I forgot what map you were modifying. Try again."));
    }

    var data = STUDIO.gameData.maps[mapName];
    if (!data) {
      throw new Error(t("I couldn't find the existing map data."));
    }

    STUDIO.openWindow('maps');
  };

  STUDIO.saveNewTiledMap = function(){
    var mapName = $('#new-tiled-map-name').val();
    if (!mapName || !mapName.trim()) {
      throw new Error(t("You need to give the map a name."));
    }

    if (STUDIO.checkIfMapNameExists(mapName)) {
      throw new Error(t("A map with this name already exists:") + ' ' + mapName);
    }

    var width = parseInt($('#new-tiled-map-width').val(), 10);
    var height = parseInt($('#new-tiled-map-height').val(), 10);
    var tileWidth = $('#new-tiled-map-tile-width').val();
    var tileHeight = $('#new-tiled-map-tile-height').val();

    if (!width) {
      throw new Error(t("Please type a valid map width."));
    }
    if (width < 1) {
      throw new Error(t("The Map width needs to be a positive number."));
    }

    if (!height) {
      throw new Error(t("Please type a valid map height."));
    }
    if (height < 1) {
      throw new Error(t("The Map height needs to be a positive number."));
    }

    if (!tileWidth) {
      throw new Error(t("Please type a valid width for the tiles."));
    }
    if (tileWidth < 1) {
      throw new Error(t("The tile width needs to be a positive number."));
    }

    if (!tileHeight) {
      throw new Error(t("Please type a valid height for the tiles."));
    }
    if (tileHeight < 1) {
      throw new Error(t("The tile height needs to be a positive number."));
    }

    mapName += '.json';
    STUDIO.gameData.maps[mapName] = 'tiled';
    var mapData = {
      "orientation": "orthogonal",
      "properties": {},
      "renderorder": "left-up",
      "tilesets" : [],
      "layers" : [],
      "version" : 1,
      "width" : Number(width),
      "height" : Number(height),
      "tilewidth" : Number(tileWidth),
      "tileheight" : Number(tileHeight)
    };

    STUDIO.MapEditor.addLayerToMap(mapData, t("Ground"), 'tilelayer');
    STUDIO.MapEditor.addLayerToMap(mapData, t("Ground Overlay"), 'tilelayer');
    STUDIO.MapEditor.addLayerToMap(mapData, t("Walls"), 'tilelayer');
    STUDIO.MapEditor.addLayerToMap(mapData, t("Main"), 'objectgroup');
    STUDIO.MapEditor.addLayerToMap(mapData, t("Overlay"), 'tilelayer');

    STUDIO.changeMap(mapName, mapData);
    STUDIO.openMapEditor(mapName);
  };

  STUDIO.applyLoadedTiledMapData = function(mapName, mapData) {
    STUDIO.fillTiledMapObjects(mapData, 'map-objects-table');

    $('#edit-tiled-map-save').on('click', function(event){
      event.preventDefault();
      STUDIO.changeMap(mapName, mapData);
      STUDIO.saveMapData(mapName);
      STUDIO.openWindow('maps');
    });

    $('#edit-tiled-map-refresh').on('click', function(event){
      event.preventDefault();
      STUDIO.editTiledMap(mapName);
    });

    $('.map-object-row').on('click', function(){
      var layerIndex = event.currentTarget.dataset.layerIndex;
      var objectIndex = event.currentTarget.dataset.objectIndex;

      if (layerIndex === undefined || objectIndex === undefined) {
        throw new Error(t("Couldn't find object reference."));
      }

      var layer = mapData.layers[layerIndex];
      if (!layer) {
        throw new Error(t("Invalid layer reference."));
      }
      var object = layer.objects[objectIndex];
      if (!object) {
        throw new Error(t("Invalid object reference."));
      }

      STUDIO.openPopupForm('edit-tiled-map-object', t("Edit Object Properties"), function(){
        var objectType = $('#edit-tiled-map-object-type').val();
        var sprite = $('#edit-tiled-map-object-sprite').val();

        object.properties.objectType = objectType;
        object.properties.sprite = sprite;

        STUDIO.markAsModified();
        STUDIO.applyLoadedTiledMapData(mapName, mapData);
      }, function(){
        $('#edit-tiled-map-object-name').val(object.name);
        
        STUDIO.ObjectManager.fillObjects('edit-tiled-map-object-type');
        $('#edit-tiled-map-object-type').val(object.properties.objectType || '');

        STUDIO.fillSprites('edit-tiled-map-object-sprite');
        $('#edit-tiled-map-object-sprite').val(object.properties.sprite || '');
      });
    });
  };

  STUDIO.loadTiledMapData = function(mapName) {
    $('#edit-tiled-map-name').val(mapName);

    var mapData = STUDIO.getMapData(mapName);

    STUDIO.applyLoadedTiledMapData(mapName, mapData);
  };

  STUDIO.editTiledMap = function(mapName) {
    STUDIO.openWindow('edit-map-tiled', function(){
      STUDIO.loadTiledMapData(mapName);
    });
  };

  STUDIO.importTiledMapTilesets = function(mapData, mapFileFolder) {
    if (mapData.tcheVersion !== undefined) {
      throw new Error(t("The selectd file is a default map."));
    }

    STUDIO.importMapTilesets(mapData, mapFileFolder);
  };

  STUDIO.fillTiledMapObjects = function(mapData, tableId) {
    $('#' + tableId).children('tbody').html('');

    if (!mapData) return;

    for (var layerIndex = 0; layerIndex < mapData.layers.length; layerIndex++) {
      if (mapData.layers[layerIndex].type != "objectgroup") continue;

      var objects = mapData.layers[layerIndex].objects;

      for (var i = 0; i < objects.length; i++) {
        STUDIO.addTiledMapObjectToTable(tableId, objects[i], layerIndex, i);
      }
    }
  };

  STUDIO.addTiledMapObjectToTable = function(tableId, object, layerIndex, objectIndex) {
    var row = '<tr class="map-object-row clickable" data-layer-index="' + layerIndex + '" data-object-index="' + objectIndex + '">';

    row += '<td>' + object.name + '</td>';

    var objectType = object.properties.objectType || '';
    row += '<td>' + objectType + '</td>';

    var sprite = object.properties.sprite || '';
    row += '<td>' + sprite + '</td>';

    row += '<td>' + object.x + '</td>';
    row += '<td>' + object.y + '</td>';
    row += '<td>' + object.width + '</td>';
    row += '<td>' + object.height + '</td>';

    row += '</tr>';

    $('#' + tableId).children('tbody').append(row);
  };
})();