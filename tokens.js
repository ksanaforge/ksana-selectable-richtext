
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
	if (!markups) return null; //range

	var out={},typedef=this.state.typedef;
	var mid=markups[M[0]];
	if (mid && typedef[mid.type]) {
		return tokenHandler.bind(this,n);
	} 
	return null; //onTouchStart
}
var getTokenStyle=function(n) {
	var M=this.state.tokenMarkups[n];
	if (!M)return null;

	var out={},typedef=this.state.typedef;
	var markups=this.props.markups;
	if (!markups) { //is ranges
		return (M&&M.length)?typedef.selection:null;
	}

	M.forEach(function(m,idx){
		if (!markups[m])return out=Object.assign(out,typedef.selection);
		var type=markups[m].type;
		if (typedef[type] &&typedef[type].style ) {
			out=Object.assign(out,typedef[type].style);
		}
	});

	return out;
}

var getTokens=function(props,text,shredd){
	props=props||this.props;
	text=text||props.text;
	var markers={};
	for(var i in props.markups) {
		markers[i]=props.markups[i];
	}
	if (props.ranges) for (var j=0;j<props.ranges.length;j++) {
		markers[String.fromCharCode(1)+j]={s:props.ranges[j][0],l:props.ranges[j][1],type:"selection"};
	}
	return breakmarkup(props.tokenizer||tokenizer,text,markers,shredd);
}


module.exports={getTokenStyle:getTokenStyle,
	tokenHandler:tokenHandler,
	getTokenHandler:getTokenHandler,getTokens:getTokens}