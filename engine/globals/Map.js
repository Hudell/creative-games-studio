(function(){
  var areaTiles = 10;

  function Map() {
    this.initialize();
  }

  Map.prototype.initialize = function() {
    this._mapData = {};
    this._objects = [];
    this._mapName = null;
    this._offsetX = 0;
    this._offsetY = 0;

    this._areas = [];
    this._areaWidth = 0;
    this._areaHeight = 0;
    this._areaColumns = 0;
    this._areaLines = 0;
  };

  TCHE.reader(Map.prototype, 'mapName');
  TCHE.reader(Map.prototype, 'areas');
  TCHE.reader(Map.prototype, 'areaWidth');
  TCHE.reader(Map.prototype, 'areaHeight');
  TCHE.reader(Map.prototype, 'areaColumns');
  TCHE.reader(Map.prototype, 'areaLines');

  Map.prototype.setMapData = function(value) {
    this._mapData = value;
    this._objects = [];
    this.createAreas();
    this.createObjects();
  };

  TCHE.accessor(Map.prototype, 'mapData', Map.prototype.setMapData);

  Map.prototype.getWidth = function() {
    return TCHE.MapManager.getMapWidth(this._mapData);
  };

  Map.prototype.getHeight = function() {
    return TCHE.MapManager.getMapHeight(this._mapData);
  };

  TCHE.reader(Map.prototype, 'width', Map.prototype.getWidth);
  TCHE.reader(Map.prototype, 'height', Map.prototype.getHeight);

  TCHE.accessor(Map.prototype, 'offsetX');
  TCHE.accessor(Map.prototype, 'offsetY');
  TCHE.reader(Map.prototype, 'objects');

  Map.prototype.getImportantObjectData = function(mapData, obj) {
    var data = TCHE.MapManager.getImportantObjectData(mapData, obj);

    data.x = data.x || 0;
    data.y = data.y || 0;
    data.width = data.width || 0;
    data.height = data.height || 0;
    data.sprite = data.sprite || '';
    data.objectType = data.objectType || '';
    data.offsetY = data.offsetY || 0;
    data.offsetX = data.offsetX || 0;
    data.ghost = !!data.ghost;

    return data;
  };

  Map.prototype.updateOffset = function() {
    var diffX = this.width - TCHE.renderer.width;
    var diffY = this.height - TCHE.renderer.height;
    var middleX = Math.floor(TCHE.renderer.width / 2);
    var middleY = Math.floor(TCHE.renderer.height / 2);
    var mapMiddleX = Math.floor(this.width / 2);
    var mapMiddleY = Math.floor(this.height / 2);
    var playerX = TCHE.globals.player.hitboxLeftX;
    var playerY = TCHE.globals.player.hitboxTopY;

    if (diffX < 0) {
      this._offsetX = Math.abs(Math.floor(diffX / 2));
    } else if (diffX > 0) {
      if (playerX > middleX) {
        if (playerX < this.width - middleX) {
          this._offsetX = middleX - playerX;
        } else {
          this._offsetX = TCHE.renderer.width - this.width;
        }
      } else {
        this._offsetX = 0;
      }
    } else {
      this._offsetX = 0;
    }

    if (diffY < 0) {
      this._offsetY = Math.abs(Math.floor(diffY / 2));
    } else if (diffY > 0) {
      if (playerY > middleY) {
        if (playerY < this.height - middleY) {
          this._offsetY = middleY - playerY;
        } else {
          this._offsetY = TCHE.renderer.height - this.height;
        }
      } else {
        this._offsetY = 0;
      }
    } else {
      this._offsetY = 0;
    }
  };

  Map.prototype.createAreas = function() {
    var xAreas = Math.ceil(this._mapData.width / areaTiles);
    var yAreas = Math.ceil(this._mapData.height / areaTiles);
    var total = xAreas * yAreas;

    this._areaColumns = xAreas;
    this._areaLines = yAreas;
    this._areas.length = total;
    this._areaWidth = areaTiles * this._mapData.tilewidth;
    this._areaHeight = areaTiles * this._mapData.tileheight;

    for (var i = 0; i < total; i++) {
      this._areas[i] = [];
    }

    TCHE.globals.player.updateAreas();
  };

  Map.prototype.removeObjectFromArea = function(object, areaId) {
    if (!this._areas[areaId]) {
      console.log('Invalid area: ', areaId);
      return;
    }

    while (true) {
      var index = this._areas[areaId].indexOf(object);
      if (index >= 0) {
        this._areas[areaId].splice(index, 1);
      } else {
        break;
      }
    }
  };

  Map.prototype.addObjectToArea = function(object, areaId) {
    if (!this._areas[areaId]) {
      console.log('Invalid area: ', areaId);
      return;
    }

    if (this._areas[areaId].indexOf(object) < 0) {
      this._areas[areaId].push(object);
    }
  };

  Map.prototype.getOrganizedAreas = function() {
    var organized = {};
    var count = 0;
    for (var i = 0; i < TCHE.globals.map.areaLines; i++) {
      organized[i] = [];
    }

    for (var j = 0; j < TCHE.globals.map.areas.length; j++) {
      var idx = Math.floor(j / TCHE.globals.map.areaColumns);
      var newList = [];

      for (var k = 0; k < TCHE.globals.map.areas[j].length; k++){
        var name = TCHE.globals.map.areas[j][k].name;

        if (name === undefined) {
          name = TCHE.globals.map.areas[j][k].constructor.name;
        }

        newList.push(name);
      }

      organized[idx].push(newList.join(','));
    }
    return organized;
  };

  Map.prototype.createObjects = function() {
    var objectList = [];
    var map = this;

    if (!!this._mapData) {
      objectList = TCHE.MapManager.getMapObjects(this._mapData) || objectList;
    }

    objectList.forEach(function(obj){
      var data = map.getImportantObjectData(this._mapData, obj);
      var characterClass = TCHE.Character;

      if (data.class && TCHE[data.class] && typeof(TCHE[data.class]) == "function") {
        characterClass = TCHE[data.class];
      }

      var objCharacter = new (characterClass)();
      for (var key in data) {
        objCharacter[key] = data[key];
      }

      this._objects.push(objCharacter);
    }.bind(this));
  };

  Map.prototype.updateObjects = function() {
    this._objects.forEach(function(object){
      object.update();
    });
  };

  Map.prototype.getMapObjects = function() {
    return TCHE.MapManager.getMapObjects(this._mapData);
  };

  Map.prototype.update = function() {
    this.updateObjects();
    this.updateOffset();
  };

  Map.prototype.isValid = function(x, y) {
    if (x >= this.width) return false;
    if (y >= this.height) return false;
    if (x < 0) return false;
    if (y < 0) return false;

    return true;
  };

  Map.prototype.wouldObjectsCollideAt = function(character, object, x, y) {
    if (character == object) return false;
    if (object.hitboxRightX <= x) return false;
    if (object.hitboxBottomY <= y) return false;
    if (object.hitboxLeftX >= x + character.width) return false;
    if (object.hitboxTopY >= y + character.height) return false;

    return true;
  };

  Map.prototype.validateCollisionOnArea = function(areaId, character, x, y) {
    var objects = this._areas[areaId];
    if (!objects) {
      console.log('Invalid Area');
      return false;
    }

    for (var i = 0; i < objects.length; i++) {
      if (this.wouldObjectsCollideAt(character, objects[i], x, y)) {
        return true;
      }
    }

    return false;
  };

  Map.prototype.collidedObjects = function(x, y, character) {
    // if (this.validateCollision(x, y) !== true) {
    //   return [];
    // }

    // var blockingCharacters = this.collisionMap[x][y].filter(function(item){
    //   return item != character;
    // });

    return blockingCharacters;
  };

  Map.prototype.canMoveLeftAt = function(character, xPos, yPos) {
    var y = yPos;
    // for (var y = yPos; y < (yPos + character.height); y++) {
      if (!this.isValid(xPos - character.stepSize, y)) return false;

      for (var i = character.stepSize; i > 0; i--) {
        if (character.isCollidedAt(xPos, y)) {
          return false;
        }
      }
    // }

    return true;
  };

  Map.prototype.canMoveLeft = function(character) {
    return this.canMoveLeftAt(character, character.x, character.y);
  };

  Map.prototype.canMoveRightAt = function(character, xPos, yPos) {
    var y = yPos;
    // for (var y = yPos; y < (yPos + character.height); y++) {
      if (!this.isValid(xPos + character.width + character.stepSize, y)) return false;

      for (var i = character.stepSize; i > 0; i--) {
        if (character.isCollidedAt(xPos + character.width + i, y)) {
          return false;
        }
      }
    // }

    return true;
  };

  Map.prototype.canMoveRight = function(character) {
    return this.canMoveRightAt(character, character.x, character.y);
  };

  Map.prototype.canMoveUpAt = function(character, xPos, yPos) {
    var x = xPos;
    // for (var x = xPos; x < (xPos + character.width); x++) {
      if (!this.isValid(x, yPos - character.stepSize)) return false;

      for (var i = character.stepSize; i > 0; i--) {
        if (character.isCollidedAt(x, yPos - i)) {
          return false;
        }
      }
    // }

    return true;
  };

  Map.prototype.canMoveUp = function(character) {
    return this.canMoveUpAt(character, character.x, character.y);
  };

  Map.prototype.canMoveDownAt = function(character, xPos, yPos) {
    var x = xPos;
    if (!this.isValid(x, yPos + character.height + character.stepSize)) return false;

    for (var i = character.stepSize; i > 0; i--) {
      if (character.isCollidedAt(x, yPos + i)) {
        return false;
      }
    }

    return true;
  };

  Map.prototype.canMoveDown = function(character) {
    return this.canMoveDownAt(character, character.x, character.y);
  };

  Map.prototype.canMove = function(character, direction) {

    if (direction.indexOf('left') >= 0) {
      if (!this.canMoveLeft(character)) {
        return false;
      }
    } else if (direction.indexOf('right') >= 0) {
      if (!this.canMoveRight(character)) {
        return false;
      }
    }

    if (direction.indexOf('up') >= 0) {
      if (!this.canMoveUp(character)) {
        return false;
      }
    } else if (direction.indexOf('down') >= 0) {
      if (!this.canMoveDown(character)) {
        return false;
      }
    }

    return true;
  };

  Map.prototype.loadMap = function(mapName) {
    this._mapName = mapName;
    this.mapData = TCHE.maps[mapName];
  };

  Map.prototype.changeMap = function(newMapName) {
    TCHE.SceneManager.changeScene(TCHE.SceneMapLoading, { mapName : newMapName });
  };
  
  TCHE.registerClass('Map', Map);
})();