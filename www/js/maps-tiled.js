(function(){
  var path = require("path");
  var fs = require('fs');

  TCHE.saveOldTiledMap = function(){
    var mapName = $('#edit-tiled-map-name').val();
    if (!mapName || !mapName.trim) {
      throw new Error("I forgot what map you were modifying. Try again.");
    }

    var data = TCHE.gameData.maps[mapName];
    if (!data) {
      throw new Error("I couldn't find the existing map data.");
    }

    TCHE.openWindow('maps');
  };

  TCHE.applyLoadedTiledMapData = function(mapName, mapData) {
    TCHE.fillTiledMapObjects(mapData, 'map-objects-table');

    $('#edit-tiled-map-save').on('click', function(event){
      event.preventDefault();
      TCHE.saveMapData(mapName, mapData);
      TCHE.openWindow('maps');
    });

    $('#edit-tiled-map-refresh').on('click', function(event){
      event.preventDefault();
      TCHE.editTiledMap(mapName);
    });

    $('.map-object-row').on('click', function(){
      var layerIndex = event.currentTarget.dataset.layerIndex;
      var objectIndex = event.currentTarget.dataset.objectIndex;

      if (layerIndex === undefined || objectIndex === undefined) {
        throw new Error("Couldn't find object reference.");
      }

      var layer = mapData.layers[layerIndex];
      if (!layer) {
        throw new Error("Invalid layer reference.");
      }
      var object = layer.objects[objectIndex];
      if (!object) {
        throw new Error("Invalid object reference.");
      }

      TCHE.openPopupForm('edit-tiled-map-object', 'Edit Object Properties', function(){
        var objectType = $('#edit-tiled-map-object-type').val();
        var sprite = $('#edit-tiled-map-object-sprite').val();

        object.properties.objectType = objectType;
        object.properties.sprite = sprite;

        TCHE.markAsModified();
        TCHE.applyLoadedTiledMapData(mapName, mapData);
      }, function(){
        $('#edit-tiled-map-object-name').val(object.name);
        
        TCHE.ObjectManager.fillObjects('edit-tiled-map-object-type');
        $('#edit-tiled-map-object-type').val(object.properties.objectType || '');

        TCHE.fillSprites('edit-tiled-map-object-sprite');
        $('#edit-tiled-map-object-sprite').val(object.properties.sprite || '');
      });
    });
  };

  TCHE.loadTiledMapData = function(mapName) {
    $('#edit-tiled-map-name').val(mapName);

    var mapData = TCHE.getMapData(mapName);

    TCHE.applyLoadedTiledMapData(mapName, mapData);
  };

  TCHE.editTiledMap = function(mapName) {
    TCHE.openWindow('edit-map-tiled', function(){
      TCHE.loadTiledMapData(mapName);
    });
  };

  TCHE.importTiledMapTilesets = function(mapData, mapFileFolder) {
    for (var i = 0; i < mapData.tilesets.length; i++) {
      var originalFile = path.join(mapFileFolder, mapData.tilesets[i].image);
      var fileName = path.basename(originalFile);

      var newFileName = path.join(TCHE.loadedGame.folder, 'assets', 'tilesets', fileName);
      var referencedFileName = path.join('..', 'assets', 'tilesets', fileName);
      mapData.tilesets[i].image = referencedFileName;

      if (fs.existsSync(originalFile)) {
        TCHE.copyFileSync(originalFile, newFileName);
      }
    }
  };

  TCHE.fillTiledMapObjects = function(mapData, tableId) {
    $('#' + tableId).children('tbody').html('');

    if (!mapData) return;

    for (var layerIndex = 0; layerIndex < mapData.layers.length; layerIndex++) {
      if (mapData.layers[layerIndex].type != "objectgroup") continue;

      var objects = mapData.layers[layerIndex].objects;

      for (var i = 0; i < objects.length; i++) {
        TCHE.addTiledMapObjectToTable(tableId, objects[i], layerIndex, i);
      }
    }
  };

  TCHE.addTiledMapObjectToTable = function(tableId, object, layerIndex, objectIndex) {
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