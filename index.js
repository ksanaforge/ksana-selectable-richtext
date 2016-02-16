var React,Paragraph,ListView,View;

try{
	React=require("react-native");	
	ListView=require("./deferlistview");
	Paragraph=require("./paragraph");
	View=View;
} catch(e) {
	React=require("react");
	ListView=require("./deferlistview_web");
	Paragraph=require("./paragraph_web");
	View="div";
}
var E=React.createElement;
var rowY={};

var SelectableRichText=React.createClass({
	getInitialState:function(){
		var typedef=JSON.parse(JSON.stringify(this.props.typedef));
		if (!typedef.selection) {
			typedef.selection={backgroundColor:"highlight"};
		}
		return {typedef:typedef};
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
		/*
		var touches=evt.nativeEvent.touches;
		if (touches.length===1) {
			if (this.state.paraStart===-1) {
				this.setState({paraStart:n,paraEnd:n});
			} else if (!this.isSelected(n)){
				this.setState({paraStart:-1,paraEnd:-1});
			}
		}	
		*/
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
			return E(View, {style:this.props.style,key:idx},
				E(Paragraph, 
				{para:idx, text:text 
				,onTouchStart:this.onTouchStart.bind(this,idx)
				,onTouchEnd:this.onTouchEnd.bind(this,idx)
				,onHyperlink:this.props.onHyperlink
				,ranges:ranges
				,onNativeSelection:this.onNativeSelection
				,token:this.state.token
				,typedef:this.state.typedef
				,markups:this.props.markups[row]
				,selectedStyle:this.props.selectedStyle
				,textStyle:this.props.textStyle
				,selectedTextStyle:this.props.selectedTextStyle
				,selectToken:this.selectToken
				,fetchText:this.fetchText}
				)
			);
	}
	,render:function(){
		var props={};
		for (var i in this.props)	props[i]=this.props[i];
		props.ref="listview";
		props.visibleChanged=this.visibleChanged;
		props.renderRow=this.renderRow;

		return E(ListView,props);
	}
});

module.exports={SelectableRichText:SelectableRichText,DeferListView:ListView,Selections:require("./selections")};