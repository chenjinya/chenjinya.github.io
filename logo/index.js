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
var Cookie = {};

Cookie.set = function (name, value) {
    var Days = 30;
    var exp = new Date();
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
};
Cookie.get = function (name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
};
//  属性设置
var Setter = function () {
    this._set = {_n: 'Setter'};
    this.get = function (n) {
        return typeof  n === 'undefined' ? this._set : this._set[n];
    }
    this.set = this.val = function (n, v) {
        var o = n;
        if (typeof  o !== 'object') {
            if (typeof  v === 'undefined') {
                return this._set[n];
            }
            o = {};
            o[n] = v;
        }
        for (s in o) {
            if (o[s] === '__DELETE__') {
                delete this._set[s]
            } else {
                this._set[s] = o[s];
            }
        }
        return this;
    }
}
!function (window) {
    var ua = window.navigator.userAgent.toLowerCase(),
        reg = /msie|applewebkit.+safari/;
    if (reg.test(ua)) {
        var _sort = Array.prototype.sort;
        Array.prototype.sort = function (fn) {
            if (!!fn && typeof fn === 'function') {
                if (this.length < 2) return this;
                var i = 0, j = i + 1, l = this.length, tmp, r = false, t = 0;
                for (; i < l; i++) {
                    for (j = i + 1; j < l; j++) {
                        t = fn.call(this, this[i], this[j]);
                        r = (typeof t === 'number' ? t :
                            !!t ? 1 : 0) > 0
                            ? true : false;
                        if (r) {
                            tmp = this[i];
                            this[i] = this[j];
                            this[j] = tmp;
                        }
                    }
                }
                return this;
            } else {
                return _sort.call(this);
            }
        };
    }
}(window);

