(function(){
  var fs = require('fs');
  var path = require('path');

  STUDIO.saveNewProject = function(){
    var name = $('#new-project-name').val();
    if (!name || !name.trim()) {
      throw new Error(t("We know this is the hardest part, but you need a name for your project."));
    }

    var parentFolder = $('#new-project-parent-folder').val();
    if (!parentFolder || !parentFolder.trim()) {
      throw new Error(t("Select the folder where you want to save the project."));
    }

    var folder = $('#new-project-folder').val();
    if (!folder || !folder.trim()) {
      throw new Error(t("Select the folder name for the project."));
    }

    var fullFolder = path.join(parentFolder, folder);

    if (fs.existsSync(fullFolder)) {
      STUDIO.confirm(t("The folder already exists. Any existing project files will be overwritten."), function(){
        STUDIO.doSaveNewProject(name, fullFolder);
      });
    } else {
      STUDIO.doSaveNewProject(name, fullFolder);
    }
  };

  STUDIO.doSaveNewProject = function(name, fullFolder){
    STUDIO.copyFolderSync('emptyGame', fullFolder);
    STUDIO.openProject(fullFolder);

    STUDIO.gameData.name = name;
    STUDIO.saveProject();

    STUDIO.changeGameTitle(name);
  };

  STUDIO.selectNewProjectFolder = function(newFolder) {
    $('#new-project-parent-folder').val(newFolder);
  };

  STUDIO.pickNewProjectFolder = function() {
    var dialog = $("<input type='file' nwdirectory>");

    dialog.on('change', function(){
      STUDIO.selectNewProjectFolder(dialog.val());
    });

    dialog.click();
  };
})();