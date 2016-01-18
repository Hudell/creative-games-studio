(function(){
  var path = require("path");

  TCHE.fillScenes = function(selectId) {
    var element = $('#' + selectId);
    element.html('');

    var scenes = TCHE.getAllScenes();
    for (var i = 0; i < scenes.length; i++) {
      element.append('<option value="' +  scenes[i] + '">' +  scenes[i] + '</option>');
    }
  };
})();