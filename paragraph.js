var React=require("react-native");
var {View,Text,StyleSheet,PropTypes} = React;
var E=React.createElement;

var {getTokenStyle,getTokenHandler,propTypes}=require("./tokens");

var Paragraph=React.createClass({
	mixins:[require("./paragraph_mixin")]
	,onTokenTouchStart:function(n,evt){
		var start=this.state.tokenOffsets[n];
		if (!start)return;
		var len=1;
		this.props.onNativeSelection&&this.props.onNativeSelection(this.props.para,[start,len]);
	}
	,onTokenTouchEnd:function(n,evt){

	}
	,onTouchStart:function(){

		if (this.hyperlink_clicked) {
			this.hyperlink_clicked=false;
		} else {
			this.props.onTouchStart.apply(this,arguments);
		}
	}
	,renderToken:function(token,idx){
		var tokenStyle=getTokenStyle.call(this,idx);
		var tokenHandler=getTokenHandler.call(this,idx);

		return E(Text,{onTouchStart:this.isSelected()?this.onTokenTouchStart.bind(this,idx):tokenHandler
			,onTouchEnd:this.isSelected()?this.onTokenTouchEnd.bind(this,idx):null
			,style:tokenStyle,ref:idx,key:idx},token);
	}
	,render:function(){

		if (!this.isSelected()) {
			return E(View,{onTouchStart:this.onTouchStart},
				E(Text,{style:this.props.textStyle},this.state.tokens.map(this.renderToken)));
		}
		
		return E(View,{style:{flex:1}},
			E(Text,	{style:[styles.selectedParagraph,this.props.textStyle,this.props.selectedStyle]},
				this.state.tokens.map(this.renderToken)));
	}
});
var styles=StyleSheet.create({
	selectedParagraph:{backgroundColor:'rgb(212,232,255)'},
	selectedToken:{backgroundColor:'rgb(96,176,255)'}
})
module.exports=Paragraph;
