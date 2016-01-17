(function(){
  var path = require("path");

  TCHE.goToImageSpriteImportScreen = function(filePath) {
    TCHE.showMessage('File will need to be imported.');
  };

  TCHE.onChooseImageSpriteToImport = function(filePath) {
    if (TCHE.isFileImported(filePath)) {
      TCHE.showMessage('The selected image was already imported.');
      $('#import-image-sprite-image').val('');
      return;
    }

    var baseName = path.basename(filePath);
    var newPath = path.join('assets', 'sprites', baseName);
    $('#import-image-sprite-new-name').val(newPath);

    var img = $("<img src='" + filePath + "'>");
    img.on('load', function(){
      var width = img[0].width;
      var height = img[0].height;

      $('#import-image-sprite-width').val(width);
      $('#import-image-sprite-height').val(height);
    });

    $('#import-image-sprite-image-preview').html(img);
  };

  TCHE.onChooseImageSprite = function(filePath) {
    if (!TCHE.isFileImported(filePath)) {
      TCHE.goToImageSpriteImportScreen(filePath);
      return;
    }

    var img = $("<img src='" + filePath + "'>");
    img.on('load', function(){
      var width = img[0].width;
      var height = img[0].height;

      $('#new-image-sprite-width').val(width);
      $('#new-image-sprite-height').val(height);
    });

    $('#new-image-sprite-image-preview').html(img);
  };

  TCHE.saveNewImageSprite = function() {
    var imageFile = $('#new-image-sprite-image').val();
    if (!imageFile || !imageFile.trim()) {
      throw new Error("Select a file to use.");
    }

    if (!TCHE.isFileImported(imageFile)) {
      throw new Error("The selected image file was not imported.");
    }

    var spriteName = $('#new-image-sprite-name').val();
    if (!spriteName || !spriteName.trim) {
      throw new Error("You need to give this sprite a name.");
    }

    var width = $('#new-image-sprite-width').val();
    if (isNaN(width) || width == 0) {
      throw new Error("Invalid image width.");
    }

    var height = $('#new-image-sprite-height').val();
    if (isNaN(height) || height == 0) {
      throw new Error("Invalid image height.");
    }

    if (TCHE.gameData.sprites[spriteName] !== undefined) {
      throw new Error("A sprite called " + spriteName + " already exists.");
    }

    var imageRelativePath = imageFile.replace(TCHE.loadedGame.folder, '').replace(TCHE.currentGamePath, '');
    while (imageRelativePath.length > 0 && (imageRelativePath.substr(0, 1) == "\\" || imageRelativePath.substr(0, 1) == '/')) {
      imageRelativePath = imageRelativePath.slice(1, imageRelativePath.length);
    }

    TCHE.gameData.sprites[spriteName] = {
      "type" : "image",
      "image" : imageRelativePath,
      "width" : width,
      "height" : height
    };

    TCHE.saveGameData();
    TCHE.openWindow('sprites');
  };

  TCHE.importImageSprite = function() {
    var imageFile = $('#import-image-sprite-image').val();
    if (!imageFile || !imageFile.trim()) {
      throw new Error("Select a file to import.");
    }

    if (TCHE.isFileImported(imageFile)) {
      throw new Error("The selected image file was already imported.");
    }

    var width = $('#import-image-sprite-width').val();
    if (isNaN(width) || width == 0) {
      throw new Error("Invalid image width.");
    }

    var height = $('#import-image-sprite-height').val();
    if (isNaN(height) || height == 0) {
      throw new Error("Invalid image height.");
    }

    var newName = $('#import-image-sprite-new-name').val();
    if (!newName || !newName.trim) {
      throw new Error("You need to give this file a new name.");
    }

    var name = $('#import-image-sprite-name').val();
    if (!!name && !!name.trim()) {
      if (TCHE.gameData.sprites[name] !== undefined) {
        throw new Error("A sprite called " + name + " already exists.");
      }
    }

    TCHE.copyFileSync(imageFile, path.join('currentGame', newName));

    if (!!name && !!name.trim()) {
      TCHE.gameData.sprites[name] = {
        "type" : "image",
        "image" : newName,
        "width" : width,
        "height" : height
      };
    }

    TCHE.saveGameData();
    TCHE.openWindow('sprites');
  };
})();