(function(){
  var path = require("path");
  var fs = require('fs');

  STUDIO.saveOldTcheMap = function(){
    var mapName = $('#edit-tche-map-name').val();
    if (!mapName || !mapName.trim()) {
      throw new Error(t("I forgot what map you were modifying. Try again."));
    }

    var data = STUDIO.gameData.maps[mapName];
    if (!data) {
      throw new Error(t("I couldn't find the existing map data."));
    }

    STUDIO.openWindow('maps');
  };

  STUDIO.saveNewTcheMap = function(){
    var mapName = $('#new-tche-map-name').val();
    if (!mapName || !mapName.trim()) {
      throw new Error(t("You need to give the map a name."));
    }

    if (STUDIO.checkIfMapNameExists(mapName)) {
      throw new Error(t("A map with this name already exists:") + ' ' + mapName);
    }

    var width = parseInt($('#new-tche-map-width').val(), 10);
    var height = parseInt($('#new-tche-map-height').val(), 10);
    var tileWidth = $('#new-tche-map-tile-width').val();
    var tileHeight = $('#new-tche-map-tile-height').val();

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

    width *= 2;
    height *= 2;
    tileWidth /= 2;
    tileHeight /= 2;

    mapName += '.json';
    STUDIO.gameData.maps[mapName] = 'tche';
    var mapData = {
      "orientation": "orthogonal",
      "properties": {},
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
    STUDIO.MapEditor.addLayerToMap(mapData, t("Player"), 'objectgroup');
    STUDIO.MapEditor.addLayerToMap(mapData, t("Overlay"), 'tilelayer');

    STUDIO.changeMap(mapName, mapData);
    STUDIO.openMapEditor(mapName);
  };

  STUDIO.applyLoadedTcheMapData = function(mapName, mapData) {
    STUDIO.fillTcheMapObjects(mapData, 'map-objects-table');

    $('#edit-tche-map-save').on('click', function(event){
      event.preventDefault();
      STUDIO.changeMap(mapName, mapData);
      STUDIO.saveMapData(mapName);
      STUDIO.openWindow('maps');
    });

    $('#edit-tche-map-refresh').on('click', function(event){
      event.preventDefault();
      STUDIO.editTcheMap(mapName);
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

      STUDIO.openPopupForm('edit-tche-map-object', t("Edit Object Properties"), function(){
        var objectType = $('#edit-tche-map-object-type').val();
        var sprite = $('#edit-tche-map-object-sprite').val();

        object.properties.objectType = objectType;
        object.properties.sprite = sprite;

        STUDIO.markAsModified();
        STUDIO.applyLoadedTcheMapData(mapName, mapData);
      }, function(){
        $('#edit-tche-map-object-name').val(object.name);
        
        STUDIO.ObjectManager.fillObjects('edit-tche-map-object-type');
        $('#edit-tche-map-object-type').val(object.properties.objectType || '');

        STUDIO.fillSprites('edit-tche-map-object-sprite');
        $('#edit-tche-map-object-sprite').val(object.properties.sprite || '');
      });
    });
  };

  STUDIO.loadTcheMapData = function(mapName) {
    $('#edit-tche-map-name').val(mapName);

    var mapData = STUDIO.getMapData(mapName);

    STUDIO.applyLoadedTcheMapData(mapName, mapData);
  };

  STUDIO.editTcheMap = function(mapName) {
    STUDIO.openWindow('edit-map-tche', function(){
      STUDIO.loadTcheMapData(mapName);
    });
  };

  STUDIO.importTcheMapTilesets = function(mapData, mapFileFolder) {
    if (mapData.tcheVersion === undefined) {
      throw new Error(t("The selected file is not a default map."));
    }

    STUDIO.importMapTilesets(mapData, mapFileFolder);
  };

  STUDIO.fillTcheMapObjects = function(mapData, tableId) {
    $('#' + tableId).children('tbody').html('');

    if (!mapData) return;

    for (var layerIndex = 0; layerIndex < mapData.layers.length; layerIndex++) {
      if (mapData.layers[layerIndex].type != "objectgroup") continue;

      var objects = mapData.layers[layerIndex].objects;

      for (var i = 0; i < objects.length; i++) {
        STUDIO.addTcheMapObjectToTable(tableId, objects[i], layerIndex, i);
      }
    }
  };

  STUDIO.addTcheMapObjectToTable = function(tableId, object, layerIndex, objectIndex) {
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