//  游戏管理器
var Game = function (_config) {
    //  高清屏反锯齿倍数
    var scale = 1;
    //  配置
    var config = _config || {};

    config.fps = config.fps || 50;
    config.canvasId = config.canvasId || 'canvas';
    config.loading = config.loading || g('loading_wrap');
    config.pause = 0;

    //  需要返回的实例对象
    var oGame = {config: config, components: [], isVertical: false, isRotated: false};

    //  屏幕旋转操作
    oGame.resetSceneView = function () {

        var d = document;
        var m = navigator.userAgent.match(/Mobile/);
        var w = m ? (d.documentElement ? d.documentElement.clientWidth : d.body.clientWidth ) : 980;
        var h = m ? (d.documentElement ? d.documentElement.clientHeight : d.body.clientHeight) : 552;
		
				//modified by jinya 
		if(w < h){
			oGame.isVertical = true;
			var tmp = h;
			h =w;
			w = tmp;
			oGame.cns.style.left =-(w- h)/2+ 'px';
			oGame.cns.style.top = (w- h)/2+ 'px';
			oGame.cns.style.webkitTransform = "rotate(90deg)";
			oGame.cns.style.transform = "rotate(90deg)";
			oGame.cns.style.oTransform = "rotate(90deg)";
			oGame.cns.style.msTransform = "rotate(90deg)";
        
		}
		//oGame.isVertical = false;
        oGame.cns.width = oGame.ctx.width = w * scale;
        oGame.cns.height = oGame.ctx.height = h * scale;
        oGame.cns.className = m ? '' : 'pc';
        oGame.cns.style.width = w + 'px';
        oGame.cns.style.height = h + 'px';
		
        oGame.isRotated = false;

        log('SceneView Rotate', 'w', w, 'h', h);

    };

    oGame.isMobile = navigator.userAgent.match(/Mobile/) && navigator.userAgent.match(/Mobile/).length > 0;
    oGame.loadingUpdate = function () {
        config.loading.className != 'hide' && (  config.loading.className = oGame.isVertical ? 'rotated' : '');
    }

    //  场景更新
//    log._su = 0;
//    log._su++;
config.fps = 30;
    oGame.sceneUpdate = function () {

        //  再来一次
		//requestAnimationFrame(oGame.sceneUpdate);
        setTimeout(oGame.sceneUpdate, 1000 / config.fps);
        if (config.pause) {
            return false;
        }
        //  侦测屏幕状态
        oGame.loadingUpdate();
				//modified by jinya 
        /*if (oGame.isVertical) {
            if (!oGame.isRotated) {
                log('do rotate');
                oGame.isRotated = true;
                oGame.ctx.rotate(90 * Math.PI / 180);
                oGame.ctx.translate(0, -1 * Math.min(oGame.ctx.width, oGame.ctx.height));
            
            //  擦除所有内容
            oGame.ctx.clearRect(0, 0, oGame.ctx.height, oGame.ctx.width);

        } else {}*/
            oGame.ctx.clearRect(0, 0, oGame.ctx.width, oGame.ctx.height);
       // }
        //  通知所有组件更新
        var n = Date.now();
        //g('ts').innerHTML = (((n - log.start) / 100) >>> 0 ) / 10 + ' /'
        var c = oGame.components.sort(function (a, b) {
            return a.index > b.index;
        })

        for (i in c) {
            typeof  c[i].onSceneUpdate == 'function' && c[i].onSceneUpdate(n);
        }


    }

    oGame.addComponent = function (_config) {

        var config = _config || {};
        config.game = config.game || this;
        var c = new Game[config.type || 'component'](config);
        oGame.components.push(c);
        return c;
    }

    //  触摸事件
    oGame.onTouch = function (touch) {

        var n = Date.now();
        var c = oGame.components.sort(function (a, b) {
            return a.index > b.index;
        })

        var x = touch.pageX;
        var y = touch.pageY;
        //  垂直情况修正 x 和 y
        if (oGame.isVertical) {
		//modified by jinya 
            //var z = touch.pageY;
            //y = oGame.ctx.width / scale - touch.pageX;
           // x = z;
		   x = touch.pageY;
		   y = touch.pageX;
        }
        var o = {
            x: x * scale,
            y: y * scale,   //  DOM尺寸是Canvas的一半
            touch: touch
        }
        //  非移动端要修正
        //          game.cns.offsetLeft
        //        game.cns.offsetTop
        if (!oGame.isMobile) {
            o.x -= oGame.cns.offsetLeft * 2
            o.y -= oGame.cns.offsetTop * 2
        }
        for (i in c) {
            c[i].visible && c[i]._onSceneTouch(o);
        }

    }

    //  隐藏所有元素
    oGame.hideAll = function () {
        var c = oGame.components;
        for (i in c) {
            c[i].visible = 0;
        }
    }
    //  init Game
    void function () {
        log('game init')
        oGame.cns = g(config.canvasId);
        oGame.ctx = oGame.cns.getContext('2d');
        //  旋转
        window.onresize = oGame.resetSceneView;
        oGame.resetSceneView();
        oGame.sceneUpdate();
        oGame.config.loading.className = 'hide';
        log('loading hide ~')
        oGame.loadingUpdate = Function;
        //  触摸
        oGame.cns.addEventListener("touchstart", function (event) {
            event.preventDefault();
            if (!event.touches.length) return;
            var touch = event.touches[0];
            oGame.onTouch(touch);
        }, false);
        oGame.cns.addEventListener("mousedown", oGame.onTouch, false);
    }();

    oGame.pause = function () {
        config.pause ^= 1;
    }

    oGame.height = function () {
        return Math.min(oGame.cns.width, oGame.cns.height)
    }

    oGame.width = function () {
        return Math.max(oGame.cns.width, oGame.cns.height)
    }


    return oGame;
}
Game.prototype = new Setter;
//  创建一个Canvas对象
Game.canvas = function (_size, uid) {

    var d = document;
    var cns = d.getElementById(uid) ? d.getElementById(uid) : d.createElement('canvas');
    var ctx = cns.getContext("2d");
    var size = _size || { w: 100, h: 100 }

    cns.id = uid || 'c' + Math.random().toString().replace('.', '_');
    cns.className = 'c';
    cns.width = ctx.width = size.w;
    cns.height = ctx.height = size.h;

    return {
        cns: cns,
        ctx: ctx,
        remove: function () {
            if (el = d.getElementById(cns.id)) {
                el.remove();
            }

        },
        show: function () {
            if (!d.getElementById(cns.id)) {
                d.body.appendChild(cns);
            }
        }
    }
}

