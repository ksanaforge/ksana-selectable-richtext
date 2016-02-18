var React,Paragraph,DeferListView, reactNative=false;

try{
	React=require("react-native");
	reactNative=true;
	View=React.View;
	DeferListView=require("./deferlistview");
	Paragraph=require("./paragraph");
} catch(e) {
	React=require("react");
	DeferListView=require("./deferlistview_web");
	Paragraph=require("./paragraph_web");
	View="div";
}
var E=React.createElement;
var PT=React.PropTypes;
var rowY={};

var SelectableRichText=React.createClass({
	getInitialState:function(){
		var typedef=JSON.parse(JSON.stringify(this.props.typedef));
		if (!typedef.selection) {
			typedef.selection=styles.selected;
		}
		return {typedef:typedef};
	}
	,propTypes:{
		rows:PT.array.isRequired 
        ,selections:PT.object
        ,markups:PT.object
		,textStyle:PT.oneOfType([PT.object,PT.number])  //StyleSheet return number
		,typedef:PT.object
		,onHyperlink:PT.func
		,onFetchText:PT.func
		,onSelection:PT.func
	}
	,onNativeSelection:function(rowid,sel) {
		this.props.onSelection(rowid,sel);
	}
	,onTouchEnd:function(n,evt) {
		/*
		var touches=evt.nativeEvent.touches;
		var cTouches=evt.nativeEvent.changedTouches;
		if (cTouches.length===1 && touches.length===1){ //another finger is pressing
			this.setState({paraEnd:n});
		}
		*/
	}
	,onTouchStart:function(n,evt){
		if (!this.props.selections[n]) this.props.onSelection(n,[]); //select this paragraph if not selected
		else if (!this.props.selections[n].length) this.props.onSelection(n,null); //unselect this paragraph
	}
	,visibleChanged:function(start,end){
		if (this.state.paraStart>end || start>this.state.paraEnd) {
			this.cancelSelection();
		}
	}
	,fetchText:function(row,cb){
		if (this.props.rows[row].text) return false;
		this.props.onFetchText(row,cb);
	}
	,renderRow:function(rowdata,row){
		var text=rowdata.text,idx=parseInt(row);
		var ranges=this.props.selections[row];
		var params={para:idx, text:text 
				,onHyperlink:this.props.onHyperlink
				,ranges:ranges
				,onNativeSelection:this.onNativeSelection
				,typedef:this.state.typedef
				,markups:this.props.markups[row]
				,textStyle:this.props.textStyle
				,selectToken:this.selectToken
				,fetchText:this.fetchText}
		if (reactNative) {
			params.onTouchStart=this.onTouchStart.bind(this,idx);
			params.onTouchEnd=this.onTouchEnd.bind(this,idx);
		}
		
		return E(View, {style:this.props.style,key:idx}, E(Paragraph, params)
		);
	}
	,render:function(){
		var props={};
		for (var i in this.props)	props[i]=this.props[i];
		props.ref="listview";
		props.visibleChanged=this.visibleChanged;
		props.renderRow=this.renderRow;

		return E(DeferListView,props);
	}
});
var styles={
	selected:{backgroundColor:"rgb(96,176,255)"}
}
module.exports={SelectableRichText:SelectableRichText,DeferListView:DeferListView,Selections:require("./selections")};