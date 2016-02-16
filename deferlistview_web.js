/* lazy loading scrollable listview , good for <1K rows 
  number of rows and id are given.
  load rows when scroll into viewport 
  unlike React Native ListView, rows beyond will not be clipped*/

var React=require("react");
var E=React.createElement;
var PT=React.PropTypes;

var DeferListView=React.createClass({
	getDefaultProps:function(){
		return {rows:[]};
	}
	,rowHeights:[]
	,inViewport:[]
	,propTypes:{
		rows:PT.array.isRequired
		,height:PT.string
	}
	,componentDidMount:function(){
		var rowHeights=[];
		for (var i in this.refs) {
			if (i[0]!=='c') continue;
			var row=parseInt(i.substr(1));
			this.rowHeights[row]=this.refs[i].getBoundingClientRect().height;
			this.inViewport[row]=false;
		}
		this.setViewPort(0);
	}
	,componentDidUpdate:function() {
		setTimeout(function(){
			for (var i=0;i<this.inViewport.length;i+=1) {
				if (this.inViewport[i]) {
					var c=this.refs["c"+i];
					if(c) this.rowHeights[i]=c.getBoundingClientRect().height;
				}
			}
		}.bind(this),300); //wait until rows updated, hacky solution
	}
	,renderRow:function(rowdata,idx) {
		return E("div",{ref:'c'+idx,key:idx},
				this.inViewport[idx]?this.props.renderRow(this.props.rows[idx],idx):"Loading "+idx);
	}
	,getFirstVisibleRow:function(top) {
		var h=0;
		for (var i=0;i<this.rowHeights.length;i+=1) {
			if (h>=top) return i;
			h+=this.rowHeights[i];
		}
		return this.rowHeights.length-1;
	}
	,getVisibleRows:function(top) {
		this.height=this.refs.container.getBoundingClientRect().height;
		var last=first=this.getFirstVisibleRow(top);
		var h=0;
		while (h<=this.height && last<this.rowHeights.length) {
			h+=this.rowHeights[last];
			last+=1;
		}
		return {first:first,last:last};
	}
	,setViewPort:function(top) {
		var i,page=this.getVisibleRows(top);
		//for (i=0;i<this.inViewport.length;i+=1) this.inViewport[i]=false;
		for (i=page.first;i<page.last+3;i+=1) {
			 this.inViewport[i]=true;
		}
		this.forceUpdate();
	}
	,onScroll:function(e) {
		clearTimeout(this.viewporttimer);
		var top=e.target.scrollTop;
		this.viewporttimer=setTimeout(function(){
			this.setViewPort(top);
		}.bind(this),100);		
	}
	,render:function(){
		return E("div",{ref:"container",onScroll:this.onScroll,style:{overflowY:"scroll",height:this.props.height||"500"}},
			this.props.rows.map(this.renderRow));
	}
});

module.exports=DeferListView;