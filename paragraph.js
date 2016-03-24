//"use strict";
var React=require("react-native");
var {View,Text,StyleSheet,PropTypes,TouchableHighlight,TouchableOpacity} = React;
var E=React.createElement;

var {getTokenStyle,getTokenHandler,propTypes,repaint}=require("./tokens");

var Paragraph=React.createClass({
	mixins:[require("./paragraph_mixin")]
	,contextTypes:{
		getter:React.PropTypes.func
	}
	,tokenRect:[]
	,getTokenFromXY:function(x,y){
		for (var i=0;i<this.tokenRect.length;i+=1) {
			var t=this.tokenRect[i];
			if (t && x>t[0]&&y>t[1]&&x<t[2]&&y<t[3]) return i;
		}
		return -1;
	}
	,onTokenTouchStart:function(evt){
		var ne=evt.nativeEvent;
		if (ne.touches.length!==1) {
			this.start=-1;
			return;
		}
		this.touchX=ne.pageX;
		this.touchY=ne.pageY;
		var x=evt.nativeEvent.pageX-this.px,y=evt.nativeEvent.pageY-this.py;
		var n=this.getTokenFromXY(x,y);
		if (n===-1) return;

		var start=this.state.tokenOffsets[n];
		this.start=n;

		if (!start)return;
		var len=1;
		this.props.onNativeSelection&&this.props.onNativeSelection(this.props.para,[start,len]);
	}
	,onTokenTouchEnd:function(evt){
		if (this.start!==-1) {
			this.props.onTokenTouched&&this.props.onTokenTouched(this.touchX,this.touchY);
		} else {
			this.props.unselectParagraph();
		}
		this.start=-1;
		this.end=-1;
	}
	,onTokenTouchMove:function(evt){
		if (this.start==-1)return;
		var x=evt.nativeEvent.pageX-this.px,y=evt.nativeEvent.pageY-this.py;

		var n=this.getTokenFromXY(x,y);
		if (n==-1)return;

		var end=this.state.tokenOffsets[n];
		if (this.start>-1 && end>this.start && this.end!==end) {
			this.end=end;
			this.props.onNativeSelection&&
			this.props.onNativeSelection(this.props.para,[this.start,end-this.start]);
		}
	}

	,onTouchStart:function(){
		this.props.onTouchStart.apply(this,arguments);
	}
	,viewpress:function(){
		console.log('viewpress')
	}

	,onLayout:function(idx,evt){
		var L=evt.nativeEvent.layout;
		this.tokenRect[idx]=[L.x,L.y,L.x+L.width,L.y+L.height];
	}

	,renderToken:function(token,idx){
		var tokenStyle=getTokenStyle.call(this,idx);

		var tokenHandler=getTokenHandler.call(this,idx);
		var renderText=function(text,selectable){
			if (selectable) {
				var crlf=null;
				var w=this.context.getter("dimension").screenWidth;
				if (text=="\n") {
					return E(View,{key:idx,onTouchStart:this.viewpress,height:0,width:w,backgroundColor:'blue'});text="";
				}
				return E(View,{onLayout:this.onLayout.bind(this,idx),key:idx},E(Text,{
								//,onTouchStart:this.onTokenTouchStart.bind(this,idx)
								//	,onTouchEnd:this.onTokenTouchEnd.bind(this,idx)
							//		,onTouchMove:this.onTouchMove.bind(this,idx)
									style:[this.props.textStyle,tokenStyle],ref:idx},text));
			} else {
				return E(Text,{onPress:tokenHandler,style:tokenStyle,ref:idx,key:idx},text);
			}
			
		}	

		var hascrlf=token.match(/(.*?)\n+?/);
		if (!hascrlf||this.props.selectable) {
			return renderText.call(this,token,this.props.selectable);
		} else {
			var t=hascrlf[1]; //do not apply onPress to crlf, to limit the tappable area in text only 
			return [renderText.call(this,t,this.props.selectable),E(Text,{style:tokenStyle,key:idx+'_crlf'},token.substr(t.length))];
		}
			
	}
	,onLayoutContainer:function(){
		this.refs.container.measure(function(fx,fy,w,h,px,py){
			this.px=px;this.py=py;
		}.bind(this))
	}
	,render:function(){
		repaint();
		if (!this.props.selectable) {
			this.tokenRect=[];
			return E(View,{onTouchStart:this.onTouchStart,onTouchEnd:this.props.onTouchEnd},
				E(Text,{style:this.props.textStyle},this.state.tokens.map(this.renderToken)));
		}
		
		return 	E(View,	{onLayout:this.onLayoutContainer,onTouchStart:this.onTokenTouchStart,
			onTouchMove:this.onTokenTouchMove,
			onTouchEnd:this.onTokenTouchEnd,
			ref:"container",
			style:[styles.selectedStyle,this.props.selectedStyle,
				{flexDirection:'row',flexWrap:"wrap"}]},
				this.state.tokens.map(this.renderToken));
	}
});
var styles=StyleSheet.create({
	selectedStyle:{backgroundColor:'rgb(222,242,255)'},
	selectedTokenEvent:{backgroundColor:'rgb(255,176,96)'}
})
module.exports=Paragraph;
