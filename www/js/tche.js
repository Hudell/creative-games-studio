$(function(){
  window.onerror = function(msg, url, line, col, error) {
    TCHE.openDialog($("<div></div>").html(error.message), 'Error');
    return false;
  };
});

var TCHE = {};
(function(){
  var path = require("path");
  var fs = require("fs");
  var gui = require('nw.gui');
  var win = gui.Window.get();
  TCHE.win = win;


  TCHE.gameData = undefined;
  TCHE.loadedGame = {
    folder : ""
  };
  TCHE.modified = false;

  TCHE.requestPage = function(pageName, onSuccess, onError) {
    var mimeType = "text/html";
    var filePath = path.join('pages', pageName);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', filePath);
    if (mimeType && xhr.overrideMimeType) {
      xhr.overrideMimeType(mimeType);
    }
    xhr.onload = function(result){
      if (xhr.status < 400) {
        onSuccess.call(this, result, xhr);
      } else {
        if (!!onError) {
          onError.call(this);
        }
      }
    };
    xhr.onerror = onError;
    xhr.send();
  };

  TCHE.openDialog = function(element, title, buttons) {
    element.dialog({
      title : title || "Information",
      width : 'auto',
      modal : true,
      close: function () {
        $(this).dialog('destroy').remove ();
      },
      buttons: buttons || [
        {
          text: "Ok",
          click: function() {
            $( this ).dialog( "close" );
          }
        }
      ]      
    });
  };

  TCHE.confirm = function(message, okCallback, title, cancelCallback){
    TCHE.customConfirm(message, title || "Confirmation", "Ok", "Cancel", okCallback, cancelCallback);
  };

  TCHE.customConfirm = function(message, title, okLabel, cancelLabel, okCallback, cancelCallback) {
    TCHE.openDialog($("<div></div>").html(message), title, [
      {
        text : okLabel,
        click : function() {
          if (!!okCallback) {
            okCallback();
          }
          $(this).dialog("close");
        }
      },
      {
        text : cancelLabel,
        click : function() {
          if (!!cancelCallback) {
            cancelCallback();
          }
          $(this).dialog("close");
        }        
      }
    ]);
  };

  TCHE.deepClone = function(obj) {
    var result;
    if (obj instanceof Array) {
      return obj.map(function(i) { return TCHE.deepClone(i); });
    } else if (obj && !obj.prototype && (typeof obj == 'object' || obj instanceof Object)) {
      result = {};
      for (var p in obj) {
        result[p] = TCHE.deepClone(obj[p]);
      }
      return result;
    }
    return obj;
  };

  TCHE.showMessage = function(message) {
    TCHE.openDialog($("<div></div>").html(message));
  };

  TCHE.showError = function(message) {
    console.error(message);
    TCHE.openDialog($("<div></div>").html(message), 'Error');
  };

  TCHE.loadJson = function(fileName) {
    if (!fs.existsSync(fileName)) {
      throw new Error("File not found: " + fileName);
      return;
    }

    var content = fs.readFileSync(fileName, {encoding : 'utf8'});

    return JSON.parse(content);
  };

  TCHE.saveJson = function(fileName, json) {
    var dir = path.dirname(fileName);
    TCHE.forceDirSync(dir);

    var content = JSON.stringify(json, null, '  ');
    fs.writeFileSync(fileName, content, {encoding : 'utf8'});
  };

  TCHE.clearTableRows = function(tableId) {
    $('#' + tableId).children('tbody').html('');
  }

  TCHE.addRowToTable = function(tableId, data, className, id) {
    var row = '<tr class="' + className + '-row clickable" data-element-id="' + id + '">';

    data.forEach(function(col){
      row += '<td>';
      row += col;
      row += '</td>';
    });

    row += '</tr>';

    $('#' + tableId).children('tbody').append(row);
  };

  TCHE.openPopup = function(popupName, title, callback, buttons) {
    TCHE.requestPage(path.join('popups', popupName + '.html'), function(result, xhr){
      TCHE.openDialog($('<div></div>').html(xhr.responseText), title, buttons || [
        {
          text: "Close",
          click: function() {
            $(this).dialog("close");
          }
        }
      ]);
      TCHE.fixLinks();

      if (!!callback) {
        callback();
      }
    });
  };

  TCHE.openPopupForm = function(popupName, title, okCallback, loadCallback) {
    TCHE.openPopup(popupName, title, loadCallback || false, [
      {
        text : "Confirm",
        click : function(){
          var canClose = true;
          if (!!okCallback) {
            canClose = okCallback() !== false;
          }

          if (canClose) {
            $(this).dialog("close");
          }
        }
      }
    ]);
  };

  TCHE.openWindow = function(windowName, callback) {
    $('.menu-option').parent().removeClass('active');
    
    if (windowName !== 'new-project') {
      if (!TCHE.isGameLoaded()) {
        TCHE.openWindow('new-project');

        if (windowName !== 'index') {
          TCHE.showError("There's no game loaded.");
          return;
        } else {
          return;
        }
      }
    }

    TCHE.requestPage(windowName + '.html', function(result, xhr){
      $('#page-wrapper').html(xhr.responseText);

      TCHE.fixLinks();

      if (!!callback) {
        callback();
      }
    });

    $('#' + windowName + '-btn').addClass('active');
  };

  TCHE.changeLoadedPath = function(newPath) {
    if (!TCHE.loadedGame) {
      TCHE.loadedGame = TCHE.loadJson('loadedGame.json');
    }

    TCHE.loadedGame.folder = newPath;
    TCHE.saveJson('loadedGame.json', TCHE.loadedGame);

    TCHE.changeGamePath(newPath);
  };

  TCHE.eventOpenWindow = function(event, windowName) {
    event.preventDefault();
    TCHE.openWindow(windowName);
  };

  TCHE.closeProject = function(){
    TCHE.changeLoadedPath('');
  };

  TCHE.openProject = function(folderPath) {
    if (!fs.existsSync(path.join(folderPath, "game.json"))) {
      TCHE.showError("Game Data not found");
      return;
    }
    if (!fs.existsSync(path.join(folderPath, 'index.html'))) {
      TCHE.showError("Game Index not found");
      return;
    }
    if (!fs.existsSync(path.join(folderPath, 'main.js'))) {
      TCHE.showError("Main Game not found");
      return;
    }

    TCHE.loadProject(folderPath);
  };

  TCHE.saveProject = function() {
    if (!TCHE.isGameLoaded()) {
      throw new Error("There's no game loaded.");
    }

    //If there's any save button visible on screen, click it.
    $('.btn-save').click();
    TCHE.saveGameData();
    TCHE.copyEngineFiles();
    TCHE.markAsSaved();
  };

  TCHE.copyEngineFiles = function() {
    var projectFolder = TCHE.loadedGame.folder;

    TCHE.copyFolderSync(path.join('emptyGame', 'tche'), path.join(projectFolder, 'tche'));
  };

  TCHE.reloadProject = function() {
    location.reload();
  };

  TCHE.reloadProjectButton = function() {
    if (!TCHE.isGameLoaded()) {
      throw new Error("There's no game loaded.");
    }

    if (TCHE.isGameModified()) {
      TCHE.customConfirm("Unsaved changes will be lost.", "Attention", "No problem.", "Wait, No.", function(){
        TCHE.reloadProject();
      });
    } else {
      TCHE.reloadProject();
    }    
  };

  TCHE.newProject = function() {
    TCHE.openWindow('new-project');
  };

  TCHE.newProjectButton = function(){
    if (TCHE.isGameModified()) {
      TCHE.customConfirm("Unsaved changes will be lost.", "Attention", "No problem.", "Wait, No.", function(){
        TCHE.newProject();
      });
    } else {
      TCHE.newProject();
    }
  };

  TCHE.playProject = function() {
    var newWin = gui.Window.open('file://' + TCHE.loadedGame.folder + '/index.html?debug', {
      position : 'center',
      title : TCHE.gameData.name,
      toolbar : true
    });
  };

  TCHE.playProjectButton = function(){
    if (!TCHE.isGameLoaded()) {
      throw new Error("There's no game loaded.");
    }

    if (TCHE.isGameModified()) {
      TCHE.confirm("Save before running?", function(){
        TCHE.saveProject();
        TCHE.playProject();
      });
    } else {
      TCHE.playProject();
    }
  };

  TCHE.removeFolderContent = function(folderPath) {
    var files;

    try {
      files = fs.readdirSync(folderPath);
    }
    catch(e) {
      console.log("Failed to clean folder content", folderPath);
      TCHE.showError("Failed clean folder content");
      return;
    }

    if (files.length > 0) {
      for (var i = 0; i < files.length; i++) {
        var filePath = path.join(folderPath, files[i]);
        if (fs.statSync(filePath).isFile()) {
          fs.unlinkSync(filePath);
        } else {
          TCHE.removeFolderContent(filePath);
          fs.rmdirSync(filePath);
        }
      }
    }
  };

  TCHE.copyFolderSync = function(folderPath, destinationPath) {
    var files = [];

    //check if folder needs to be created or integrated
    if (!fs.existsSync(destinationPath)) {
      TCHE.forceDirSync(destinationPath);
    }

    //copy
    if (fs.lstatSync(folderPath).isDirectory() ) {
      files = fs.readdirSync(folderPath);
      files.forEach(function(file) {
        var curSource = path.join(folderPath, file);
        if (fs.lstatSync(curSource).isDirectory()) {
          TCHE.copyFolderSync(curSource, path.join(destinationPath, file));
        } else {
          TCHE.copyFileSync(curSource, destinationPath);
        }
      });
    }
  };

  TCHE.forceDirSync = function(dirPath) {
    var dirname = path.dirname(dirPath);
    if (!fs.existsSync(dirname)) {
      TCHE.forceDirSync(dirname);
    }

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }
  };

  TCHE.copyFileSync = function(source, target) {
    if (source == target) return;

    var targetFile = target;

    var dirname = path.dirname(target);
    if (!fs.existsSync(dirname)) {
      TCHE.forceDirSync(dirname);
    }

    //if target is a directory a new file with the same name will be created
    if (fs.existsSync(target)) {
      if (fs.lstatSync(target).isDirectory()) {
        targetFile = path.join(target, path.basename(source));
      }
    }

    fs.writeFileSync(targetFile, fs.readFileSync(source));
  };

  TCHE.loadProject = function(folderPath) {
    TCHE.changeLoadedPath(folderPath);
    TCHE.loadGameData();
    TCHE.markAsSaved();
  };

  TCHE.openProjectDialog = function() {
    var dialog = $("<input type='file' nwdirectory>");

    dialog.on('change', function(){
      TCHE.openProject(dialog.val());
    });

    dialog.click();
  };

  TCHE.changeGameTitle = function(newTitle) {
    // $('#gameName').html(newTitle);
  };

  TCHE.changeGamePath = function(newPath) {
    win.title = 'TCHE Editor - ' + newPath;
  };

  TCHE.loadLoadedGameInfo = function() {
    try {
      TCHE.loadedGame = TCHE.loadJson('loadedGame.json');
    }
    catch(e) {
      TCHE.changeGamePath("");
      throw e;
    }

    TCHE.changeGamePath(TCHE.loadedGame.folder);
  };

  TCHE.loadGameData = function() {
    try {
      TCHE.gameData = TCHE.loadJson(path.join(TCHE.loadedGame.folder, 'game.json'));
    }
    catch(e) {
      try{
        TCHE.changeGameTitle('No Game Loaded');
        TCHE.closeProject();
      }
      catch(e) {
        console.error(e);
        TCHE.showError("Game Data is missing and another error happened while closing the project.");
        return;
      }

      TCHE.showError("Game Data is missing. The project was unloaded.");
      return;
    }

    TCHE.validateGameData();
    if (!!TCHE.gameData && !!TCHE.gameData.name) {
      TCHE.changeGameTitle(TCHE.gameData.name);
    }

    TCHE.openWindow('index');
  };

  TCHE.getAllScenes = function() {
    return TCHE.gameData.tcheScenes.concat(TCHE.gameData.gameScenes);
  };

  TCHE.registerEngineScene = function(sceneName) {
    if (TCHE.gameData.tcheScenes.indexOf(sceneName) < 0) {
      TCHE.gameData.tcheScenes.push(sceneName);
    }
  };

  TCHE.validateGameData = function() {
    if (!TCHE.gameData.skins) {
      TCHE.gameData.skins = {};
    }
    if (!TCHE.gameData.sprites) {
      TCHE.gameData.sprites = {};
    }
    if (!TCHE.gameData.resolution) {
      TCHE.gameData.resolution = {};
    }
    if (!TCHE.gameData.player) {
      TCHE.gameData.player = {};
    }
    if (!TCHE.gameData.sounds) {
      TCHE.gameData.sounds = {};
    }
    if (!TCHE.gameData.maps) {
      TCHE.gameData.maps = {};
    }
    if (!TCHE.gameData.objects) {
      TCHE.gameData.objects = {};
    }
    if (!TCHE.gameData.variables) {
      TCHE.gameData.variables = {};
    }
    if (!TCHE.gameData.characters) {
      TCHE.gameData.characters = {};
    }
    if (!TCHE.gameData.languages) {
      TCHE.gameData.languages = {};
    }
    if (!TCHE.gameData.music) {
      TCHE.gameData.music = {};
    }
    if (!TCHE.gameData.soundEffects) {
      TCHE.gameData.soundEffects = {};
    }
    if (!TCHE.gameData.movies) {
      TCHE.gameData.movies = {};
    }
    if (!TCHE.gameData.items) {
      TCHE.gameData.items = {};
    }
    if (!TCHE.gameData.animations) {
      TCHE.gameData.animations = {};
    }
    if (!TCHE.gameData.faces) {
      TCHE.gameData.faces = {};
    }
    if (!TCHE.gameData.jobs) {
      TCHE.gameData.jobs = {};
    }
    if (!TCHE.gameData.enemies) {
      TCHE.gameData.enemies = {};
    }
    if (!TCHE.gameData.skills) {
      TCHE.gameData.skills = {};
    }
    if (!TCHE.gameData.states) {
      TCHE.gameData.states = {};
    }
    if (!TCHE.gameData.achievements) {
      TCHE.gameData.achievements = {};
    }
    if (!TCHE.gameData.huds) {
      TCHE.gameData.huds = {};
    }
    if (!TCHE.gameData.packages) {
      TCHE.gameData.packages = {};
    }
    if (!TCHE.gameData.vehicles) {
      TCHE.gameData.vehicles = {};
    }

    if (!TCHE.gameData.tcheScenes) {
      TCHE.gameData.tcheScenes = [];
    }

    TCHE.registerEngineScene('SceneMap');
    TCHE.registerEngineScene('SceneTitle');

    if (!TCHE.gameData.gameScenes) {
      TCHE.gameData.gameScenes = [];
    }

    TCHE.gameData.resolution.width = TCHE.gameData.resolution.width || 640;
    TCHE.gameData.resolution.height = TCHE.gameData.resolution.height || 360;
    TCHE.gameData.resolution.screenWidth = TCHE.gameData.resolution.screenWidth || 640;
    TCHE.gameData.resolution.screenHeight = TCHE.gameData.resolution.screenHeight || 360;
    TCHE.gameData.name = TCHE.gameData.name || "Untitled Project";
    TCHE.gameData.initialMap = TCHE.gameData.initialMap || "";
    TCHE.gameData.initialScene = TCHE.gameData.initialScene || "SceneTitle";
    TCHE.gameData.mainSkin = TCHE.gameData.mainSkin || "system";
  };

  TCHE.saveGameData = function() {
    TCHE.saveJson(path.join(TCHE.loadedGame.folder, 'game.json'), TCHE.gameData);
  };

  TCHE.markAsSaved = function(){
    TCHE.modified = false;
    $('#save-btn').css('color', '#337ab7');
  };

  TCHE.markAsModified = function(){
    TCHE.modified = true;

    $('#save-btn').css('color', 'red');
  };

  TCHE.isFileImported = function(filePath) {
    var loadedPath = TCHE.loadedGame.folder;

    return filePath.indexOf(loadedPath) === 0;
  };

  TCHE.isGameLoaded = function(){
    return !!TCHE.loadedGame.folder && !!TCHE.gameData;
  };

  TCHE.isGameModified = function() {
    return TCHE.isGameLoaded() && TCHE.modified;
  };

  TCHE.exit = function(){
    win.close();
  };

  TCHE.updateCounters = function() {
    $('#map-count').html(Object.keys(TCHE.gameData.maps).length);
    
    $('#variable-count').html(Object.keys(TCHE.gameData.variables).length);
    $('#object-count').html(Object.keys(TCHE.gameData.objects).length);
    $('#sprite-count').html(Object.keys(TCHE.gameData.sprites).length);
    $('#character-count').html(Object.keys(TCHE.gameData.characters).length);

    $('#language-count').html(Object.keys(TCHE.gameData.languages).length);
    $('#music-count').html(Object.keys(TCHE.gameData.music).length);
    $('#sound-count').html(Object.keys(TCHE.gameData.soundEffects).length);
    $('#movie-count').html(Object.keys(TCHE.gameData.movies).length);

    $('#item-count').html(Object.keys(TCHE.gameData.items).length);
    $('#animation-count').html(Object.keys(TCHE.gameData.animations).length);
    $('#face-count').html(Object.keys(TCHE.gameData.faces).length);
    $('#skin-count').html(Object.keys(TCHE.gameData.skins).length);

    $('#class-count').html(Object.keys(TCHE.gameData.jobs).length);
    $('#enemy-count').html(Object.keys(TCHE.gameData.enemies).length);
    $('#skill-count').html(Object.keys(TCHE.gameData.skills).length);
    $('#state-count').html(Object.keys(TCHE.gameData.states).length);

    $('#achievement-count').html(Object.keys(TCHE.gameData.achievements).length);
    $('#hud-count').html(Object.keys(TCHE.gameData.huds).length);
    $('#package-count').html(Object.keys(TCHE.gameData.packages).length);
    $('#vehicle-count').html(Object.keys(TCHE.gameData.vehicles).length);
  };

  TCHE.exitButton = function(){
    if (TCHE.isGameModified()) {
      TCHE.confirm("Save before leaving?", function(){
        TCHE.saveProject();
        TCHE.exit();
      });
    } else {
      TCHE.exit();
    }
  };

  TCHE.onLoad = function(){
    $('#index-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'index'); });
    
    $('#maps-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'maps'); });
    $('#code-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'code'); });
    $('#plugins-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'plugins'); });
    
    $('#menu-characters-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'characters'); });
    $('#menu-objects-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'objects'); });
    $('#menu-sprites-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'sprites'); });
    $('#menu-variables-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'variables'); });
    
    $('#settings-player-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'settings-player'); });
    $('#settings-game-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'settings-game'); });
    $('#settings-steam-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'settings-steam'); });
    $('#settings-time-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'settings-time'); });

    $('#open-btn').on('click', function(event) {
      event.preventDefault();
      TCHE.openProjectDialog();
    });
    $('#save-btn').on('click', function(event) {
      event.preventDefault();            
      TCHE.saveProject();
    });
    $('#reload-btn').on('click', function(event) {
      event.preventDefault();
      TCHE.reloadProjectButton();
    });
    $('#new-btn').on('click', function(event) {
      event.preventDefault();
      TCHE.newProjectButton();
    });
    $('#play-btn').on('click', function(event) {
      event.preventDefault();
      TCHE.playProjectButton();
    });

    $('#exit-btn').on('click', function(event) {
      event.preventDefault();
      TCHE.exitButon();
    });

    TCHE.openWindow('index');

    TCHE.loadLoadedGameInfo();
    if (!!TCHE.loadedGame.folder) {
      TCHE.loadGameData();
    }

    TCHE.win.maximize();
  };

  TCHE.fixLinks = function(){
    setTimeout(function(){
      $('a[target=_blank]').on('click', function(){
        require('nw.gui').Shell.openExternal( this.href );
        return false;
      });
    }, 100);
  };
})();