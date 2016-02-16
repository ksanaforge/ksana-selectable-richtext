/*
  Selections logic
  
  click on space or unclickable token to select a paragraph
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

var Selections=function(opts) {
  opts=opts||{};
  var selections=opts.data||{};
  var getAll=function(){
    return selections;
  }
  var get=function(rowid) {
    return selections[rowid];
  }
  var clearAll=function(){
    selections={};
  }

  clear=function(rowid) {
    delete selections[rowid];
  }
  var set=function(rowid,sel) {
    if (sel[1]==0) return false;
    selections[rowid]=[JSON.parse(JSON.stringify(sel))];
    return true;
  }

  return {getAll:getAll,clear:clear,get:get,set:set};
}



module.exports=Selections;