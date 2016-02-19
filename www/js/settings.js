(function(){
  var path = require("path");

  STUDIO.saveGameSettings = function(){
    STUDIO.gameData.initialScene = $('#settings-game-initial-scene').val();
    STUDIO.gameData.initialMap = $('#settings-game-initial-map').val();
    STUDIO.gameData.mainSkin = $('#settings-game-main-skin').val();
    STUDIO.gameData.resolution.width = $('#settings-game-resolution-width').val();
    STUDIO.gameData.resolution.height = $('#settings-game-resolution-height').val();
    STUDIO.gameData.resolution.screenWidth = $('#settings-game-screen-width').val();
    STUDIO.gameData.resolution.screenHeight = $('#settings-game-screen-height').val();
    STUDIO.gameData.resolution.useDynamicResolution = $('#settings-game-resolution-use-dynamic-resolution')[0].checked;

    STUDIO.markAsModified();
    STUDIO.DatabaseManager.openDatabaseWindow();
  };

  STUDIO.validatePlayerType = function() {
    var type = $('#settings-player-component').val();

    var data = STUDIO.ObjectManager.findObjectData(type);
    if (!data) {
      throw new Error(t("Invalid Player Component"));
    }

    if (data.name !== 'Player' && !STUDIO.ObjectManager.objectExtendsThis(data, 'Player')) {
      throw new Error(t("Invalid Player Component"));
    }
  };

  STUDIO.savePlayerSettings = function(){
    STUDIO.validatePlayerType();

    STUDIO.gameData.player.type = $('#settings-player-component').val();
    STUDIO.gameData.player.sprite = $('#settings-player-sprite').val();
    STUDIO.gameData.player.x = $('#settings-player-x').val();
    STUDIO.gameData.player.y = $('#settings-player-y').val();
    STUDIO.gameData.player.xOffset = $('#settings-player-hitbox-x').val();
    STUDIO.gameData.player.yOffset = $('#settings-player-hitbox-y').val();
    STUDIO.gameData.player.width = $('#settings-player-hitbox-width').val();
    STUDIO.gameData.player.height = $('#settings-player-hitbox-height').val();

    STUDIO.markAsModified();
    STUDIO.DatabaseManager.openDatabaseWindow();
  };

  STUDIO.loadGameSettings = function(){
    $('#settings-game-initial-scene').val(STUDIO.gameData.initialScene);
    $('#settings-game-initial-map').val(STUDIO.gameData.initialMap);
    $('#settings-game-main-skin').val(STUDIO.gameData.mainSkin);
    $('#settings-game-resolution-width').val(STUDIO.gameData.resolution.width);
    $('#settings-game-resolution-height').val(STUDIO.gameData.resolution.height);
    $('#settings-game-screen-width').val(STUDIO.gameData.resolution.screenWidth);
    $('#settings-game-screen-height').val(STUDIO.gameData.resolution.screenHeight);
    $('#settings-game-resolution-use-dynamic-resolution')[0].checked = STUDIO.gameData.resolution.useDynamicResolution;
  };

  STUDIO.loadPlayerSettings = function(){
    $('#settings-player-component').val(STUDIO.gameData.player.type);
    if (!!STUDIO.gameData.player.type) {
      $('#settings-player-component-btn').html(STUDIO.gameData.player.type);
    } else {
      $('#settings-player-component-btn').html(t("Choose a Component"));
    }
    //Makes sure the loaded value is not translated.
    $('#settings-player-component-btn').removeClass('translation-span');

    $('#settings-player-sprite').val(STUDIO.gameData.player.sprite);
    $('#settings-player-x').val(STUDIO.gameData.player.x);
    $('#settings-player-y').val(STUDIO.gameData.player.y);
    $('#settings-player-hitbox-x').val(STUDIO.gameData.player.xOffset);
    $('#settings-player-hitbox-y').val(STUDIO.gameData.player.yOffset);
    $('#settings-player-hitbox-width').val(STUDIO.gameData.player.width);
    $('#settings-player-hitbox-height').val(STUDIO.gameData.player.height);
  };
})();