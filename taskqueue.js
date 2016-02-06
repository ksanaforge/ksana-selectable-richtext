var taskqueue=[];

var task=function(row) {
	taskqueue.push(function(err,data){
		if (!err&&!(typeof data==='object'&&data.emtpy)){

		}
		fetch(row,taskqueue.shift(0,data));
	})
}