//  组件对象
Game.component = function (config) {

    this.config = config;
    this.config.revise = this.config.revise || [];
    this.uid = config.uid || 'u' + Math.random();
    this.index = config.index || 100;
    this.game = config.game;
    this.src = config.game.config.resource[ this.uid ] || [new Game.canvas()];  //  初始化_uid资源，默认0个是100*100的canvas
    this.cns = new Game.canvas();
    this.ctx = this.cns.ctx;
    this.cns = this.cns.cns;
    this.beofreOnSceneUpdate = {};
    this.visible = this.config.visible || 0;

    this.x = this.config.x || 0;
    this.y = this.config.y || 0;
    this.w = this.config.w || 0;
    this.h = this.config.h || 0;
    this.zoom = 1; // 组件动画缩放时使用


    //  --- 事件
    //  场景被触摸
    this._onSceneTouch = function (e) {
        typeof this.onSceneTouch == 'function' && this.onSceneTouch(e);
        typeof this.onTouchMe == 'function' && this.realTouchMe(e) && this.onTouchMe(e);
    }
    this.realTouchMe = function (e) {
        var t = this;
        return e.x > t.x && e.x < ( t.x + t.w) && e.y > t.y && e.y < ( t.y + t.h);

    }

    //  --  更新
    //  更新自身的位置
    this.updatePosition = function () {

        var isCenter = this.config.isCenter;
        var revise = this.config.revise;
        var isPlug = this.config.isPlug;

        if (isCenter) {
            if (typeof isCenter == 'boolean') {
                //  相对场景剧中

                var gCns = this.game.cns;

                var gameW = Math.max(gCns.width, gCns.height);
                var gameH = Math.min(gCns.width, gCns.height);

                var thisW = this.w;
                var thisH = this.h;

                this.x = gameW / 2 - thisW / 2;
                this.y = gameH / 2 - thisH / 2;

            } else {
                //  相对某个组件剧中
                this.x = isCenter.x + isCenter.w / 2 - this.w / 2;
                this.y = isCenter.y + isCenter.h / 2 - this.h / 2;
            }
        }
        //  相对某个组件的位置
        if (isPlug) {
            this.x = isPlug.x;
            this.y = isPlug.y;
        }
        if (revise) {
            if (revise[2]) {
                var direc = revise[2].direction || [0, 0];
                this.x = revise[2].x + revise[0] + direc[0] * 2;
                this.y = revise[2].y + revise[1];
            } else {
                this.x += revise[0] || 0;
                this.y += revise[1] || 0;
            }

        }

        typeof this.beforeUpdatePosition == 'function' && this.beforeUpdatePosition(ts);
    }
    //  绘制自身到场景中 @todo 如果频繁崩溃，可以尝试 修改为调整 style 的位置，并且根据 rotate 旋转
    this.drawToScene = function () {
        var scene = this.game.ctx;
        if (this.visible) {
            scene.drawImage(this.cns, this.x, this.y, this.w * this.zoom, this.h * this.zoom);
        }

    }
    //  场景更新
    this.onSceneUpdate = function (ts) {
        for (s in this.beofreOnSceneUpdate) {
            typeof this.beofreOnSceneUpdate[s] == 'function' && this.beofreOnSceneUpdate[s].call(this, ts);
        }
        this.updatePosition();
        return this.drawToScene();
    }

    //  --  通用方法
    //  重绘自身，根据自身的source
    this.redraw = function (_i) {
        var i = _i || 0;
        var s = this.src[i].cns;

        var w = this.w || (s.width );
        var h = this.h || (s.height );

        if (this.config.isFull) {

            var gCns = this.game.cns;
            w = Math.max(gCns.width, gCns.height);
            h = Math.min(gCns.width, gCns.height);
        }

        this.w = this.ctx.width = this.cns.width = w;
        this.h = this.ctx.height = this.cns.height = h;

        this.ctx.drawImage(s, 0, 0, w, h);


        return this;
    }
    this.bg = function (c) {
        this.ctx.fillStyle = c || 'rgba(255,0,0,.1)';
        this.ctx.fillRect(0, 0, this.w, this.h);
    }
    //  清理自身
    this.clean = function () {

        this.ctx.clearRect(0, 0, 9999, 9999);
        return this;
    }

    //  --- 简单动画
    //  播放自身的动画
    this.play = function (_config) {
        var fn = {
            start: function (context) {
                context.max = context.config.max || this.src.length;
                context.idx = context.config.idx || 0;
            },
            run: function (context) {
                this.redraw(context.idx);
                context.idx++;
            },
            isOver: function (context) {
                return context.idx >= context.max;
            }
        };
        return this.todo('play', _config, fn)
    }
    //  移动自身到相对位置
    this.moveAbsY = function (_config) {
        var fn = {
            start: function (context) {
                var startAbsY = context.config.start || this.config.revise[1];
                var endAbsY = context.config.to;
                var diffY = endAbsY - startAbsY;
                var duration = context.config.duration || 500;
                context.max = duration / context.config.step;   //  移动的次数
                context.idx = 0;
                context.stepY = diffY / context.max;    //  移动的间隔
                context.baseY = startAbsY;    //  移动的间隔
            },
            run: function (context) {
                context.idx++;
                this.config.revise[1] = context.baseY + context.stepY * context.idx;
            },
            isOver: function (context) {
                return context.idx >= context.max;
            }
        }
        return this.todo('moveAbsY', _config, fn)
    }
    //  doSomeThing
    this.todo = function (doWhat, _config, fn) {
        this.visible = 1;
        var config = _config || {};
        config.step = config.step || 30;
        var last = 0;
        var context = {config: config};
        fn.start.call(this, context);
        //  条件执行 & 结束
        this.beofreOnSceneUpdate[doWhat] = function (ts) {
            //  间隔步进
            if (ts - last < config.step) {
                return false;
            } else {
                last = ts;
            }
            fn.run.call(this, context);
            if (fn.isOver.call(this, context)) {
                this.beofreOnSceneUpdate[doWhat] = null;
                delete this.beofreOnSceneUpdate[doWhat];
                return config.callback && config.callback.call(this);
            }
        }
        return this;
    }

    //  --- 特殊动作
    //  创造属于自己的线，气球专用
    this.setLine = function () {
        Game.component.makeLine.call(this);
        return this;
    }
    //  支持气球移动（隐藏了不干）
    this.supportPopMove = function () {
        Game.component.supportPopMove.call(this);
        return this;
    }
    //  支持跳跃（隐藏了不干）
    this.supportJump = function () {
        Game.component.supportJump.call(this);
        return this;
    }
    //  根据Ap重绘自身
    this.redrawByAp = function (ap) {
        delete this.beofreOnSceneUpdate['highlight'];
        var frame = this.frame;
        var select = 0;
        for (i in frame) {
            if (ap >= i) {
                select = frame[i];
            }
        }
        return this.redraw(select);
    }

    //  --- 初始化组件，更新位置，绘制自己的第0个资源
    this.updatePosition();
    return this.redraw(0);
}
//  创造气球的一些其他的什么东西
Game.component.makeLine = function () {
    var line = game.addComponent({
        uid: this.uid + '_line_', //+ setTimeout(Function, 1),
        isCenter: this, revise: [ 0, 260 ],
        index: this.index - 1,
        visible: 1
    });

    log('line add component')
    line.w = 50;
    line.h = 283 * 1.5;
    line.redraw();
    line.host = this;
    log('line redraw');
    line.update = function () {
//        log('line update')
        Game.component.drawLine.call(this);
    };
    this.line = line;
    this.update = function () {
//        log('pop update')
        //  随机方向 X -1 ~ -10 , Y -3 ~ -6
        this.direction = [ (Math.random() * 999 % 10 >>> 0) - 3 , (Math.random() * 999 % 3 >>> 0) - 6];
        //this.direction = [10, 0]
        if (!this.game.isMobile) {
            this.direction[0] *= 2;
            this.direction[1] *= 2;
        }
        this.direction[1] = -20;
        //this.direction = [1, -5];
        var c = this.onUpdateClearReviseComponent;
        if (c && c.length) {
            for (i in c) {
                c[i].resetBeforeSupportJumpInfoAndHide();
                this.onUpdateClearReviseComponent = [];
            }
        }
//        log('pop update over')
    }
    this.update();
    this.line.update();
    log('line over')
}
//  绘制气球的线
Game.component.drawLine = function () {
    this.clean();
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = 'rgba( ' + (this.host.config.color || '0,0,0') + ',.8)';
    this.ctx.beginPath();
    this.ctx.moveTo(this.w / 2, 0);
    this.ctx.quadraticCurveTo(this.w / 2 + this.host.direction[0] * 2, this.h / 2, this.w / 2, this.h);
    this.ctx.stroke();
}
//  气球支持移动
Game.component.supportPopMove = function () {
    if (!this.visible) {
        return false;
    }
    var gCns = this.game.cns;
    var xRange = [10, Math.max(gCns.width, gCns.height) - 10 - this.w];
    var yRange = [this.h * -3, Math.min(gCns.width, gCns.height)];
    this.onUpdateClearReviseComponent = [];
    this.beofreOnSceneUpdate['move'] = function () {
        this.x += this.direction[0];
        this.y += this.direction[1]
        //  左右范围
        if (this.x < xRange[0] || this.x > xRange[1]) {

            this.x = this.x < xRange[0] ? xRange[0] + 1 : xRange[1] - 1;
            this.direction[0] *= -1;
            this.line.config.revise[0] = this.direction[0];
            this.line.update();
        }
        //  上(下)范围
        if (this.y < yRange[0]) {
            this.y = yRange[1];
            this.update();
        }
    }
    return this;
}
//  玩偶支持跳跃
Game.component.supportJump = function () {

    this.redraw(0);

    this.resetBeforeSupportJumpInfoAndHide = function () {
        if (this._index) {
            this.index = this._index;
            this.config.revise = this._revise;
            this._revise = false;
            this._index = false;
            this.visible = 0;
            this.redraw(0);
            this.resetBeforeSupportJumpInfoAndHide = Function;
            this.config.revisePop.splice(2, 1);
            log("i'll be reset and hide", this.uid);
        }
    }

    if (!this.visible) {
        return false;
    }
    this._dontMoving = false;
    this._revise = false;

    //  清除掉点中的气球
    this.game.touchPop = false;

    //  开始高亮
    this.beofreOnSceneUpdate['highlight'] = function (ts) {
        var s = ((Date.now() / 1000) >>> 0) % 2;
        if (this._highlight_limit != s) {
            this._highlight_limit = s;
            this.redraw(this._highlight_limit)
        }
    }

    var jump = function (touch) {
        //  不可见 enableMove
        if (!this.visible || this._dontMoving) {
            return false;
        }
        this._dontMoving = true;
        //  藏好定位信息
        this._revise = this.config.revise;
        this.config.revise = [0, 0];

        //  计算2段跳
        var point = {start: {x: this.x, y: this.y}};

        point.up = {x: (touch.x + point.start.x) / 2, y: 0}


        if (this.game.touchPop) {
            point.target = {x: this.game.touchPop.x, y: this.game.touchPop.y};

            log('before targe.x', point.target.x);

            point.target.x += game.config.fps * this.game.touchPop.direction[0];
            point.target.y += game.config.fps * this.game.touchPop.direction[1];

            //  @todo target.x 需要修正边界问题
            if (point.target.x < 10) {
                point.target.x = Math.abs(point.target.x) + 10;

            }

            if (point.target.x > this.game.width()) {

                point.target.x = this.game.width() * 2 - this.game.touchPop.w * 2 - point.target.x
                log('fix target.x', point.target.x);
            }

            point.target.x += this.config.revisePop[0];
            point.target.y += this.config.revisePop[1];

            //  @todo up.x 需要根据 target.y 修正，越接近越难忘~
            //  ...

            if (point.target.y < 300) {
                var diff = 300 - Math.abs(point.target.y);
            }
            log('revisePop + direction*fps + targe.x', point.target.x);
        } else {
            point.target = {x: touch.x, y: this.game.height() + 200 };


        }


        point.up.step = {x: (point.up.x - point.start.x) / 100, y: (point.up.y - point.start.y) / 100}
        point.target.step = {x: (point.target.x - point.up.x) / 100, y: (point.target.y - point.up.y) / 100}


        log('start Jump', this);
        //  开始1段跳，跳完后， 允许下个人跳  && (修改跟随 or 失败露脸)
        Game.fx.call(this, {fn: function (ap, isDone) {
            if (isDone) {
                //  开始2段跳,临时提高玩偶的 index
                this._index = this.index;
                this.index = 150;
                this.zoom = 1;
                this.redrawByAp(100);
                Game.fx.call(this, {fn: function (ap, isDone) {

                    this.redrawByAp(ap + 100);
                    if (isDone) {


                        if (this.game.touchPop) {
                            Game.component.scoreAdd.call(this.game.score)
                            //  跳完挂在气球上
                            this.config.revise = this.config.revisePop;
                            this.config.revise.push(this.game.touchPop);
                            //  延迟到气球 update 的时候更新
                            this.game.touchPop.onUpdateClearReviseComponent.push(this)

                            log('Jump over', this.game.touchPop.x);
                        } else {
                            // 失败动画,shy 之后要复位
                            this.redrawByAp(201);
                            Game.component.dollShy.call(this, this.resetBeforeSupportJumpInfoAndHide);
                        }

                        //  结束了
                        if (this.game.doll.length <= 0) {
                            return setTimeout(function () {
                                this.game.toViewOver()
                            }, 2000);
                        }
                        //  @error 立刻释放了 touchPop 导致挂载不正确
                        this.game.doll.shift().supportJump();

                    }
                    this.x = point.target.step.x * ap + point.up.x;
                    this.y = point.target.step.y * ap + point.up.y;

                }, ease: "easeIn"});
                return false;

            } else {
                this.zoom = 1 + .5 * ap / 100;
                this.x = point.up.step.x * ap + point.start.x;
                this.y = point.up.step.y * ap + point.start.y;
                this.redrawByAp(ap);
            }
        }, ease: "easeOut"})
    }
    //  延迟触发好让气球先被抓住
    this.onSceneTouch = function (touch) {
        var me = this;
        setTimeout(function () {
            jump.call(me, touch)
        }, 1);
    }
}
Game.component.dollShy = function (callback) {
    var startY = this.y - 50;
    Game.fx.call(this, {fn: function (ap, isDone) {
        this.y = startY - ap * 3 >>> 0;
        if (isDone) {
            startY = this.y
            Game.fx.call(this, {fn: function (ap, isDone) {
                this.y = startY + ap * 3 >>> 0;
                if (isDone) {
                    callback.call(this);
                }
            }, duration: 1000, ease: 'easeIn'});
        }
    }, duration: 1000, ease: 'easeOut'});
}
Game.component.scoreAdd = function (init) {
    if (init == 0) {
        this.number = 0;
    } else {
        this.number++;
    }
    this.numberComponent.redraw(this.number);

    var x = number.config.revise[0]
    var y = number.config.revise[1]
    var w = this.numberComponent.w / 2;
    Game.fx.call(this.numberComponent, {fn: function (ap, isDone) {
        this.zoom = ap / 100;
        number.config.revise[0] = x + (1 - ap / 100) * w;
        number.config.revise[1] = y + (1 - ap / 100) * w;
    }, duration: 1000, ease: 'easeInOut'});

}

