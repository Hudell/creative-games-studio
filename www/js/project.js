(function(){
  var fs = require('fs');
  var path = require('path');

  TCHE.saveNewProject = function(){
    var name = $('#new-project-name').val();
    if (!name || !name.trim()) {
      throw new Error("We know this is the hardest part, but you need a name for your project.");
    }

    var parentFolder = $('#new-project-parent-folder').val();
    if (!parentFolder || !parentFolder.trim()) {
      throw new Error("Select the folder where you want to save the project.");
    }

    var folder = $('#new-project-folder').val();
    if (!folder || !folder.trim()) {
      throw new Error("Select the folder name for the project.");
    }

    var fullFolder = path.join(parentFolder, folder);

    if (fs.existsSync(fullFolder)) {
      TCHE.confirm("The folder already exists. Any existing project files will be overwritten.", function(){
        TCHE.doSaveNewProject(name, fullFolder);
      });
    } else {
      TCHE.doSaveNewProject(name, fullFolder);
    }
  };

  TCHE.doSaveNewProject = function(name, fullFolder){
    TCHE.copyFolderSync('emptyGame', fullFolder);
    TCHE.openProject(fullFolder);

    TCHE.gameData.name = name;
    TCHE.saveProject();

    TCHE.changeGameTitle(name);
  };

  TCHE.selectNewProjectFolder = function(newFolder) {
    $('#new-project-parent-folder').val(newFolder);
  };

  TCHE.pickNewProjectFolder = function() {
    var dialog = $("<input type='file' nwdirectory>");

    dialog.on('change', function(){
      TCHE.selectNewProjectFolder(dialog.val());
    });

    dialog.click();
  };
})();