
(function(){
    // for apple touchmove window
    document.addEventListener("touchmove",function(e){
       e.preventDefault();  
    })
	var call_native = ""
    window.requestAnimationFrame = (function(){
        return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function(/* function */ callback, /* DOMElement */ element){
          window.setTimeout(callback, 1000 / 60);
        };
      })();
    imgUrl = "http://chenjinya.cn/wumai/img/avatar.png";
    lineLink = "http://chenjinya.cn/wumai/index.html";
    descContent = '万能贴吧防霾指数';
    shareTitle = '万能贴吧-防霾指数小测试';
    appid = '';
    var JinyaRun = function(){
        this.constuctor();
    };
    JinyaRun.prototype={
		inject:[],
        constuctor:function(){
            this.stage = $("#container");
			this.canvas = $("#gameCanvas");
            this.ctx = this.canvas[0].getContext("2d");
            this.init();
        },
        init:function(){
            this.fullWindow([this.canvas]);
            this.start();
            this.bindEvent();
        },
        fullWindow:function(canvas){
            this.windowWidth = $(document).width();
            this.windowHeight = $(window).height();
           
            //不能用.width.height，否则比例拉伸
            this.stage.css({width : this.windowWidth, height: this.windowHeight});
			for( var i=0; i<canvas.length; i++){
                canvas[i][0].width = this.windowWidth;
                canvas[i][0].height = this.windowHeight;
            }
        },
        bindEvent:function(){
			var self = this;
            this.canvas.on("click",function(e){
                self.processControl(e);
				if(self.direction) self.direction = 0;
				else self.direction = 1;
            }).on("touchstart",function(e){
                //self.pointer.x = e.touches[0].pageX;
                self.processControl(e);
            }).on("touchmove",function(e){
                //self.pointer._x = e.touches[0].pageX;
                self.processControl(e);
            }).on("touchend",function(e){
                self.processControl(e);
            });

        },
        processControl:function(e){
            console.log(e.type);
			
        },
        initCircle:function(){
            var ctx = this.ctx;
            var self = this;
            this.Angle = -Math.PI/2;
            ctx.lineWidth =self.windowWidth < self.windowHeight ? self.windowWidth*(15/320) : self.windowHeight*(15/320); // 设置线宽
            ctx.strokeStyle = "#0099FF"; // 设置线的颜色
            ctx.font = "Bold 50px Arial";
            // 设置对齐方式
            ctx.textAlign = "center";
            // 设置填充颜色
			ctx.fillStyle = "#AAA";
            var s = self.windowHeight/self.windowWidth;
			var R =  self.windowWidth*(162/320)/2;
            var Y = self.windowHeight/2;
            var X =  self.windowWidth/2;
			var speed = Math.PI*2/60/10;
			this.direction = 0;
            this.inject["drawCircle"]=[function(){
                if(self.Angle > Math.PI*2-Math.PI/2){
					self.direction = 1;
                }else if(self.Angle <= -Math.PI/2){
					self.direction = 0;
				}
				if(self.direction == 0){
					 self.Angle +=speed;
				}
				else{
				// Math.PI/2/ 3600
                    self.Angle -=speed;
                }
				//需要变化字体
                ctx.font = "Bold 50px Arial";
                ctx.fillText(Math.round((self.Angle+Math.PI/2)/(Math.PI*2)*10)+"", X ,Y);
				//ctx.fillText(self.FPS+"-->"+self.FPS_static,X,Y);
				//需要变化字体
                ctx.font = "Bold 20px Arial";
                ctx.fillText("sec", X ,Y+40);
                ctx.beginPath();
                //(self.windowWidth - self.windowWidth*(180/320))/2
                ctx.arc(X,Y,R,-Math.PI/2,self.Angle,false); // 外圈
                ctx.stroke();//使用ctx.fill();就是填充色；
            }];
        },
        start:function(){
			this.startFlag = true;
			//this.initCircle();
			this.showFPS();
			this.animate();
        },
        /**
        *  清画布
        */
        clearCanvas:function(canvas){
            for ( var i =0 ; i < canvas.length; i++){
                var context = canvas[i][0].getContext('2d');
                context.clearRect( 0, 0,this.windowWidth, this.windowHeight);
            }
        },
        animate:function(){
            if(! this.startFlag) return;
            this.clearCanvas([this.canvas]);
            for (var i in this.inject ){
                //console.log("animate:",i)
                /*
                * [function(argv1,argv2){},argv1,argv2...]
                */
                this.inject[i][0].apply(this,this.inject[i].slice(1));//帧移动
            }
			this.FPS ++;
            var self = this;
           // requestAnimationFrame(function(){ self.animate() });
        },
		FPS:0,
		FPS_static:0,
		showFPS:function(){
			var self = this;
			var rightCounter = $("#rightCounter");
			setTimeout(function(){
				self.FPS_static = self.FPS;
				rightCounter.html("FPS:"+self.FPS)
				//rightCounter.html(window.screen.width +":"+ window.screen.height)
				self.FPS =0;
				self.showFPS();
			},1000);
		}


    };
    window.Game =new JinyaRun();
})();
//=============weixin
    