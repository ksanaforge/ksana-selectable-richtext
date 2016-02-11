var React=require("react-native");
var {
  View,Text,StyleSheet,PropTypes
} =React;
var rowY={};
var DeferListView=require("./deferlistview");
var Paragraph=require("./paragraph");
var E=React.createElement;

import EventEmitter from "react-native/Libraries/vendor/emitter/EventEmitter";
//var EventEmitter=require("react-native/Libraries/Vendor/emitter/EventEmitter");

var SelectableRichText=React.createClass({
	getInitialState:function(){
		this.eventEmitter=new EventEmitter();
		return {paraStart:-1,paraEnd:-1,token:null};
	}
	,getSelection:function(){
		return {paraStart:this.state.paraStart,paraEnd:this.state.paraEnd,selStart:this.selStart,selEnd:this.selEnd};
	}	
	,selStart:-1
	,selEnd:-1
	,componentWillUnmount:function(){
		this.eventEmitter.removeAllListeners();	
	}
	,onSelectionChanged:function(selStart,selEnd,lastStart,lastEnd) {
		this.selStart=selStart;
		this.selEnd=selEnd;
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
		this.selStart=-1;
		this.selEnd=-1;
		this.setState({paraStart:-1,paraEnd:-1});
	}
	,trimSelection:function(para,start) {
		if (this.state.paraStart===-1)return;
		if (start) {
			this.setState({paraStart:para});
		} else {
			this.setState({paraEnd:para});
		}
	}
	,visibleChanged:function(start,end){
		if (this.state.paraStart>end || start>this.state.paraEnd) {
			this.cancelSelection();
		}
	}
	,getSentenceMarkup:function(sid){
		return this.props.markups[sid];
	}
	,markLeft:function(){
		if (this.state.paraStart===-1) return;
		this.eventEmitter.emit('adjustSelection',-1);
	}
	,markRight:function(){
		if (this.state.paraEnd===-1) return;
		this.eventEmitter.emit('adjustSelection',1);
	}
	,renderRow:function(rowdata,row){
		var text=rowdata.text||"",idx=parseInt(row);
			return E(View, {style:this.props.style},
				E(Paragraph, 
				{key:idx, para:idx, text:text 
				,onTouchStart:this.onTouchStart.bind(this,idx)
				,onTouchEnd:this.onTouchEnd.bind(this,idx)
				,onHyperlink:this.props.onHyperlink
				,onSelectionChanged:this.onSelectionChanged
				,token:this.state.token
				,typedef:this.props.typedef
				,markups:this.getSentenceMarkup(idx)
				,selectedStyle:this.props.selectedStyle
				,textStyle:this.props.textStyle
				,selectedTextStyle:this.props.selectedTextStyle
				,selectToken:this.selectToken
				,paraStart:this.state.paraStart
				,paraEnd:this.state.paraEnd
				,trimSelection:this.trimSelection
				,eventEmitter:this.eventEmitter
				,cancelSelection:this.cancelSelection}
				)
			);
	}
	,render:function(){
		return <DeferListView ref="listview" {...this.props} visibleChanged={this.visibleChanged}
		renderRow={this.renderRow} />
	}
});





module.exports={SelectableRichText,DeferListView};