/* handle onMouseUp event of paragraph, return a range*/
var getDOMNodeRange=function(rootele) {
    var sel=window.getSelection();
    if (!sel.baseNode) return;

    var off=getPos(rootele,sel.anchorNode,sel.anchorOffset);
    var off2=getPos(rootele,sel.focusNode,sel.focusOffset);

    var p1=sel.anchorNode.parentElement,p2=sel.focusNode.parentElement;
    if (p1.nodeName!="SPAN"||p2.nodeName!="SPAN") return;

    var start=off,len=off2-off;
    if (len<0) {
        start=off2;
        len=off-off2;
    }
  return {s:start,l:len, selection:sel};
}
var removeBlankInselection=function(sel,text) {
	if (text.trim()==="") return;
	var s=0,c=text.charCodeAt(0);
	while (c<0x21 || (c>=0xf0b && c<=0xf0e)) {
		sel.s++;
		sel.l--;
		text=text.substr(1);
		c=text.charCodeAt(0);
	}

	var e=e=text.length-1;
	c=text.charCodeAt(text.length-1);
	while (c<0x21 || (c>=0xf0b && c<=0xf0e)) {
		sel.l--;
		text=text.substr(0,text.length-1);
		c=text.charCodeAt(text.length-1);
	}
	return text;
}

var getPos=function(rootele,node,off){
    if (!node) return;
    while (node && node.parentElement!==rootele) node=node.parentElement;
    while (node && !node.dataset.start) node=node.nextSibling;
    if (!node) return -1;

    var pos=parseInt(node.dataset.start)+off;
    return pos;
}

var getSelection=function(opts) {
	var sel=getDOMNodeRange(opts.domnode);
	if (!sel || isNaN(sel.s))return;

	var text=opts.text.substr(sel.s,sel.l||1);
	if (text.charCodeAt(0)>=0xD800 ) { //surrogate
		text=opts.text.substr(sel.s,sel.l||2);
	}
	if (opts.removeBlank) text=removeBlankInselection(sel,text);
	if (!opts.noClear) sel.selection.empty();
	return sel;
}


module.exports={getSelection:getSelection};