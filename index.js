var React,Paragraph,DeferListView, reactNative=false , windowW ,windowH,View;

try{
	React=require("react-native");
	reactNative=true;
	View=React.View;
	DeferListView=require("./deferlistview");
	Paragraph=require("./paragraph");
	var Dimensions=React.Dimensions;
	windowW=Dimensions.get("window").width;
	windowH=Dimensions.get("window").height;
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
		return {typedef:typedef,popupX:0,popupY:0,showpopup:false,popup:this.props.popup,
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
		this.context.registerGetter("selectedParagraph",this.getSelectingParagraph,{overwrite:true});
		this.context.registerGetter("zoomScale",this.getZoomScale,{overwrite:true});
		this.context.store.listen("showTocPopup",this.showTocPopup,this);
	}
	,componentDidUpdate:function(){
		//navigator.pop will unregister selectedText getter
		this.context.registerGetter("selectedText",this.getSelectedText,{overwrite:true});
		this.context.registerGetter("selectedParagraph",this.getSelectingParagraph,{overwrite:true});
	}
	,componentWillUnmount:function(){
		this.context.unregisterGetter("selectedText");
		this.context.unregisterGetter("selectedParagraph");
		this.context.unregisterGetter("zoomScale");
		this.context.store.unlistenAll(this);
	}
	,getSelectedText:function(){
		if (this.state.selectingParagraph===-1||this.state.selStart===-1) return "";

		var text=this.props.rows[this.state.selectingParagraph].text;
		return text.substr(this.state.selStart,this.state.selLength);
	}
	,getZoomScale:function(){
		return this.refs.listview.getZoomScale();
	}
	,getSelectingParagraph:function() {
		return this.state.selectingParagraph;
	}
	,selectionChanged:function(selStart,selLength,selectingParagraph){
		if (selectingParagraph==undefined) selectingParagraph=this.state.selectingParagraph;
		
		var paragraph=this.props.rows[selectingParagraph];
		if (!paragraph) return;
		paragraph=paragraph.text;
		this.props.onSelectToken({selStart,selLength,paragraph});
	}
	,selLengthPlusOne:function(){
		if (this.state.selectingParagraph===-1)return;
		var text=this.props.rows[this.state.selectingParagraph].text;
		if (this.state.selLength+1>=text.length)return;
		//TODO, English Token and Surrogate
		var selLength=this.state.selLength+1;
		this.setState({selLength});
		this.selectionChanged(this.state.selStart,selLength);
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
		var selLength=s-this.state.selStart
		this.setState({selLength});
		this.selectionChanged(this.state.selStart,selLength);
	}
	,addSelection:function(){
		var text=this.getSelectedText();
		this.props.onSelection({paragraph:this.state.selectingParagraph,text,
				selStart:this.state.selStart,selLength:this.state.selLength});
		this.setState({selStart:-1,selLength:-1,showpopup:false});
		this.selectionChanged(-1,-1);
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
		this.setState({selStart:this.selStart,selLength:this.selLength});
	}
	,showTocPopup:function(opts) { //call from nav bar
		if (!opts.popup)return;
		this.showPopupMenu(opts.px||5,opts.py||100, opts.popup);
	}
	,showPopupMenu:function(px,py,popup){
		var POPUPMENUWIDTH=180,POPUPMENUHEIGHT=300; //TODO ,get from menu
		popup=popup||this.props.popup;
		var X=px,Y=py;
		if (X+POPUPMENUWIDTH>windowW) X=windowW-POPUPMENUWIDTH; 
		if (Y+POPUPMENUHEIGHT>windowH) Y=windowH-POPUPMENUHEIGHT;
		this.setState({popupX:px,popupY:py-22,showpopup:true,popup});	
	}
	,saveTouchPos:function(evt){
		if (evt.nativeEvent.touches.length===1) {
			this.pageX=evt.nativeEvent.pageX;
			this.pageY=evt.nativeEvent.pageY;
		} else {
			this.pageX=-1;this.pageY=-1;
		}
	}
	,isPress:function(evt){
		var ce=evt.nativeEvent.changedTouches;
		if (evt.nativeEvent.touches.length!==0 || ce.length!==1 || this.pageX<0 || this.pageY<0) return;

		var xdis=this.pageX-ce[0].pageX; xdis=xdis*xdis;
		var ydis=this.pageY-ce[0].pageY; ydis=ydis*ydis;

		return (xdis<25 && ydis<25);		
	}
	,onTokenTouched:function(x,y) {
		if (this.cancelBubble) {
			return;
		}	
		if ( this.state.selectingParagraph===-1)return;
		
		if (this.state.selStart>-1) this.showPopupMenu(x,y,this.props.popup);
	}
	,unselectParagraph:function(){
		if (this.state.selectingParagraph>-1) this.props.onSelectParagraph(-1);
		if (this.state.selStart>-1) {
			this.selectionChanged(-1,-1);
		}
		this.setState({selectingParagraph:-1,showpopup:false,selStart:-1,selLength:-1});
	}
	,onTouchEnd:function(n,evt) {
		if (this.cancelBubble) {
			this.cancelBubble=false;
			return;
		}		

		if (!this.isPress(evt)) return;

		var showpopup=this.state.showpopup;
		if (showpopup && this.state.popup!==this.props.popup &&this.state.popup) {
			this.setState({showpopup:false});			
			return;
		}

		var selStart=this.selStart; //from nativeSelection event
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
		if (this.state.selectingParagraph!==n) {
			this.props.onSelectParagraph(n);
			
		}
		if (n>-1) this.selectionChanged(selStart,selLength);
		this.setState({selectingParagraph:n,showpopup,selStart,selLength});
	}
	,onTouchStart:function(n,evt){
		this.saveTouchPos(evt);
	}
	,fetchText:function(row,cb){
		if (this.props.rows[row].text) return false;
		this.props.onFetchText(row,cb);
	}
	,onHyperlink:function() {
		this.cancelBubble=true;  //onTouchEnd has no effect
		var popup=this.props.onHyperlink&&this.props.onHyperlink.apply(this,arguments);
		if (popup) {
			this.showPopupMenu(popup.props.popupX || this.pageX,this.pageY,popup);
		}
	}
	,renderRow:function(rowdata,row){
		var text=rowdata.text,idx=parseInt(row);
		var ranges=this.props.selections[row];
		var params={para:idx, text:text 
				,onHyperlink:this.onHyperlink
				,ranges:ranges
				,selectable:this.state.selectingParagraph===idx
				,selStart:this.state.selStart
				,selLength:this.state.selLength
				,onNativeSelection:this.onNativeSelection
				,typedef:this.state.typedef
				,markups:this.props.markups[row]
				,textStyle:this.props.textStyle
				,onTokenTouched:this.onTokenTouched
				,unselectParagraph:this.unselectParagraph
				,fetchText:this.fetchText}
		if (reactNative) {
			params.onTouchStart=this.onTouchStart.bind(this,idx);
			params.onTouchEnd=this.onTouchEnd.bind(this,idx);
		}
		
		return E(View, {style:this.props.style,key:idx}, E(Paragraph, params)
		);
	}
	,scrollToUti:function(uti) {
		this.refs.listview&&this.refs.listview.scrollToUti(uti);
	}
	,render:function(){
		var props={};
		for (var i in this.props)	props[i]=this.props[i];
		props.ref="listview";

		props.renderRow=this.renderRow;

		props.selectingParagraph=this.state.selectingParagraph
		var popupxy={left:this.state.popupX,top:this.state.popupY};
		return E(View,{style:{flex:1}},
				E(DeferListView,props)
				,(this.state.popup&&this.state.showpopup)?E(View,{style:[styles.popup,popupxy]},this.state.popup):null
				);
	}
});
var styles={
	selection:{backgroundColor:"rgb(96,176,255)"}
	,selection_odd:{backgroundColor:"rgb(176,96,255)"}
	,popup:{position:'absolute',opacity:0.95,borderRadius:5,backgroundColor:'rgb(240,240,240)',
	shadowRadius:10,shadowColor:"#000000",shadowOffset:{height:1,width:1},shadowOpacity:0.8}
}
module.exports={SelectableRichText:SelectableRichText,DeferListView:DeferListView};