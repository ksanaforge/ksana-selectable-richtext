var React=require("react-native");
var {View,Text,StyleSheet,PropTypes,TouchableHighlight,TouchableOpacity} = React;
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
	,hideMarkup:function(){
		if (this.props.markups){
			for (var m in this.props.markups) {
				var mrk=this.props.markups[m];
				if (mrk && mrk.ttl) {
					this.hidetimer=setTimeout(function(){
						//delete this.props.markups[m];
						mrk.type="";
						mrk.ttl=0;
						this.forceUpdate();
					}.bind(this),mrk.ttl);
				}
			}
		}
	}
	,componentWillUnmount:function(){
		this.hidetimer&&clearTimeout(this.hidetimer); //prevent forceUpdate for unmounted (user click back within ttl)
	}
	,componentDidMount:function(){
		this.hideMarkup();
	}
	,onTouchStart:function(){
		this.props.onTouchStart.apply(this,arguments);
	}

	,renderToken:function(token,idx){
		var tokenStyle=getTokenStyle.call(this,idx);
		var tokenHandler=getTokenHandler.call(this,idx);
		var renderText=function(text){
			return E(Text,{onPress:tokenHandler,style:tokenStyle,ref:idx,key:idx},text);
		}	
		if (this.props.selectable) {
			return E(Text,{onTouchStart:this.onTokenTouchStart.bind(this,idx)
					,onTouchEnd:this.onTokenTouchEnd.bind(this,idx)
					,style:tokenStyle,ref:idx,key:idx},token);
		} else {
			var hascrlf=token.match(/(.*?)\n+?/);
			if (!hascrlf) {
				return renderText(token);
			} else {
				var t=hascrlf[1]; //do not apply onPress to crlf, to limit the tappable area in text only 
				return [renderText(t),E(Text,{style:tokenStyle,key:idx+'_crlf'},token.substr(t.length))];
			}
			
		}
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
	selectedStyle:{backgroundColor:'rgb(222,242,255)'},
	selectedTokenEvent:{backgroundColor:'rgb(255,176,96)'}
})
module.exports=Paragraph;
