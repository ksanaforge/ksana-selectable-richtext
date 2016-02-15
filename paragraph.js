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
var {getTokens,getTokenStyle,getTokenHandler}=require("./tokens");
/*
  TODO , 
  remove eventEmitter approach

  selection passed in by props, allow multiple selection.

  send token click event to parent component, 
  let parent component controls the selection (allow multiple selections)
*/
var breakmarkup=require("./breakmarkup");
var Paragraph=React.createClass({
	propTypes:{
		paraStart:PropTypes.number.isRequired,//starting paragraph id
		paraEnd:PropTypes.number.isRequired, //ending paragraph id
		para:PropTypes.number.isRequired,  //paragraph id
		trimSelection:PropTypes.func.isRequired,
		cancelSelection:PropTypes.func.isRequired,
		onMarkupClick:PropTypes.func,
		eventEmitter:PropTypes.object.isRequired,
		onSelectionChanged:PropTypes.func
	}
	,componentDidMount:function(){
		this.props.eventEmitter&&this.props.eventEmitter.addListener('adjustSelection', this.adjustSelection);
	}
	,adjustSelection:function(n){
		if (this.state.selStart===-1||this.state.selEnd===-1||n===0)return;
		//-1 move selStart to left for single token selection
		if (this.state.selStart===this.state.selEnd && this.state.selStart && n<0) {
			this.setState({selStart:this.state.selStart-1,selEnd:this.state.selEnd-1});
		} else if (this.state.selEnd+n<this.state.tokens.length && 
			this.state.selEnd+n>=this.state.selStart) { // resize selEnd
			this.setState({selEnd:this.state.selEnd+n});
		}
	}
	,getInitialState:function() {
		var res=getTokens.call(this);
		res.text=this.props.text;
		res.typedef=this.props.typedef;
		res.selStart=-1;
		res.selEnd=-1;
		return res;	}
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
			var res=breakmarkup(nextProps.tokenizer||tokenizer,nextProps.text,nextProps.markups,this.isParagraphSelected(nextProps))
			//var res=this.breakTextByMarkup(nextProps.text,nextProps.markups,this.isParagraphSelected(nextProps));
			nextState.tokens=res.tokens||[];
			nextState.tokenOffsets=res.tokenOffsets||[];
			nextState.tokenMarkup=res.tokenMarkups||[];
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
	,componentDidUpdate:function(prevProps,prevState) {
		if (prevState.selStart!==this.state.selStart || prevState.selEnd!==this.state.selEnd) {
			this.props.onSelectionChanged&&this.props.onSelectionChanged(this.state.selStart,this.state.selEnd,prevState.selStart,prevState.selEnd);
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

		return E(Text,{onLayout:this.onTokenLayout,onTouchStart:this.isParagraphSelected()?this.onTokenTouchStart.bind(this,idx):tokenHandler
			,style:this.isTokenSelected(idx)?
				[styles.selectedToken,this.props.selectedTextStyle].concat(tokenStyle):tokenStyle 
				,ref:idx,key:idx},token);
	}
	,render:function(){
		if (!this.isParagraphSelected()) {
			return E(View,{onTouchStart:this.onTouchStart},
				E(Text,{style:this.props.textStyle},this.state.tokens.map(this.renderToken)));
		}
		
		return E(View,{style:{flex:1}},
			E(Text,	{style:[styles.selectedParagraph,this.props.textStyle,this.props.selectedStyle]},
				this.state.tokens.map(this.renderToken)));
	}
});
var styles=StyleSheet.create({
	selectedParagraph:{backgroundColor:'rgb(212,232,255'},
	selectedToken:{backgroundColor:'rgb(96,176,255)'}

	//textShadowColor:'yellow',	textShadowRadius:6,textShadowOffset:{width:1,height:1}}
})
module.exports=Paragraph;
