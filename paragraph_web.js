var React=require("react");
var E=React.createElement;

var isTextToken=require("./tokenizer").isTextToken;
var getTokens=require("./tokens").getTokens;
var getTokenStyle=require("./tokens").getTokenStyle;
var getTokenHandler=require("./tokens").getTokenHandler;


var Paragraph=React.createClass({
	getInitialState:function(){
		var res=getTokens.call(this);
		res.text=this.props.text;
		res.typedef=this.props.typedef;
		res.selStart=-1;
		res.selEnd=-1;
		return res;
	}
	,componentDidMount:function(){
		this.props.fetchText(this.props.para,function(err,text,row){
			var res=getTokens.call(this,this.props,text);
			res.text=text;
			this.setState(res);
		}.bind(this));
	}
	,shouldComponentUpdate:function(nextProps,nextState){
		if (nextProps.text===this.props.text && nextProps.text===nextState.text)return false;
		return true;
	}
	,onTouchStart:function(e){
		console.log('touchstart',e)
	}
	,renderToken:function(token,idx){
		var tokenStyle=getTokenStyle.call(this,idx);
		var tokenHandler=getTokenHandler.call(this,idx);
		
		return E("span",{style:tokenStyle,ref:idx,key:idx},token);
	}
	,render:function(){
		return E("span",{key:1,onTouchStart:this.onTouchStart}
			,this.state.tokens.map(this.renderToken));
	}
});

var styles={
	selectedParagraph:{backgroundColor:'rgb(212,232,255'},
	selectedToken:{backgroundColor:'rgb(96,176,255)'}
};

module.exports=Paragraph;