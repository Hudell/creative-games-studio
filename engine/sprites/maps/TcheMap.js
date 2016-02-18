(function(){
  function TcheMap(map) {
    this.initialize(map);
  }

  TcheMap.prototype = Object.create(TCHE.MapSprite.prototype);
  TcheMap.prototype.constructor = TcheMap;

  TcheMap.prototype.initialize = function(map) {
    TCHE.MapSprite.prototype.initialize.call(this, map);

    this._layers = [];
    this.createLayers();
  };
  
  TcheMap.prototype.createTileLayer = function(layer) {
    var layerSprite = new TCHE.TcheLayerSprite(layer);
    this._layers.push(layerSprite);
    this.addChild(layerSprite);
  };

  TcheMap.prototype.createLayers = function() {
    var mapSprite = this;

    //Iterate over every layer to make sure there's a layer for the player
    var lastObjectLayer;
    var foundPlayerLayer = false;

    this._map.mapData.layers.forEach(function(layer){
      if (layer.type == 'objectgroup') {
        lastObjectLayer = layer;

        if (layer.properties !== undefined && layer.properties.playerLayer !== undefined) {
          foundPlayerLayer = true;
        }
      }
    });

    //If no playerLayer was found, set the last object layer as the player layer
    if (!foundPlayerLayer && !!lastObjectLayer) {
      lastObjectLayer.properties = lastObjectLayer.properties || {};
      lastObjectLayer.properties.playerLayer = true;
    }

    this._map.mapData.layers.forEach(function(layer){
      switch(layer.type) {
        case 'tilelayer' :
          mapSprite.createTileLayer(layer);
          break;
        case 'objectgroup' :
          mapSprite.creatObjectLayer(layer);
          break;
      }
    });
  };

  TcheMap.prototype.creatObjectLayer = function(layer) {
    var layerSprite = new TCHE.TcheObjectLayerSprite(layer);
    this._layers.push(layerSprite);
    this.addChild(layerSprite);

    this._map.objects.forEach(function(obj){
      if (obj.layerName == layer.name) {
        layerSprite.createObjectSprite(obj);
      }
    }.bind(this));

    if (layer.properties !== undefined && layer.properties.playerLayer !== undefined) {
      layerSprite.createObjectSprite(TCHE.globals.player);
    }

    layerSprite.update();
  };

  TcheMap.prototype.updateLayers = function(){
    this._layers.forEach(function(layer){
      layer.update();
    });
  };

  TcheMap.prototype.update = function() {
    TCHE.MapSprite.prototype.update.call();

    this.updateLayers();
    
    this.x = TCHE.globals.map.offsetX;
    this.y = TCHE.globals.map.offsetY;
  };
  
  TCHE.registerClass('TcheMap', TcheMap);
})();