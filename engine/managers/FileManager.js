(function(){
  var startedLoadingMaps = false;
  var startedLoadingSprites = false;
  var filesToLoad = 0;

  function FileManager() {

  }

  FileManager.loadGameSettings = function() {
    var path = './game.json';
    TCHE.Ajax.loadFileAsync('game', path);
  };

  FileManager.loadAllMaps = function() {
    if (!TCHE.data.game) return;

    startedLoadingMaps = true;
    var maps = TCHE.data.game.maps;

    for (var mapName in maps) {
      this.loadMapData(mapName, maps[mapName]);
    }
  };

  FileManager.loadAllSprites = function() {
    if (!TCHE.data.game) return;

    startedLoadingSprites = true;
    var sprites = TCHE.data.game.sprites;

    for (var spriteName in sprites) {
      this.loadSpriteTexture(sprites[spriteName].image);
    }
  };

  FileManager.loadSpriteTexture = function(imageName) {
    var texture = PIXI.Texture.fromImage(imageName);
    if (texture.baseTexture.isLoading) {
      filesToLoad++;
      texture.baseTexture.addListener('loaded', function(){
        filesToLoad--;
      });
    }
  };

  FileManager.loadMapData = function(mapName, mapType) {
    var path = './maps/' + mapName;
    filesToLoad++;

    TCHE.maps[mapName] = null;
    TCHE.Ajax.loadFileAsync(mapName, path, function(xhr, filePath, name){
      if (xhr.status < 400) {
        TCHE.maps[name] = JSON.parse(xhr.responseText);
        TCHE.maps[name].mapType = mapType;
        filesToLoad--;
      } else {
        console.log(arguments);
        throw new Error("Failed to load map.");
      }
    }, function(){
      console.log(arguments);
      throw new Error("Failed to load map.");
    });
  };

  FileManager.update = function() {
    if (!TCHE.data.game) {
      if (TCHE.data.game === undefined) {
        this.loadGameSettings();
      }

      return;
    }

    if (!startedLoadingMaps) {
      this.loadAllMaps();
    }

    if (!startedLoadingSprites) {
      this.loadAllSprites();
    }
  };

  FileManager.loadTiledMapFiles = function(mapData) {
    mapData.tilesets.forEach(function(tileset){
      var texture = PIXI.Texture.fromImage('./maps/' + tileset.image);
      if (texture.baseTexture.isLoading) {
        filesToLoad++;
        texture.baseTexture.addListener('loaded', function(){
          filesToLoad--;
        });
      }
    });
  };

  FileManager.loadMapFiles = function(mapName) {
    var mapData = TCHE.maps[mapName];

    if (!mapData) {
      throw new Error("Invalid map name: " + mapName);
    }

    TCHE.MapManager.loadMapFiles(mapData);
  };

  FileManager.loadSoundFile = function(name, path) {
    createjs.Sound.registerSound({src : path, id : name});
  };

  FileManager.loadSoundList = function(list, path) {
    if (path === undefined) {
      path = "./assets/";
    }
    
    createjs.Sound.createjs.Sound.registerSounds(list, path);
  };

  FileManager.isLoaded = function() {
    if (!TCHE.data.game) return false;
    if (!startedLoadingMaps) return false;
    if (filesToLoad > 0) return false;

    return true;
  };
  
  TCHE.registerStaticClass('FileManager', FileManager);
})();