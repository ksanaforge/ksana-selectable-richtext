/*
	Selectable paragraph, links are disabled
*/
var React=require("react-native");
var {
  View,Text,StyleSheet,
  PanResponder,PropTypes
} =React;

var {tokenizer,isTextToken}=require("./tokenizer");

var Paragraph=React.createClass({
	propTypes:{
		paraStart:PropTypes.number.isRequired,//starting paragraph id
		paraEnd:PropTypes.number.isRequired, //ending paragraph id
		para:PropTypes.number.isRequired,  //paragraph id
		trimSelection:PropTypes.func.isRequired,
		cancelSelection:PropTypes.func.isRequired
	}
	,getInitialState:function() {
		var res=(this.props.tokenizer||tokenizer)(this.props.text);
		return {tokens:res.tokens,tokenOffsets:res.offsets,selStart:-1,selEnd:-1};
	}
	,selectToken:function(idx){
		this.props.selectToken(idx);
	}
	,shouldComponentUpdate:function(nextProps,nextState){
		if (nextProps.text!==this.props.text) {
			var res=(this.props.tokenizer||tokenizer)(nextProps.text);
			nextState.tokens=res.tokens;
			nextState.tokenOffsets=res.offsets;
			return true;
		}
		var selectedChanged=this.isParagraphSelected(nextProps) !== this.isParagraphSelected(this.props);
		if (selectedChanged && this.isParagraphSelected(nextProps)) {
			nextState.selStart=-1;
			nextState.selEnd=-1;//clear token Selection when select again
		}
		return selectedChanged||this.isParagraphSelected(nextProps) || nextState.selStart!==this.state.selStart||nextState.selEnd!==this.state.selEnd;
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
	,renderToken:function(token,idx){
		return <Text onTouchStart={this.onTokenTouchStart.bind(this,idx)}
		style={this.isTokenSelected(idx)?[styles.selectedToken,this.props.selectedTextStyle]:null} 
		ref={idx} key={idx}>{token}</Text>
	}
	,render:function(){
		if (!this.isParagraphSelected()) {
			return <View>
			<Text style={this.props.textStyle}>{this.props.text}</Text></View>;
		}
		
//{...this._panResponder.panHandlers}
		return <View style={{flex:1}}>
		<Text style={[styles.selectedParagraph,this.props.textStyle,this.props.selectedStyle]}>
		{this.state.tokens.map(this.renderToken)}</Text></View>
	}
});
var styles=StyleSheet.create({
	selectedParagraph:{backgroundColor:'rgb(212,232,255'},
	selectedToken:{backgroundColor:'rgb(96,176,255)'}

	//textShadowColor:'yellow',	textShadowRadius:6,textShadowOffset:{width:1,height:1}}
})
module.exports=Paragraph;