/*
 * Game.fx.call( component,{fn: function (ap , isFinal) {},dura:500 ,ease:'easeOut')
 * */
Game.fx = function (_set) {
    (function (context, _set) {
        var set = _set || {};
        set.me = context;
        set.st = Date.now();
        set.duration = set.duration || 500;
        set.s = set.s || 0;
        set.e = set.e || 100;
        set.fn = set.fn || function (p) {
        }
        set.ease = Game.fx.ease[set.ease || 'linear'];
        set.id = setTimeout(Function, 1);
        set.me.beofreOnSceneUpdate['fx_' + set.id] = function (last) {
            if (set.st + set.duration < last) {
                set.fn.call(set.me, 100, true)
                delete set.me.beofreOnSceneUpdate['fx_' + set.id];
                return false;
            }
            var ts = Date.now() - set.st;
            var pe = set.ease(ts, set.s, set.e, set.duration);
            return set.fn.call(set.me, pe, false);
        };
    })(this, _set);
    return this;
}
Game.fx.ease = {
    linear: function (t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    },
    easeOut: function (t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    },
    easeIn: function (t, b, c, d) {
        return c * (t /= d) * t + b;
    },
    easeInOut: function (t, b, c, d, s) {
        if (s == undefined) s = 1.70158 * 3;
        if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    }

}
