var React=require("react");
var E=React.createElement;

var InfiniteScroller=require("./infinitescroller");

var DeferListView=React.createClass({
	getDefaultProps:function(){
		return {rows:[]};
	}
	,renderRow:function(row) {
		return this.props.renderRow(this.props.rows[row],row);
	}
	,render:function(){
		return E(InfiniteScroller,
			{averageElementHeight:20
			,containerHeight:this.props.height||600
			,renderRow:this.renderRow
			,totalNumberOfRows:this.props.rows.length});
	}
});


module.exports=DeferListView;