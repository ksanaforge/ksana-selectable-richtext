/*
	Selectable paragraph, links are disabled
*/
var React=require("react-native");
var {
  View,Text,StyleSheet,
  PanResponder,PropTypes
} =React;
var E=React.createElement;
var {tokenizer,isTextToken}=require("./tokenizer");


var breakmarkup=require("./breakmarkup");
var Paragraph=React.createClass({
	propTypes:{
		paraStart:PropTypes.number.isRequired,//starting paragraph id
		paraEnd:PropTypes.number.isRequired, //ending paragraph id
		para:PropTypes.number.isRequired,  //paragraph id
		trimSelection:PropTypes.func.isRequired,
		cancelSelection:PropTypes.func.isRequired
	}
	,getInitialState:function() {
		var res={tokens:[]};
		if (this.props.text) {
				var res=this.breakTextByMarkup(this.props.text,this.props.markups,this.isParagraphSelected());	
		}

		return {tokens:res.tokens,tokenOffsets:res.offsets,tokenMarkup:res.markups,selStart:-1,selEnd:-1,typedef:this.props.typedef||{}};
	}
	,breakTextByMarkup:function(text,markups,selectable) {
		var tknz=this.props.tokenizer||tokenizer;
		return breakmarkup(tknz,text,markups,selectable);
	}
	,selectToken:function(idx){
		this.props.selectToken(idx);
	}
	,shouldComponentUpdate:function(nextProps,nextState){

		var selectedChanged=this.isParagraphSelected(nextProps) !== this.isParagraphSelected(this.props);
		if (selectedChanged && this.isParagraphSelected(nextProps)) {
			nextState.selStart=-1;
			nextState.selEnd=-1;//clear token Selection when select again
		}
		var contentChanged=nextProps.markups!==this.props.markups || nextProps.text!==this.props.text;
		if (selectedChanged||this.isParagraphSelected(nextProps) || contentChanged) {
			var res=this.breakTextByMarkup(nextProps.text,nextProps.markups,this.isParagraphSelected(nextProps));
			nextState.tokens=res.tokens||[];
			nextState.tokenOffsets=res.offsets||[];
			nextState.tokenMarkup=res.markups||[];
		}		

		return contentChanged||selectedChanged||this.isParagraphSelected(nextProps) || nextState.selStart!==this.state.selStart||nextState.selEnd!==this.state.selEnd;
	}
	,selectSentence:function(n){
		var start=n,end=n;
		while (start>-2) {
			if (isTextToken(this.state.tokens[start-1])) start--;
			else break;
		}

		while (end<this.state.tokens.length) {
			if (isTextToken(this.state.tokens[end+1])) end++;
			else break;
		}

		this.setState({selStart:start,selEnd:end});
	}
	,onTokenTouchStart:function(n,evt){
		if (evt.nativeEvent.touches.length==1){
			if (n===this.state.selStart && n==this.state.selEnd) {
				this.selectSentence(n);
				return;
			}
			this.setState({selStart:n,selEnd:n});
			this.props.trimSelection(this.props.para,true);
		} else {
			this.setState({selEnd:n});
			if (this.state.selStart===-1) this.setState({selStart:n});
			this.props.trimSelection(this.props.para);
		}
		
	}
	,isParagraphSelected:function(props){
		props=props||this.props;
		var para=this.props.para;
		if (props.paraStart<0||props.paraEnd<0)return false;
		if (para>=props.paraStart && para<=props.paraEnd)return true;
		return false;
	}
	,isTokenSelected:function(n,props){
		props=props||this.props;
		var para=this.props.para;
		if (props.paraStart<0||props.paraEnd<0)return false;//no selected paragraph
		if (para<props.paraStart || para>props.paraEnd)return false;//out of range
		if (para>props.paraStart && para<props.paraEnd)return true;//within range

		var start=this.state.selStart;
		var end=this.state.selEnd;
		if (end<start && end>-1) {
			var t=end;
			end=start;
			start=t;
		}

		if (para===props.paraEnd && para!==props.paraStart) {
			start=0;
		}
		if (para===props.paraStart && para!==props.paraEnd) {
			end=this.state.tokens.length;
		}

		return (n>=start)&&(n<=end);
	}
	,getTokenStyle:function(n) {
		var M=this.state.tokenMarkup[n];
		var markups=this.props.markups;
		if (!M)return null;

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
	,renderToken:function(token,idx){
		var tokenStyle=this.getTokenStyle(idx);
		
		return E(Text,{onTouchStart:this.onTokenTouchStart.bind(this,idx)
			,style:this.isTokenSelected(idx)?
				[styles.selectedToken,this.props.selectedTextStyle].concat(tokenStyle):tokenStyle 
				,ref:idx,key:idx},token);
	}
	,render:function(){
		if (!this.isParagraphSelected()) {
			return E(View,null,
				E(Text,{onTouchStart:this.props.onTouchStart,style:this.props.textStyle},this.state.tokens.map(this.renderToken)));
		}
		
//{...this._panResponder.panHandlers}
		return E(View,{style:{flex:1}},
			E(Text,
				{style:[styles.selectedParagraph,this.props.textStyle,this.props.selectedStyle]},
				this.state.tokens.map(this.renderToken)));
	}
});
var styles=StyleSheet.create({
	selectedParagraph:{backgroundColor:'rgb(212,232,255'},
	selectedToken:{backgroundColor:'rgb(96,176,255)'}

	//textShadowColor:'yellow',	textShadowRadius:6,textShadowOffset:{width:1,height:1}}
})
module.exports=Paragraph;
