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
    var filePath = './pages/' + pageName;

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

  TCHE.showMessage = function(message) {
    TCHE.openDialog($("<div></div>").html(message));
  };

  TCHE.showError = function(message) {
    console.error(message);
    TCHE.openDialog($("<div></div>").html(message), 'Error');
  };

  TCHE.loadJson = function(fileName) {
    if (!fs.existsSync(fileName)) {
      console.log("File not found: ", fileName);
      throw new Error("File not found");
      return;
    }

    var content = fs.readFileSync(fileName, {encoding : 'utf8'});

    return JSON.parse(content);
  };

  TCHE.saveJson = function(fileName, json) {
    var content = JSON.stringify(json, null, '  ');
    fs.writeFileSync(fileName, content, {encoding : 'utf8'});
  };

  TCHE.clearTableRows = function(tableId) {
    $('#' + tableId).children('tbody').html('');
  }

  TCHE.addRowToTable = function(tableId, data, className, id) {
    var row = '<tr>';

    data.forEach(function(col){
      row += '<td>';
      row += col;
      row += '</td>';
    });

    row += '<td>';
    row += '<a href="#" class="' + className + '-edit" data-element-id="' + id + '"><i class="fa fa-edit fa-fw"></i></a>';
    row += '<a href="#" class="' + className + '-delete" data-element-id="' + id + '"><i class="fa fa-remove fa-fw"></i></a>';
    row += '</td>';
    row += '</tr>';

    $('#' + tableId).children('tbody').append(row);
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

    TCHE.saveGameData();
    TCHE.markAsSaved();
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
    window.open('file://' + TCHE.loadedGame.folder + '/index.html?debug');
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

    fs.mkdirSync(dirPath);
  };

  TCHE.copyFileSync = function(source, target) {
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
    $('#gameName').html(newTitle);
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

    if (!TCHE.gameData.tcheScenes) {
      TCHE.gameData.tcheScenes = [
        'SceneMap',
        'SceneTitle'
      ];
    }
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
    
    $('#files-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'files'); });
    $('#faces-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'faces'); });
    $('#maps-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'maps'); });
    $('#movies-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'movies'); });
    $('#musics-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'musics'); });
    $('#sprites-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'sprites'); });
    $('#skins-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'skins'); });
    $('#sounds-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'sounds'); });
    
    $('#database-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'database'); });

    $('#code-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'code'); });

    $('#plugins-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'plugins'); });
    
    $('#settings-btn').on('click', function(event) { TCHE.eventOpenWindow(event, 'settings'); });
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
})();