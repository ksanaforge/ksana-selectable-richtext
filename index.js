var React=require("react-native");
var {
  View,Text,StyleSheet,PropTypes
} =React;
var rowY={};
var DeferListView=require("./deferlistview");
var Paragraph=require("./paragraph");
var SelectableRichText=React.createClass({
	getInitialState:function(){
		return {paraStart:-1,paraEnd:-1,token:null};
	}
	,onTouchEnd:function(n,evt) {
		var touches=evt.nativeEvent.touches;
		var cTouches=evt.nativeEvent.changedTouches;
		if (cTouches.length===1 && touches.length===1){ //another finger is pressing
			this.setState({paraEnd:n});
		}
	}
	,onTouchStart:function(n,evt){
		var touches=evt.nativeEvent.touches;
		if (touches.length===1) {
			if (this.state.paraStart===-1) {
				this.setState({paraStart:n,paraEnd:n});
			} else if (!this.isSelected(n)){
				this.setState({paraStart:-1,paraEnd:-1});
			}
		}	
	}
	,isSelected:function(n){
		var start=this.state.paraStart;
		var end=this.state.paraEnd;
		if (end<start &&end>-1) {
			var t=end;
			end=start;
			start=t;
		}
		return (n>=start)&&(n<=end);
	}
	,cancelSelection:function(){
		this.setState({paraStart:-1,paraEnd:-1});
	}
	,trimSelection:function(para,start) {
		if (start) {
			this.setState({paraStart:para});
		} else {
			this.setState({paraEnd:para});
		}
	}
	,renderRow:function(rowdata,row){
		var text=rowdata.text||"",idx=parseInt(row);
			return <View style={this.props.style}
			onTouchStart={this.onTouchStart.bind(this,idx)}
			onTouchEnd={this.onTouchEnd.bind(this,idx)}>

			<Paragraph 
				key={idx} para={idx} text={text} 
				token={this.state.token} 
				selectedStyle={this.props.selectedStyle}
				textStyle={this.props.textStyle}
				selectedTextStyle={this.props.selectedTextStyle}
				selectToken={this.selectToken} 
				paraStart={this.state.paraStart} 
				paraEnd={this.state.paraEnd}
				trimSelection={this.trimSelection}
				cancelSelection={this.cancelSelection}/>
			</View>
		
	}
	,render:function(){
		return <DeferListView {...this.props} renderRow={this.renderRow} />
	}
});





module.exports={SelectableRichText,DeferListView};