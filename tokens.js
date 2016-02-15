
var tokenizer=require("./tokenizer").tokenizer;
var breakmarkup=require("./breakmarkup");


var tokenHandler=function(n,evt){
	this.hyperlink_clicked=true; //cancel bubbling to onTouchStart
	var M=this.state.tokenMarkups[n];
	this.props.onHyperlink&&this.props.onHyperlink(this.props.para,M);
	//TODO highlight hyperlink
}

var getTokenHandler=function(n) {
	var M=this.state.tokenMarkups[n];
	if (!M || !Object.keys(M).length)return null;
	var markups=this.props.markups;
	var out={},typedef=this.state.typedef;

	if (typedef[ markups[M[0]].type]) {
		return tokenHandler.bind(this,n);
	} 
	return null; //onTouchStart
}
var getTokenStyle=function(n) {
	var M=this.state.tokenMarkups[n];
	if (!M)return null;

	var markups=this.props.markups;
	var out={},typedef=this.state.typedef;
	M.forEach(function(m,idx){
		if (!markups[m])return;
		var type=markups[m].type;
		if (typedef[type] &&typedef[type].style ) {
			out=Object.assign(out,typedef[type].style);
		}
	});

	return out;
}

var getTokens=function(props,text){
		props=props||this.props;
		text=text||props.text;
		return breakmarkup(props.tokenizer||tokenizer,text,props.markups);
}


module.exports={getTokenStyle:getTokenStyle,
	tokenHandler:tokenHandler,
	getTokenHandler:getTokenHandler,getTokens:getTokens}