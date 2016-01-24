STUDIO.MapEditor = {};

(function(namespace){
  var fs = require("fs");
  var path = require("path");

  namespace.saveMapToEditor = function(mapName, mapData) {
    var newMapData = STUDIO.deepClone(mapData);
    var mapEditorFolder = path.join('www', 'mapEditor');
    var originalMapFolder = path.join(STUDIO.loadedGame.folder, 'maps');

    var tilesetsFolder = path.join(mapEditorFolder, 'assets', 'tilesets');
    var referencedTilesetsFolder = path.join('..', 'assets', 'tilesets');
    STUDIO.forceDirSync(tilesetsFolder);
    STUDIO.removeFolderContent(tilesetsFolder);

    for (var i = 0; i < newMapData.tilesets.length; i++) {
      var originalFile = path.join(originalMapFolder, newMapData.tilesets[i].image);
      var fileName = path.basename(originalFile);

      var newFileName = path.join(tilesetsFolder, fileName);
      var referencedFileName = path.join(referencedTilesetsFolder, fileName);
      newMapData.tilesets[i].image = referencedFileName;

      if (fs.existsSync(originalFile)) {
        STUDIO.copyFileSync(originalFile, newFileName);
      }
    }
    
    var mapFileName = path.join(mapEditorFolder, 'maps', 'map.json');
    STUDIO.saveJson(mapFileName, newMapData);
  };

  namespace.changeTool = function(toolName, iconClass) {
    namespace._currentTool = toolName;
    $('#map-editor-brush-types').html('<i class="fa fa-' + iconClass + ' fa-fw red-color"></i> <i class="fa fa-caret-down"></i>');
  };

  namespace.changeToolToBrush = function() {
    namespace.changeTool('brush', 'paint-brush');
  };

  namespace.changeToolToAutoTile = function() {
    namespace.changeTool('auto-tile', 'magic');
  };

  namespace.changeToolToLine = function() {
    namespace.changeTool('square', 'square-o');
  };

  namespace.changeToolToTint = function() {
    namespace.changeTool('tint', 'tint');
  };

  namespace.changeToolToEraser = function() {
    namespace.changeTool('eraser', 'eraser');
  };

  namespace.changeToolToPicker = function() {
    namespace.changeTool('picker', 'eyedropper');
  };

  namespace.zoomIn = function() {

  };

  namespace.zoomOut = function() {

  };

})(STUDIO.MapEditor);