var React=require("react-native");
var {
  View,Text,StyleSheet,PropTypes
} =React;
var rowY={};
var DeferListView=require("./deferlistview");

var SelectableRichText=React.createClass({
	renderRow:function(rowData,row){
		return <Text>{rowData.text}</Text>
	}
	,render:function(){
		return <DeferListView {...this.props} renderRow={this.renderRow} />
	}
});




module.exports={SelectableRichText,DeferListView};