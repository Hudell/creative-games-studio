(function(){
  function Params() {

  }

  Params.loadParams = function() {
    var params = window.location.search.slice(1).split('&');
    TCHE.Params.params = {};

    params.forEach(function(param){
      var data = param.split('=');
      var name = data[0].toLowerCase();
      if (data.length > 1) {
        TCHE.Params.params[name] = data[1];
      } else {
        TCHE.Params.params[name] = true;
      }
    });     
  };

  Params.getForceCanvas = function() {
    return Params.param('canvas');
  };
  Params.getForceWebGl = function() {
    return Params.param('webgl');
  };
  Params.getIsNwJs = function() {
    return (typeof require) !== "undefined";
  };

  TCHE.reader(Params, 'forceCanvas', Params.getForceCanvas);
  TCHE.reader(Params, 'forceWebGl', Params.getForceWebGl);
  TCHE.reader(Params, 'isNwjs', Params.getIsNwJs);

  Params.param = function(paramName) {
    return Params.params[paramName.toLowerCase()] || false;
  };

  TCHE.Params = Params;
  TCHE.Params.loadParams();
})();