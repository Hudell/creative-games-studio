(function(){
  var path = require("path");

  STUDIO.fillScenes = function(selectId) {
    var element = $('#' + selectId);
    element.html('');

    var scenes = STUDIO.getAllScenes();
    for (var i = 0; i < scenes.length; i++) {
      element.append('<option value="' +  scenes[i] + '">' +  scenes[i] + '</option>');
    }
  };
})();