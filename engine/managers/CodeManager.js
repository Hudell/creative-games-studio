(function(){
  function CodeManager() {

  }

  CodeManager.executeEvent = function(event) {
    CodeManager.runCodeBlock(event.codeLines);
  };

  CodeManager.runCodeBlock = function(codeBlock) {
    var interpreter = new TCHE.CodeInterpreter();
    return interpreter.runCodeBlock(codeBlock);
  };

  TCHE.registerStaticClass('CodeManager', CodeManager);
})();