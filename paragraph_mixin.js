var React,reactNative=false;

try{
	React=require("react-native");
	reactNative=true;
} catch(e) {
	React=require("react");
}
var PT=React.PropTypes;
var getTokens=require("./tokens").getTokens;
module.exports={
	propTypes:{
			para:PT.number.isRequired  //paragraph id
			,ranges:PT.array
			,markups:PT.array
			//,text:PT.string
			,textStyle:PT.oneOfType([PT.object,PT.number])  //StyleSheet return number
			,typedef:PT.object
			,onNativeSelection:PT.func
	}
	,getInitialState:function(){
		var res=getTokens.call(this);
		res.text=this.props.text;
		res.typedef=this.props.typedef;
		return res;
	}
	,componentDidMount:function(){
		this.props.fetchText(this.props.para,function(err,text,row){
			var shredd=this.props.selectable&&reactNative;
			var res=getTokens.call(this,this.props,text,shredd);
			res.text=text;
			this.setState(res);
		}.bind(this));
	}
	,shouldComponentUpdate:function(nextProps,nextState){
		var selectableChange = nextProps.selectable!==this.props.selectable;
		var selectingChange = nextProps.selectable && (nextProps.selStart!==this.props.selStart||nextProps.selLength!==this.props.selLength);

		var changed= selectingChange || selectableChange || nextProps.text!==nextState.text||nextProps.markups!==this.props.markups||nextProps.ranges!==this.props.ranges;


		if ( changed && nextProps.text) {
			var shredd=nextProps.selectable&&reactNative;
			var res=getTokens.call(this,nextProps,nextProps.text,shredd);
			res.text=nextProps.text;
			for (var i in res) {
				nextState[i]=res[i];
			}
		}
		return changed ;
	}
};