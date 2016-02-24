var React=require("react-native");
var {View,Text,StyleSheet,PropTypes,TouchableHighlight} = React;
var E=React.createElement;

var {getTokenStyle,getTokenHandler,propTypes,repaint}=require("./tokens");

var Paragraph=React.createClass({
	mixins:[require("./paragraph_mixin")]
	,onTokenTouchStart:function(n,evt){
		var start=this.state.tokenOffsets[n];
		if (!start)return;
		var len=1;
		this.props.onNativeSelection&&this.props.onNativeSelection(this.props.para,[start,len]);
	}
	,onTokenTouchEnd:function(n,evt){
		this.props.onTokenTouched&&this.props.onTokenTouched(n,evt);
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
		
		return E(Text,{onTouchStart:this.props.selectable?this.onTokenTouchStart.bind(this,idx):tokenHandler
		,onTouchEnd:this.props.selectable?this.onTokenTouchEnd.bind(this,idx):null
		,style:tokenStyle,ref:idx,key:idx},token);
	}
	,render:function(){
		repaint();
		if (!this.props.selectable) {
			return E(View,{onTouchStart:this.onTouchStart,onTouchEnd:this.props.onTouchEnd},
				E(Text,{style:this.props.textStyle},this.state.tokens.map(this.renderToken)));
		}
		
		return E(View,{style:{flex:1}},
			E(Text,	{style:[styles.selectedStyle,this.props.textStyle,this.props.selectedStyle]},
				this.state.tokens.map(this.renderToken)));
	}
});
var styles=StyleSheet.create({
	selectedStyle:{backgroundColor:'rgb(148,212,255)'},
	selectedTokenEvent:{backgroundColor:'rgb(255,176,96)'}
})
module.exports=Paragraph;
