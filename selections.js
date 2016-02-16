/* click on space or unclickable token to select a paragraph
  select another paragraph, paragraph without selection will be unselect

  use different color for odd and even selection, to differentiate adjation selection.
  cross paragraph selection is break into multiple selection.

  selection:
     {
				rowid: []  //row is selectable, but no selection
				rowid: [  [start,len] , [start,len] ]
     }

  input:
  	web: 
 
  mode: single selection , multi selection

	store selection in context

*/

var Selection=function(initdata) {
  var selections=initdata||{};
  this.getAll=function(){
    return selections;
  }
  this.get=function(rowid) {
    return selections[rowid];
  }
  this.clearAll=function(){
    selections={};
  }

  this.clear=function(rowid) {
    selections=JSON.parse(JSON.stringify(selections));
    delete selections[rowid];
  }

}


module.exports=Selection;