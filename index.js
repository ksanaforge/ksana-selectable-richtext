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
			typedef.selection=styles.selection;
		}
		if (!typedef.selection_odd) {
			typedef.selection_odd=styles.selection_odd;
		}
		return {typedef:typedef,popupX:0,popupY:0,showpopup:false,selStart:-1,selLength:0};
	}
	,hidePopup:function(){
		this.setState({showpopup:false});
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
		,popup:PT.element
	}
	,onNativeSelection:function(rowid,sel) {
		this.props.onSetTextRange(rowid,sel);
	}
	,onTokenTouched:function(n,evt) {
		var ne=evt.nativeEvent;
		this.setState({selStart:n,selLength:1,popupX:ne.pageX,popupY:ne.pageY-22,showpopup:true});
	}
	,onTouchEnd:function(n,evt) {
		/*
		var touches=evt.nativeEvent.touches;
		var cTouches=evt.nativeEvent.changedTouches;
		if (cTouches.length===1 && touches.length===1){ //another finger is pressing
			this.setState({paraEnd:n});
		}
		*/
		var showpopup=this.state.showpopup;
		var selStart=this.state.selStart;
		var selLength=this.state.selLength;
		if (this.state.selectingParagraph!==n) {
			showpopup=false;
			selStart=-1;
			selLength=-1;
		}
		this.setState({selectingParagraph:n,showpopup,selStart,selLength});
	}
	,onTouchStart:function(n,evt){
		
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
				,selectable:this.state.selectingParagraph===idx
				,selStart:this.state.selStart
				,selLength:this.state.selLength
				,onNativeSelection:this.onNativeSelection
				,typedef:this.state.typedef
				,markups:this.props.markups[row]
				,textStyle:this.props.textStyle
				,selectToken:this.selectToken
				,onTokenTouched:this.onTokenTouched
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
		var popupxy={left:this.state.popupX,top:this.state.popupY};
		return E(View,{style:{flex:1}},
				E(DeferListView,props)
				,(this.props.popup&&this.state.showpopup)?E(View,{style:[styles.popup,popupxy]},this.props.popup):null
				);
	}
});
var styles={
	selection:{backgroundColor:"rgb(96,176,255)"}
	,selection_odd:{backgroundColor:"rgb(176,96,255)"}
	,popup:{position:'absolute',opacity:0.9,borderRadius:5,
	shadowRadius:10,shadowColor:"#000000",shadowOffset:{height:1,width:1},shadowOpacity:0.8}
}
module.exports={SelectableRichText:SelectableRichText,DeferListView:DeferListView,Selections:require("./selections")};