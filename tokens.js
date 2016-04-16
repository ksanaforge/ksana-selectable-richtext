
var tokenizer=require("./tokenizer").tokenizer;
var decorator=require("./decorator");
var ACTIVESELTYPE=String.fromCharCode(1)+"sel";

var tokenHandler=function(n){
	var m=this.state.tokenMarkups[n];
	this.props.onHyperlink&&this.props.onHyperlink(m,this.props.para);
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
var selcount=0,lastM;
var repaint=function(){
	selcount=0,lastM="";
}
var getTokenStyle=function(n) {
	var M=this.state.tokenMarkups[n],type;
	if (!M)return null;
	var out={},typedef=this.state.typedef;

	var applySelectingStyle=function(){
		if (this.props.selectable && n>=this.props.selStart && n<this.props.selStart+this.props.selLength) {
			out=Object.assign(out,styles.selecting);
		}
	}
	var markups=this.props.markups;
	if (!markups) { //is ranges
		if (M&&M.length && M[0]!==ACTIVESELTYPE) {
			if (M[0]!==lastM) selcount++;

			type=(selcount%2)?"selection":"selection_odd"; 
			
			lastM=M[0];
			out=Object.assign(out,typedef[type]);
			applySelectingStyle.call(this);
			return out;
		}
		applySelectingStyle.call(this);
		return out;
	}

	M.forEach(function(m,idx){
		if (!markups[m] && M[0]!==ACTIVESELTYPE) {
			if (M[0]!==lastM) selcount++;
			type=(selcount%2 )?"selection":"selection_odd";
			lastM=M[0];
			out=Object.assign(out,typedef[type]);
		} else {
			if (markups[m]) {
				type=markups[m].type;
				if (typedef[type] &&typedef[type].style ) {
					out=Object.assign(out,typedef[type].style);
				}
			}
		}
	});

	applySelectingStyle.call(this);

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
	if (props.selectable && props.selStart>-1 && props.selLength) {
		markers[ACTIVESELTYPE]={s:props.selStart,l:props.selLength,type:"selecting"};
	}
	return decorator(props.tokenizer||tokenizer,text,markers,shredd);
}

var styles={
	selecting:{backgroundColor:"rgb(255,176,176)"}
}
module.exports={getTokenStyle:getTokenStyle,
	tokenHandler:tokenHandler,repaint:repaint,
	getTokenHandler:getTokenHandler,getTokens:getTokens}