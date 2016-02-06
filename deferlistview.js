/* Defer loading List View for React Native*/

var React=require("react-native");
var {
  View,Text,Image,ListView,StyleSheet,TouchableHighlight,PropTypes
} =React;
/*
 cloneWithRows , the array passed must be changed too (assume immutable array) 

 optimal row count <2000

 text will be fetched if needed when a row become visible 
*/
var DeferListView=React.createClass({
	propTypes:{
		rows:PropTypes.array.isRequired, 
		onFetchText:PropTypes.func,
		renderRow:PropTypes.func,
		style:PropTypes.object
	}
	,rowY:{}
	,rows:{}
	,getDefaultProps:function(){
		return {
			onFetchText: function(row,cb){
				cb(0,this.props.rows[row].text,row);
			},
			renderRow:function(rowData,row){
				return <Text>{rowData.text?row+rowData.text:row}</Text>
			}
		}
	}
	,getInitialState:function(){
		this.rows=this.props.rows.slice();
		var ds=new ListView.DataSource({rowHasChanged:this.rowHasChanged});
		return {dataSource: ds.cloneWithRows(this.getRows({}))};
	}
	,rowHasChanged:function(r1,r2){
		if (r1!==r2){
			console.log('row changed',r1,r2);
		}
		return r1!==r2;
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
			this.updateText(loaded);
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
		var loading=0,tofetch=[],rows=this.props.rows;
		for (row in visibleRows.s1) {
			if (!rows[row].text) {
				tofetch.push(row);
				loading++;
			}
		}
		if (!loading) return;
		this.fetchTexts(tofetch);
	}
	,onRowLayout:function(rowid,evt){
		this.rowY[rowid]=evt.nativeEvent.layout.y;
	}
	,renderRow:function(rowData,sectionId,rowId,highlightRow){	
		return <View style={{overflow:'hidden'}}
		 onLayout={this.onRowLayout.bind(this,rowId)}>
		 {this.props.renderRow(rowData,rowId,highlightRow)}</View>
	}
	,scrollToRow:function(row){
		var y=this.rowY[row];
		if (y) {
			this.refs.list.scrollTo( y,0);
			this.scrollingTo=row;//when layout completed scroll again
		}
	}
	,render:function(){
		return <View style={{flex:1}}>
		
		<ListView ref="list" style={[this.props.style,{overflow:'hidden'}]} dataSource={this.state.dataSource} 
		renderRow={this.renderRow} onChangeVisibleRows={this.onChangeVisibleRows}
		 pageSize={30} initialListSize={1}/>
		</View>
	}
});
/*
<TextInput style={{width:100,height:22}} ref="uti" onChangeText={this.setUti} value={this.state.uti}/>
		<TouchableHighlight onPress={this.scroll}><Text>scroll</Text></TouchableHighlight>
		*/
module.exports=DeferListView;