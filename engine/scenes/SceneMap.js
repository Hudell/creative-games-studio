(function(){
  function SceneMap(params) {
    this.initialize(params);
  }

  SceneMap.prototype = Object.create(TCHE.Scene.prototype);
  SceneMap.prototype.constructor = SceneMap;

  SceneMap.prototype.initialize = function(params) {
    TCHE.Scene.prototype.initialize.call(this);

    var type = TCHE.data.game.player.type;
    var typeData = new (TCHE.objectTypes[type])();
    var properties = ['x', 'y', 'width', 'height', 'sprite'];

    if (!!typeData) {
      TCHE.globals.player.objectType = typeData;
      properties = typeData.extractProperties(TCHE.data.game.player);
    }

    var obj = TCHE.data.game.player;
    var objCharacter = TCHE.globals.player;

    for (var key in properties) {
      var value;
      if (obj.hasOwnProperty(key)) {
        value = obj[key];
      } else {
        value = (obj.properties || {})[key];
      }

      var propData = typeData.properties[key];
      if (!!propData && propData.type == 'number') {
        value = parseFloat(value) || 0;
      }

      objCharacter[key] = value;
    }    

    TCHE.globals.map.loadMap(params.mapName);

    var mapData = TCHE.globals.map.mapData;
    var spriteClass = TCHE.MapManager.getSpriteClass(mapData);

    this._mapSprite = new (spriteClass)(TCHE.globals.map);
    this.addChild(this._mapSprite);
  };

  SceneMap.prototype.update = function() {
    TCHE.Scene.prototype.update.call(this);

    TCHE.globals.map.update();
    TCHE.globals.player.update();

    this._mapSprite.update();
  };   

  SceneMap.prototype.processClick = function(pos) {
    TCHE.globals.player.setDest(pos.x - TCHE.globals.map.offsetX, pos.y - TCHE.globals.map.offsetY);
  };
  
  TCHE.registerClass('SceneMap', SceneMap);
})();