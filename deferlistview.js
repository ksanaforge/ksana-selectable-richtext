/* Defer loading List View for React Native*/
"use strict";
var React=require("react-native");
var {
  View,Text,Image,ListView,StyleSheet,TouchableHighlight,PropTypes
} =React;
var E=React.createElement;
/*
 cloneWithRows , the array passed must be changed too (assume immutable array) 

 optimal row count <2000

 text will be fetched if needed when a row become visible 
*/
var DeferListView=React.createClass({
	propTypes:{
		rows:PropTypes.array.isRequired, 
		renderRow:PropTypes.func,
		onViewport:PropTypes.func,
		style:PropTypes.object
	}
	,rowY:{}
	,rows:[]
	,scrollingTo:null //scrolling to this uti
	,scrollBottom:0 //bottom of scrollable area
	,getDefaultProps:function(){
		return {
			onFetchText: function(row,cb){
				cb(0,this.props.rows[row].text,row);
			},
			renderRow:function(rowData,row){
				return React.createElement(Text,null,rowData.text?row+rowData.text:row);
			}
		}
	}
	,getInitialState:function(){
		this.rows=this.props.rows.slice();
		var ds=new ListView.DataSource({rowHasChanged:this.rowHasChanged});
		return {dataSource:ds.cloneWithRows(this.props.rows)};
	}
	,rowHasChanged:function(r1,r2){
		// if (r1!==r2) {
		// 	console.log('row changed')
		// }
		return r1!==r2;
	}
	,componentWillReceiveProps:function(nextProps){
		if (!this.rows!==nextProps.rows) this.scrollBottom=0; //re layout
		this.rows=nextProps.rows;
		if (this.props.selectingParagraph>-1)
			this.rows[this.props.selectingParagraph]=JSON.parse(JSON.stringify(this.rows[this.props.selectingParagraph]));
		if (nextProps.selectingParagraph>-1) 
			this.rows[nextProps.selectingParagraph]=JSON.parse(JSON.stringify(this.rows[nextProps.selectingParagraph]));
		var dataSource=this.state.dataSource.cloneWithRows(this.rows.slice());
		if (!this.unmounting) this.setState({dataSource});

		if (this.props.scrollTo!==nextProps.scrollTo) this.scrollToUti(nextProps.scrollTo);
	}

	,componentDidMount:function(){
		this.scrollToUti(this.props.scrollTo);
	}
	,componentWillUnmount:function(){
		this.unmounting=true;
	}
	,getRows:function(loaded){
		var out=[];
		for (var i=0;i<this.rows.length;i++) {
			if (loaded[i]) {
				var r=JSON.parse(JSON.stringify(this.rows[i]));
				r.text=loaded[i];
				out.push(r);
				this.rows[i]=r;
			} else{
				out.push( this.rows[i] );
			}
			
		}
		return out;
	}
	,fetchTexts:function(tofetch){
		var taskqueue=[],loaded={};

		var task=function(row) {
			taskqueue.push(function(err,data,retrow){
				if (!err&& data){
					if (!data.empty) {
						loaded[retrow]=data;
					}
				}
				this.props.onFetchText.call(this,row,taskqueue.shift(0,data));
			}.bind(this));
		}.bind(this);

		tofetch.forEach(task);
		taskqueue.push(function(err,data,retrow){
			loaded[retrow]=data;
			setTimeout(function(){
				this.updateText(loaded);
			}.bind(this),200);
			
		}.bind(this));
		taskqueue.shift()(0,{empty:true});
	}
	,updateText:function(loaded){
		if (this.unmounting) return;
		var rows=this.getRows(loaded);
		var ds=this.state.dataSource.cloneWithRows(rows);
		
		this.setState({dataSource:ds,rows:rows});		
	}
	,onChangeVisibleRows:function(visibleRows){
		var loading=0,tofetch=[],visibles=[],rows=this.props.rows;
		for (var row in visibleRows.s1) {
			if (!rows[row].text) {
				tofetch.push(row);
				loading++;
			}
			visibles.push(parseInt(row));
		}
		if (!loading) {
			this.updateText({});
		} else {
			this.fetchTexts(tofetch);
		}
		
		clearTimeout(this.visibletimer);

		this.visibletimer=setTimeout(function(){
			if(this.unmounting)return;
			this.props.onViewport&&this.props.onViewport(visibles[0]||0,visibles[visibles.length-1]||0);
		}.bind(this),1000);
	}
	,scrollTo:function(){
		if (this.scrollingTo!==null && !isNaN(this.rowY[this.scrollingTo])) {
			clearTimeout(this.scrollTimer);
			this.refs.list.scrollTo( {y:this.rowY[this.scrollingTo],x:0,animinated:true});
			this.scrollingTo=null;
		}
	}
	,maxY:function(){
		var obj=this.rowY;
		var arr = Object.keys( obj ).map(function ( key ) { return obj[key] });
		return Math.max.apply(null,arr);
	}
	,onRowLayout:function(rowid,evt){
		var y=evt.nativeEvent.layout.y;
		this.rowY[rowid]=y;

		if (parseInt(rowid)===this.scrollingTo) {
			this.scrollTo();
		} else { //scroll to maximum, listview will load more rows
			clearTimeout(this.scrollTimer);
			this.scrollTimer=setTimeout(function(){
				if (this.scrollingTo) this.refs.list.scrollTo({y:this.maxY(),animinated:false}); //scroll to bottom , more rows will be layout
			}.bind(this),300);
		}
	}
	,renderRow:function(rowData,sectionId,rowId,highlightRow){	
		return E(View ,{ref:"para"+rowId,style:{overflow:'hidden'}
		 ,onLayout:this.onRowLayout.bind(this,rowId)}
		 ,this.props.renderRow(rowData,rowId,highlightRow));
	}
	,scrollToRow:function(row){
		var y=this.rowY[row];
		if (y) {
			this.refs.list.scrollTo({x:0,y:y});
		} else {
			this.refs.list.scrollTo({y:0,x:0});
		}
		this.scrollingTo=row;//when layout completed scroll again
	}
	,scrollToUti:function(uti) {
		if (!uti) return;
		for (var i=0;i<this.props.rows.length;i+=1) {
			if (this.props.rows[i].uti===uti) {
				this.scrollToRow(i);
			}
		}
	}
	,getZoomScale:function(){
		return this.zoomScale;
	}
	,zoomScale:1
	,onScroll:function(evt){
		this.zoomScale=evt.nativeEvent.zoomScale;
	}
	,render:function(){
		return E(View,{style:{flex:1}},
		E(ListView,{ref:"list",style:[this.props.style,{overflow:'hidden'}],
		 dataSource:this.state.dataSource , scrollEnabled:!this.scrollingTo
		 ,renderRow:this.renderRow, onChangeVisibleRows:this.onChangeVisibleRows
		 ,pageSize:30,initialListSize:5
		 ,minimumZoomScale:0.5
		 ,zoomScale:1
		 ,onScroll:this.onScroll
		 ,maximumZoomScale:3,bouncesZoom:true
		 }));
	}
});

module.exports=DeferListView;