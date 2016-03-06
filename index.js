var React,Paragraph,DeferListView, reactNative=false , windowW;

try{
	React=require("react-native");
	reactNative=true;
	View=React.View;
	DeferListView=require("./deferlistview");
	Paragraph=require("./paragraph");
	var Dimensions=React.Dimensions;
	windowW=Dimensions.get("window").width;
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
		return {typedef:typedef,popupX:0,popupY:0,showpopup:false,
				selectingParagraph:-1,selStart:-1,selLength:0};
	}
	,contextTypes:{
		store:PT.object
		,registerGetter:PT.func
		,unregisterGetter:PT.func
	}
	,componentDidMount:function(){
		this.context.store.listen("selLengthPlusOne",this.selLengthPlusOne,this);
		this.context.store.listen("selLengthTillPunc",this.selLengthTillPunc,this);
		this.context.store.listen("addSelection",this.addSelection,this);
		this.context.registerGetter("selectedText",this.getSelectedText,{overwrite:true});
	}
	,componentDidUpdate:function(){
		//navigator.pop will unregister selectedText getter
		this.context.registerGetter("selectedText",this.getSelectedText,{overwrite:true});
	}
	,componentWillUnmount:function(){
		this.context.unregisterGetter("selectedText");
		this.context.store.unlistenAll(this);
	}
	,getSelectedText:function(){
		if (this.state.selectingParagraph===-1||this.state.selStart===-1) return "";

		var text=this.props.rows[this.state.selectingParagraph].text;
		return text.substr(this.state.selStart,this.state.selLength);
	}
	,selLengthPlusOne:function(){
		if (this.state.selectingParagraph===-1)return;
		var text=this.props.rows[this.state.selectingParagraph].text;
		if (this.state.selLength+1>=text.length)return;
		//TODO, English Token and Surrogate
		this.setState({selLength:this.state.selLength+1})
	}
	,selLengthTillPunc:function(){
		if (this.state.selectingParagraph===-1)return;
		var text=this.props.rows[this.state.selectingParagraph].text;
		if (this.state.selLength+1>=text.length)return;
		var s=this.state.selStart+this.state.selLength+1;
		while (s<text.length) {
			var code=text.charCodeAt(s);
			if (!(code>0x3400&&code<0x9FFF)){
				break;
			}
			s++;
		}
		this.setState({selLength:s-this.state.selStart});
	}
	,addSelection:function(){
		this.props.onSelection(this.state.selectingParagraph,this.state.selStart,this.state.selLength);
		this.setState({selStart:-1,selLength:-1,showpopup:false});
	}
	,hidePopup:function(){
		this.setState({showpopup:false});
	}
	,propTypes:{
		rows:PT.array.isRequired 
        ,selections:PT.object
		,textStyle:PT.oneOfType([PT.object,PT.number])  //StyleSheet return number
		,typedef:PT.object
		,onHyperlink:PT.func
		,onFetchText:PT.func
		,onSelection:PT.func
		,popup:PT.element
	}
	,onNativeSelection:function(rowid,sel) {
		this.selStart=sel[0];
		this.selLength=sel[1];
		this.props.onSetTextRange(rowid,sel);
	}
	,showPopupMenu:function(n,px,py){
		var POPUPMENUWIDTH=180;
		var X=px;
		if (X+POPUPMENUWIDTH>windowW) X=windowW-POPUPMENUWIDTH; 
		this.setState({selStart:n,selLength:1,popupX:X,popupY:py-22,showpopup:true});	
	}
	,onTokenTouched:function(n,evt) {
		var ne=evt.nativeEvent;
		this.showPopupMenu(n,ne.pageX,ne.pageY);
	}
	,onTouchEnd:function(n,evt) {
		var ce=evt.nativeEvent.changedTouches;
		if (evt.nativeEvent.touches.length!==0 || ce.length!==1 || this.pageX<0 || this.pageY<0) return;

		var xdis=this.pageX-ce[0].pageX; xdis=xdis*xdis;
		var ydis=this.pageY-ce[0].pageY; ydis=ydis*ydis;

		if (xdis>25 || ydis>25) return;

		var showpopup=this.state.showpopup;
		var selStart=this.selStart;
		var selLength=this.selLength;
		if (this.state.selectingParagraph!==n) {
			showpopup=false;
			selStart=-1;
			selLength=-1;
		} else {
			if (!showpopup) n=-1; //no selection, click on blank area, deselect paragrah
			if (this.selStart==-1) showpopup=false; //click on blank area, unselect selection , paragraph still selected
			this.selStart=-1;  //selStart is used.
			this.selLength=-1;
		}

		this.setState({selectingParagraph:n,showpopup,selStart,selLength});
	}
	,onTouchStart:function(n,evt){
		if (evt.nativeEvent.touches.length===1) {
			this.pageX=evt.nativeEvent.pageX;
			this.pageY=evt.nativeEvent.pageY;
		} else {
			this.pageX=-1;this.pageY=-1;
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
				,selectable:this.state.selectingParagraph===idx
				,selStart:this.state.selStart
				,selLength:this.state.selLength
				,onNativeSelection:this.onNativeSelection
				,typedef:this.state.typedef
				,markups:this.props.markups[row]
				,textStyle:this.props.textStyle
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
		props.selectingParagraph=this.state.selectingParagraph
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
	,popup:{position:'absolute',opacity:0.9,borderRadius:5,backgroundColor:'white',
	shadowRadius:10,shadowColor:"#000000",shadowOffset:{height:1,width:1},shadowOpacity:0.8}
}
module.exports={SelectableRichText:SelectableRichText,DeferListView:DeferListView};