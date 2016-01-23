(function(){
  var path = require("path");

  STUDIO.goToImageSpriteImportScreen = function(filePath) {
    STUDIO.showMessage('File will need to be imported.');
  };

  STUDIO.onChooseImageSpriteToImport = function(filePath) {
    if (STUDIO.isFileImported(filePath)) {
      STUDIO.showMessage('The selected image was already imported.');
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

  STUDIO.onChooseImageSprite = function(filePath) {
    if (!STUDIO.isFileImported(filePath)) {
      STUDIO.goToImageSpriteImportScreen(filePath);
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

  STUDIO.saveNewImageSprite = function() {
    var imageFile = $('#new-image-sprite-image').val();
    if (!imageFile || !imageFile.trim()) {
      throw new Error("Select a file to use.");
    }

    if (!STUDIO.isFileImported(imageFile)) {
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

    if (STUDIO.gameData.sprites[spriteName] !== undefined) {
      throw new Error("A sprite called " + spriteName + " already exists.");
    }

    var imageRelativePath = imageFile.replace(STUDIO.loadedGame.folder, '');
    while (imageRelativePath.length > 0 && (imageRelativePath.substr(0, 1) == "\\" || imageRelativePath.substr(0, 1) == '/')) {
      imageRelativePath = imageRelativePath.slice(1, imageRelativePath.length);
    }

    STUDIO.gameData.sprites[spriteName] = {
      "type" : "image",
      "image" : imageRelativePath,
      "width" : width,
      "height" : height
    };

    STUDIO.markAsModified();
    STUDIO.openWindow('sprites');
  };

  STUDIO.importImageSprite = function() {
    var imageFile = $('#import-image-sprite-image').val();
    if (!imageFile || !imageFile.trim()) {
      throw new Error("Select a file to import.");
    }

    if (STUDIO.isFileImported(imageFile)) {
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
      if (STUDIO.gameData.sprites[name] !== undefined) {
        throw new Error("A sprite called " + name + " already exists.");
      }
    }

    var newPath = path.join(STUDIO.loadedGame.folder, newName);
    STUDIO.copyFileSync(imageFile, newPath);

    if (!!name && !!name.trim()) {
      STUDIO.gameData.sprites[name] = {
        "type" : "image",
        "image" : newName,
        "width" : width,
        "height" : height
      };
    }


    STUDIO.markAsModified();    
    STUDIO.openWindow('sprites');
  };
})();