define(["dojo/_base/declare","dojo/_base/connect","dojo/_base/lang",
	"dijit/_WidgetBase","dijit/_TemplatedMixin",
	"dojo/text!./templates/nadijit_bootstrapstyle.html",
	"dojo/on","dojo/dom","dojo/_base/array","esri/map","esri/graphic",
	"dojo/domReady!"],function(declare,connect,lang,_WidgetBase,_TemplatedMixin,nadijitTemplate,on,dom,array,Map,Graphic){
		return declare([_WidgetBase,_TemplatedMixin],{
			templateString:nadijitTemplate,
			/**
			 * 
			 * 给当前Widget自定义一些属性
			 */
			options:{map:null,routeTask:null,routeParams:null,stopSymbol:null,barrierSymbol:null},
			loaded:false,
			addstopconn:null,
			addbarrierconn:null,
			/**
			 * [ NADijit的构造函数]
			 * @param  {[Object]} option option中含有我们NADijit的一些配置信息，包括NA服务的网址，符号等信息。
			 * @param  {[String]} srcRefNode NADijit的宿主DOM节点的id
			 * @return {[type]}
			 */
			constructor:function(option,srcRefNode){
			//option:{routeTask:rotetask,map:map,routeParams:routeParams,
			//stopSymbol:stopSymbol,barrierSymbol,barriersymbol,routeSymbol:routeSymbol}
				declare.safeMixin(this.options,option);
				this.domNode=srcRefNode;
				this.map=this.options.map;
				this.routeTask=this.options.routeTask;
				this.routeParams=this.options.routeParams;
				this.stopSymbol=this.options.stopSymbol;
				this.barrierSymbol=this.options.barrierSymbol;
				this.routeSymbol=this.options.routeSymbol;
			},
			/**
			 * [ NADijt的启动函数，在使用函数的方法创建Widget后必须要调用该方法]
			 * @return {[type]}
			 */
			startup:function(){
				var that=this;
				if(!that.map){
					alert("map required");
					that.destroy();
				}
				if(this.map.loaded){
					that._init();
				}else{
					connect.connect(that.map,"onLoad",function(){
						that._init();
					});
				}
			},
			/*
			从此处开始下面所有的代码，都是业务逻辑相关，例如添加站点，添加障碍，计算路径，清除路径等。
			 */
			_init:function(){
				var that=this;
				connect.connect(that.routeTask,"onSolveComplete",lang.hitch(this,that._showRoutes));
			},
			destroy:function(){
				this.inherited(arguments);
			},
			_addStopcon:function(){
				this._removeAllConn();
				var that=this;
				this.addstopconn=connect.connect(that.map,"onClick",lang.hitch(this,that._addStop));
			},
			_addBarriercon:function(){
				this._removeAllConn();
				var that=this;
				this.addbarrierconn=connect.connect(that.map,"onClick",lang.hitch(this,that._addBarrier));
			},
			_addStop:function(evt){
				var that=this;
				var tempStop=new Graphic(evt.mapPoint,that.stopSymbol);
				this.map.graphics.add(tempStop);
				this.routeParams.stops.features.push(tempStop);
			},
			_addBarrier:function(evt){
				var that=this;
				var tempStop=new Graphic(evt.mapPoint,that.barrierSymbol);
				this.map.graphics.add(tempStop);
				this.routeParams.barriers.features.push(tempStop);
			},
			_clearStops:function(){
				var that=this;
				var stopsLength=this.routeParams.stops.features.length;
				if(stopsLength){
					array.forEach(this.routeParams.stops.features,function(feature){
						that.map.graphics.remove(feature);
					});
					this.routeParams.stops.features.splice(0,stopsLength);
				}				
			},
			_clearBarriers:function(){
				var that=this;
				var barrierLength=this.routeParams.barriers.features.length;
				if(barrierLength){
					array.forEach(this.routeParams.barriers.features,function(feature){
						that.map.graphics.remove(feature);
					});
					this.routeParams.barriers.features.splice(0,barrierLength);
				}
			},
			_removeAllConn:function(){
				//var that=this;
				if(this.addbarrierconn){
					connect.disconnect(this.addbarrierconn);
				}
				if(this.addstopconn){
					connect.disconnect(this.addstopconn);
				}
			},
			_clearAll:function(){
				this.map.graphics.clear();
			},
			_solveRoute:function(){
				var that=this;
				if(!that.routeParams.stops.features.length){
					alert("Please add stops first!");
				}
				if(that.routeParams.stops.features.length==1){
					alert("At least 2 stops needed!");
				}
				that.routeTask.solve(that.routeParams);
			},
			_showRoutes:function(routeresults){
				var that=this;
				array.forEach(routeresults.routeResults,function(routeresult){
					that.map.graphics.add(routeresult.route.setSymbol(that.routeSymbol));
				});
			}
		});
	});