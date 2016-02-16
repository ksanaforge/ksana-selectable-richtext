var React=require("react");
var ReactDOM=require("react-dom");
var E=React.createElement;

var isTextToken=require("./tokenizer").isTextToken;
var getTokens=require("./tokens").getTokens;
var getTokenStyle=require("./tokens").getTokenStyle;
var getTokenHandler=require("./tokens").getTokenHandler;
var selection=require("./selection_web");

var Paragraph=React.createClass({
	getInitialState:function(){
		var res=getTokens.call(this);
		res.text=this.props.text;
		res.typedef=this.props.typedef;
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
		var changed=( nextProps.text!==nextState.text
			||nextProps.markups!==this.props.markups||nextProps.ranges!==this.props.ranges);

		if (changed && nextProps.text) {
			var res=getTokens.call(this,nextProps);
			res.text=nextProps.text;
			for (var i in res) {
				nextState[i]=res[i];
			}
		}
		return changed;
	}
	,onTouchStart:function(e){
		console.log('touchstart',e)
	}
	,renderToken:function(token,idx){
		var tokenStyle=getTokenStyle.call(this,idx);
		var tokenHandler=getTokenHandler.call(this,idx);
		
		return E("span",{"data-start":this.state.tokenOffsets[idx]||0
			,style:tokenStyle,ref:idx,key:idx},token);
	}
	,onMouseUp:function(e) {
		if (e.target.nodeName!="SPAN") return;
		if (e.button!==0)return;
		var sel=selection.getSelection( {domnode:ReactDOM.findDOMNode(this), text:this.state.text});
		this.props.onNativeSelection&&this.props.onNativeSelection(this.props.para,[sel.s,sel.l]);
	}
	,isSelected:function(){
		return (this.props.ranges &&this.props.ranges.length);
	}
	,render:function(){
		var style=null;
		if (this.isSelected()) style=styles.selectedParagraph;
		return E("span",{key:"0",style:style,onMouseUp:this.onMouseUp}
			,this.state.tokens.map(this.renderToken));
	}
});

var styles={
	selectedParagraph:{backgroundColor:'rgb(242,248,255)'},
	selectedToken:{backgroundColor:'rgb(96,176,255)'}
};

module.exports=Paragraph;