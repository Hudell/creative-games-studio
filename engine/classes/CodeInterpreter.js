(function(){
  function CodeInterpreter() {
    this._codeBlock = null;
    this._index = 0;
  }

  TCHE.reader(CodeInterpreter.prototype, 'codeBlock');
  TCHE.reader(CodeInterpreter.prototype, 'index');

  CodeInterpreter.prototype.getCurrentLine = function(){
    return this._codeBlock[this._index];
  };

  TCHE.reader(CodeInterpreter.prototype, 'currentLine', CodeInterpreter.prototype.getCurrentLine);

  CodeInterpreter.prototype.getNextLine = function(){
    return this._codeBlock[this._index + 1];
  };

  TCHE.reader(CodeInterpreter.prototype, 'nextLine', CodeInterpreter.prototype.getNextLine);

  CodeInterpreter.prototype.runCodeBlock = function(codeBlock) {
    this._codeBlock = codeBlock;
    this._index = 0;

    while (this._index < this._codeBlock.length) {
      this.executeLine();

      this._index++;
    }
  }

  CodeInterpreter.prototype.executeLine = function() {
    var line = this.currentLine;

    switch(line.code) {
      case 'exit' :
        this._index = this._codeBlock.length;
        break;
      case 'teleport' : 
        TCHE.globals.player.teleport(line.params.mapName, line.params.x, line.params.y);
        break;
    }
  }

  TCHE.CodeInterpreter = CodeInterpreter;
})();