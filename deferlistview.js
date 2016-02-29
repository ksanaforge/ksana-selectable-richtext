/* Defer loading List View for React Native*/

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
		onViewportChanged:PropTypes.func,
		style:PropTypes.object
	}
	,rowY:{}
	,rows:[]
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
		//return {dataSource: ds.cloneWithRows(this.getRows({}))};
		return {dataSource:ds.cloneWithRows(this.props.rows)};
	}
	,rowHasChanged:function(r1,r2){
		if (r1!==r2) {
			console.log('row changed')
		}
		return r1!==r2;
	}
	,shouldComponentUpdate:function(nextProps,nextState){
		//datasource and array need to update , otherwise listview will not update
		if (nextProps.selectingParagraph!==this.props.selectingParagraph) {
			if (this.props.selectingParagraph>-1)
				this.rows[this.props.selectingParagraph]=JSON.parse(JSON.stringify(this.rows[this.props.selectingParagraph]));
			if (nextProps.selectingParagraph>-1) 
				this.rows[nextProps.selectingParagraph]=JSON.parse(JSON.stringify(this.rows[nextProps.selectingParagraph]));
			var ds=this.state.dataSource.cloneWithRows(this.rows.slice());
			nextState.dataSource=ds;
		}
		return true;
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
		var rows=this.getRows(loaded);
		var ds=this.state.dataSource.cloneWithRows(rows);
		
		this.setState({dataSource:ds,rows:rows},function(){
			if (this.scrollingTo) {
				setTimeout(function(){
					this.refs.list.scrollTo( this.rowY[this.scrollingTo],0);
					this.scrollingTo=null;
				}.bind(this),800); //wait until layout complete
			}
		}.bind(this));		
	}
	,onChangeVisibleRows:function(visibleRows){

		var loading=0,tofetch=[],visibles=[],rows=this.props.rows;
		for (row in visibleRows.s1) {
			if (!rows[row].text) {
				tofetch.push(row);
				loading++;
			}
			visibles.push(parseInt(row));
		}
		if (!loading) {
			this.updateText({});
			return;
		}
		this.fetchTexts(tofetch);
		clearTimeout(this.visibletimer);

		this.visibletimer=setTimeout(function(){
			this.props.onViewportChanged&&this.props.onViewportChanged(visibles[0],visibles[visibles.length-1]);
		}.bind(this),1000);
	}
	,onRowLayout:function(rowid,evt){
		this.rowY[rowid]=evt.nativeEvent.layout.y;
	}
	,renderRow:function(rowData,sectionId,rowId,highlightRow){	
		return E(View ,{ref:"para"+rowId,style:{overflow:'hidden'}
		 ,onLayout:this.onRowLayout.bind(this,rowId)}
		 ,this.props.renderRow(rowData,rowId,highlightRow));
	}
	,scrollToRow:function(row){
		var y=this.rowY[row];
		if (y) {
			this.refs.list.scrollTo( y,0);
			this.scrollingTo=row;//when layout completed scroll again
		}
	}
	,render:function(){
		return E(View,{style:{flex:1}},
		E(ListView,{ref:"list",style:[this.props.style,{overflow:'hidden'}],
		 dataSource:this.state.dataSource 
		 ,renderRow:this.renderRow, onChangeVisibleRows:this.onChangeVisibleRows
		 ,pageSize:30,initialListSize:1}));
	}
});

module.exports=DeferListView;