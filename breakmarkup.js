/* break markup into renderable sections*/
/*

input : paragraph , markups (absolute position, start from this paragraph)
        selectable
        	if selectable, sections are break up into tokens

output: renderable tokens 
          renderable:
          	text
          	offset //offset in paragraph text
			markup //markup covering this token
*/

var buildInvertedMarkup=function(markups){
	var markupstart={},markupend={};
	for (var mid in markups) {
		var m=markups[mid];
		if (!markupstart[m.s]) markupstart[m.s]=[];
		markupstart[m.s].push(mid);
		if (!markupend[m.s+m.l]) markupend[m.s+m.l]=[];
		markupend[m.s+m.l].push(mid);
	}
	return {markupstart:markupstart,markupend:markupend};
}
var _break=function(text,ms,me){
	var M=new Set();
	var tokens=[], tokenOffsets=[], tokenMarkups=[], lasttext="", lastoffset=0;
	for (var i=0;i<text.length;i+=1) {

		if (i && (ms[i] || me[i])) { // markup changed
			tokens.push(lasttext);
			tokenOffsets.push(lastoffset);
			tokenMarkups.push(Array.from(M));
			lasttext="";
			lastoffset=i;
		}
		ms[i]&&	ms[i].map(function(m){M.add(m)});
		me[i]&&	me[i].map(function(m){M.delete(m)});
				
		lasttext+=text[i];
	}
	tokens.push(lasttext);
	tokenOffsets.push(lastoffset);
	tokenMarkups.push(Array.from(M));

	return {tokens:tokens,tokenOffsets:tokenOffsets,tokenMarkups:tokenMarkups};
}
var shredding=function(para,tokenizer){
	var tokens=[],tokenOffsets=[],tokenMarkups=[];
	for (var i=0;i<para.tokens.length;i+=1) {
		var t=para.tokens[i];
		var r=tokenizer(t);
		if (r.tokens[0]===t) {
			tokens.push(para.tokens[i]);
			tokenOffsets.push(para.tokenOffsets[i]);
			tokenMarkups.push(para.tokenMarkups[i]);
		} else {
			for(var j=0;j<r.tokens.length;j+=1) {
				tokens.push(r.tokens[j]);
				tokenOffsets.push(para.tokenOffsets[i]+r.tokenOffsets[j]);
				tokenMarkups.push(para.tokenMarkups[i]);
			}
		}
	}
	return {tokens:tokens,tokenOffsets:tokenOffsets,tokenMarkups:tokenMarkups};
}
var breakmarkup=function(tokenizer,text,markups,shred){
	if (!text) return {tokens:[],tokenMarkups:[],tokenOffsets:[]};
	if (!markups || Object.keys(markups).length==0) {
		return shred?tokenizer(text):{tokens:[text], tokenMarkups:[0],tokenOffsets:[]};
	} else {
		var r=buildInvertedMarkup(markups);
		var out= _break(text,r.markupstart,r.markupend);
		if (!shred)return out;
		return shredding(out,tokenizer);
	}
}
module.exports=breakmarkup;