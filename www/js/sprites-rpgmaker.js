(function(){
  var path = require("path");

  STUDIO.goToRpgMakerSpriteImportScreen = function(filePath) {
    STUDIO.showMessage(t("File will need to be imported."));
  };

  STUDIO.loadRpgMakerSpriteImage = function(imagePath, prefix) {
    var img = $("<img src='" + imagePath + "'>");
    img.on('load', function(){
      var width = img[0].width;
      var height = img[0].height;

      $('#' + prefix + '-rpgmaker-sprite-width').val(width);
      $('#' + prefix + '-rpgmaker-sprite-height').val(height);

      var maxWidth = $('img').parents('.preview-image').width();
      maxWidth -= 20;
      if (width > maxWidth) {
        img.css('max-width', maxWidth);
      }

      STUDIO.makeRpgMakerSpriteSetSiteMap(prefix, img);
    });

    $('#' + prefix + '-rpgmaker-sprite-image-preview').html(img);
  }

  STUDIO.onChooseRpgMakerSpriteToImport = function(filePath) {
    if (STUDIO.isFileImported(filePath)) {
      STUDIO.showMessage(t("The selected image was already imported."));
      $('#import-rpgmaker-sprite-image').val('');
      return;
    }

    var baseName = path.basename(filePath);
    var newPath = path.join('assets', 'sprites', baseName);
    $('#import-rpgmaker-sprite-new-name').val(newPath);

    STUDIO.loadRpgMakerSpriteImage(filePath, 'import');
  };

  STUDIO.makeRpgMakerSpriteSetSiteMap = function(selector, img){
    var sitemap = "<map name='spritemap'>";

    var width = img[0].width;
    var height = img[0].height;
    var spriteWidth = Math.floor(width / 4);
    var spriteHeight = Math.floor(height / 2);

    for (var i = 0; i < 8; i++) {
      var x = (i % 4) * spriteWidth;
      var y = i >= 4 ? spriteHeight : 0;

      sitemap += "<area shape='rect' coords='" + x + ',' + y + ',' + (x + spriteWidth) + ',' + (y + spriteHeight) + "' alt='Sprite " + i + "' title='Sprite " + i + "' href='#' class='image-map translation-title' data-index='" + i + "'>";
    }
    sitemap += "</map>";

    var fullSelector = '#' + selector + '-rpgmaker-sprite-image-preview';

    $(fullSelector).append(sitemap);
    $(img).attr('usemap', '#spritemap');
    $('img[usemap]').maphilight();

    $('.image-map').on('click', function(event){
      event.preventDefault();

      var index = event.currentTarget.dataset.index;

      $('#' + selector + '-rpgmaker-sprite-index-' + index).prop('checked', 'checked');
    });
  };

  STUDIO.onChooseRpgMakerSprite = function(filePath) {
    if (!STUDIO.isFileImported(filePath)) {
      STUDIO.goToRpgMakerSpriteImportScreen(filePath);
      return;
    }

    STUDIO.loadRpgMakerSpriteImage(filePath, 'new');
  };

  STUDIO.onChooseRpgMakerSpriteToEdit = function(filePath) {
    if (!STUDIO.isFileImported(filePath)) {
      STUDIO.goToRpgMakerSpriteImportScreen(filePath);
      return;
    }

    STUDIO.loadRpgMakerSpriteImage(filePath, 'edit');
  };

  STUDIO.saveNewRpgMakerSprite = function() {
    var imageFile = $('#new-rpgmaker-sprite-image').val();
    if (!imageFile || !imageFile.trim()) {
      throw new Error(t("Select a file to use."));
    }

    if (!STUDIO.isFileImported(imageFile)) {
      throw new Error(t("The selected image file was not imported."));
    }

    var spriteName = $('#new-rpgmaker-sprite-name').val();
    if (!spriteName || !spriteName.trim) {
      throw new Error(t("You need to give this sprite a name."));
    }

    var width = $('#new-rpgmaker-sprite-width').val();
    if (isNaN(width) || width == 0) {
      throw new Error(t("Invalid image width."));
    }

    var height = $('#new-rpgmaker-sprite-height').val();
    if (isNaN(height) || height == 0) {
      throw new Error(t("Invalid image height."));
    }

    var index = $('input[name="new-rpgmaker-sprite-index"]:checked').val();
    if (!index || isNaN(index) || index < 0 || index >= 8) {
      throw new Error(t("Invalid Index."));
    }

    if (STUDIO.gameData.sprites[spriteName] !== undefined) {
      throw new Error(t("A sprite with that name already exists."));
    }

    var imageRelativePath = imageFile.replace(STUDIO.settings.folder, '');
    while (imageRelativePath.length > 0 && (imageRelativePath.substr(0, 1) == "\\" || imageRelativePath.substr(0, 1) == '/')) {
      imageRelativePath = imageRelativePath.slice(1, imageRelativePath.length);
    }

    STUDIO.gameData.sprites[spriteName] = {
      "type" : "rpgmaker",
      "image" : imageRelativePath,
      "imageWidth" : width,
      "imageHeight" : height,
      "index" : index
    };

    STUDIO.addRecentObject('sprite', spriteName);
    STUDIO.markAsModified();
    STUDIO.DatabaseManager.openWindow('sprites', 'sprites');
  };

  STUDIO.importRpgMakerSprite = function() {
    var imageFile = $('#import-rpgmaker-sprite-image').val();
    if (!imageFile || !imageFile.trim()) {
      throw new Error(t("Select a file to import."));
    }

    if (STUDIO.isFileImported(imageFile)) {
      throw new Error(t("The selected image file was already imported."));
    }

    var width = $('#import-rpgmaker-sprite-width').val();
    if (isNaN(width) || width == 0) {
      throw new Error(t("Invalid image width."));
    }

    var height = $('#import-rpgmaker-sprite-height').val();
    if (isNaN(height) || height == 0) {
      throw new Error(t("Invalid image height."));
    }

    var newName = $('#import-rpgmaker-sprite-new-name').val();
    if (!newName || !newName.trim) {
      throw new Error(t("You need to give this file a new name."));
    }

    for (var i = 0; i < 8; i++) {
      var name = $('#import-rpgmaker-sprite-name-' + i).val();
      if (!name || !name.trim()) {
        continue;
      }

      if (STUDIO.gameData.sprites[name] !== undefined) {
        throw new Error(t("A sprite with that name already exists."));
      }
    }

    var newPath = path.join(STUDIO.settings.folder, newName);
    STUDIO.copyFileSync(imageFile, newPath);

    for (var i = 0; i < 8; i++) {
      var name = $('#import-rpgmaker-sprite-' + i).val();
      if (!name || !name.trim()) {
        continue;
      }

      STUDIO.gameData.sprites[name] = {
        "type" : "rpgmaker",
        "image" : newName,
        "imageWidth" : width,
        "imageHeight" : height,
        "index" : i
      };      
    }

    STUDIO.markAsModified();
    STUDIO.DatabaseManager.openWindow('sprites', 'sprites');
  };


  STUDIO.saveOldRpgMakerSprite = function(){
    var spriteName = $('#edit-rpgmaker-sprite-name').val();
    if (!spriteName || !spriteName.trim) {
      throw new Error(t("I forgot what sprite you were modifying. Try again."));
    }

    var data = STUDIO.gameData.sprites[spriteName];
    if (!data) {
      throw new Error(t("I couldn't find the existing sprite data."));
    }

    var imageFile = $('#edit-rpgmaker-sprite-image').val();
    if (!imageFile || !imageFile.trim()) {
      imageFile = path.join(STUDIO.settings.folder, data.image);
    }

    if (!STUDIO.isFileImported(imageFile)) {
      throw new Error(t("The selected image file was not imported."));
    }

    var width = $('#edit-rpgmaker-sprite-width').val();
    if (isNaN(width) || width == 0) {
      throw new Error(t("Invalid image width."));
    }

    var height = $('#edit-rpgmaker-sprite-height').val();
    if (isNaN(height) || height == 0) {
      throw new Error(t("Invalid image height."));
    }

    var index = $('input[name="edit-rpgmaker-sprite-index"]:checked').val();
    if (!index || isNaN(index) || index < 0 || index >= 8) {
      throw new Error(t("Invalid Index."));
    }

    var imageRelativePath = imageFile.replace(STUDIO.settings.folder, '');
    while (imageRelativePath.length > 0 && (imageRelativePath.substr(0, 1) == "\\" || imageRelativePath.substr(0, 1) == '/')) {
      imageRelativePath = imageRelativePath.slice(1, imageRelativePath.length);
    }

    data.image = imageRelativePath;
    data.imageWidth = width;
    data.imageHeight = height;
    data.index = index;

    STUDIO.gameData.sprites[spriteName] = {
      "type" : "rpgmaker",
      "image" : imageRelativePath,
      "imageWidth" : width,
      "imageHeight" : height,
      "index" : index
    };

    STUDIO.addRecentObject('sprite', spriteName);
    STUDIO.markAsModified();
    STUDIO.DatabaseManager.openWindow('sprites', 'sprites');
  };

  STUDIO.loadRpgMakerSpriteData = function(spriteName) {
    var spriteData = STUDIO.gameData.sprites[spriteName];

    var fullImagePath = path.join(STUDIO.settings.folder, spriteData.image);

    STUDIO.loadRpgMakerSpriteImage(fullImagePath, 'edit');
    
    $('#edit-rpgmaker-sprite-name').val(spriteName);
    $('#edit-rpgmaker-sprite-index-' + spriteData.index).prop('checked', 'checked');
  };

  STUDIO.removeCurrentRpgMakerSprite = function() {
    var skinName = $('#edit-rpgmaker-sprite-name').val();
    STUDIO.removeSprite(skinName);
  };

  STUDIO.editRpgMakerSprite = function(spriteName) {
    STUDIO.DatabaseManager.openWindow('sprites', 'edit-sprite-rpgmaker', function(){
      STUDIO.loadRpgMakerSpriteData(spriteName);
    });
  };
})();