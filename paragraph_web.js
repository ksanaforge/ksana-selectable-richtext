var React=require("react");
var reactdom="react-dom"; //to cheat react native packager
var ReactDOM=require(reactdom);
var E=React.createElement;

var getTokenStyle=require("./tokens").getTokenStyle;
var getTokenHandler=require("./tokens").getTokenHandler;
var selection=require("./selection_web");
var mixin=require("./paragraph_mixin");

var Paragraph=React.createClass({
	mixins:[mixin]
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
	,render:function(){
		var style=null;
		if (this.isSelected()) style=styles.selectedParagraph;
		return E("span",{key:"0",style:style,onMouseUp:this.onMouseUp}
			,this.state.tokens.map(this.renderToken));
	}
});

var styles={
	selectedParagraph:{backgroundColor:'rgb(242,248,255)'}
};

module.exports=Paragraph;