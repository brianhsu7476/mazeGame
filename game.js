var canvas=document.getElementById('mycanvas'), ctx=canvas.getContext('2d');
var ww=window.innerWidth, wh=window.innerHeight, cnt=0, cntMove=0;
const bw=48, bh=27, ballSize=100, ballDis=250, fps=60;
var scale=Math.min(1920/ww, 1080/wh), isEnd=0;
canvas.width=ww, canvas.height=wh;
ctx.translate(ww/2, wh/2), ctx.scale(1, -1);

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

class Edge{
    constructor(args){
        let def={
            u:0, v:0
        };
        Object.assign(def, args), Object.assign(this, def);
    }
};

class Maze{
    constructor(args){
        let def={
            n:bw*bh, e0:[], p:[], e:[], G:[], on:[], dis:0
        };
        Object.assign(def, args), Object.assign(this, def);
        for(var i=0; i<bw; ++i)for(var j=0; j<bh-1; ++j)this.e0.push(new Edge({u:i*bh+j, v:i*bh+j+1}));
        for(var i=0; i<bw-1; ++i)for(var j=0; j<bh; ++j)this.e0.push(new Edge({u:i*bh+j, v:(i+1)*bh+j}));
        this.e0=shuffle(this.e0);
        for(var i=0; i<this.n; ++i)this.p.push(i);
        this.e0.forEach(edge=>{if(this.union(edge.u, edge.v))this.e.push(edge);})
        for(var i=0; i<this.n; ++i)this.G.push([]), this.on.push(0);
        this.e.forEach(edge=>{
            this.G[edge.u].push(edge.v);
            this.G[edge.v].push(edge.u);
        });
        this.dfs(0, -1);
        this.on.forEach(i=>{this.dis+=i;});
    }

    find(x){
        if(x==this.p[x])return x;
        this.p[x]=this.find(this.p[x]);
        return this.p[x];
    }

    union(x, y){
        var rx=this.find(x), ry=this.find(y);
        this.p[rx]=ry;
        return rx!=ry;
    }

    dfs(x, p){
        console.log('(x, p)=', x, p);
        this.G[x].forEach(u=>{
            if(u!=p){
                this.dfs(u, x);
                if(this.on[u])this.on[x]=1;
            }
        });
        if(x==this.n-1)this.on[x]=1;
    }
};

class Ball{
    constructor(args){
        let def={
            x:0, y:0, r:ballSize, color:'white', nbr:[]
        };
        Object.assign(def, args), Object.assign(this, def);
    }

    draw(){
        ctx.save(), ctx.scale(1/scale, 1/scale), ctx.translate(this.x, this.y);
        ctx.beginPath(), ctx.arc(0, 0, this.r, 0, 2*Math.PI);
        ctx.fillStyle=this.color, ctx.fill(), ctx.restore();
    }

    move(dx, dy){
        if(cnt>=cntMove){
            if(this.x+dx*ballDis<0||this.x+dx*ballDis>ballDis*(bw-1))return;
            if(this.y+dy*ballDis<0||this.y+dy*ballDis>ballDis*(bh-1))return;
            var idx=Math.round((this.x*bh+this.y)/ballDis);
            balls[idx].nbr.forEach(nbr=>{
                if(nbr==idx+dx*bh+dy)cntMove=cnt+6, this.x+=dx*ballDis, this.y+=dy*ballDis;
            });
        }
    }
};

var player=new Ball({r:ballSize/2, color:'red'}), player0=new Ball();
Object.assign(player0, player);
var balls=[], maze=new Maze();
while(maze.dis<200)maze=new Maze();
alert('Go to the top-right corner as soon as possible!');

function init(){
    isEnd=0;
    for(var i=0; i<bw; ++i)for(var j=0; j<bh; ++j)balls.push(new Ball({x:i*ballDis, y:j*ballDis}));
    // for(var i=0; i<bw*bh; ++i)if(maze.on[i])balls[i].color='yellow';
    maze.e.forEach(edge=>{
        if(edge.v-edge.u==1)balls.push(new Ball({x:Math.floor(edge.u/bh)*ballDis, y:(edge.u%bh+edge.v%bh)/2*ballDis, r:ballSize/2}));
        else balls.push(new Ball({x:(Math.floor(edge.u/bh)+Math.floor(edge.v/bh))/2*ballDis, y:edge.u%bh*ballDis, r:ballSize/2}));
        balls[edge.u].nbr.push(edge.v), balls[edge.v].nbr.push(edge.u);
    });
}

var tt=0;

function draw(){
    ctx.fillStyle='rgba(0, 29, 46, 0.5)';
    ctx.fillRect(0-ww, 0-wh, (bw*ballDis+ww)*2, (bh*ballDis+wh)*2);
    balls.forEach(ball=>ball.draw());
    player.draw();
    ctx.save(), ctx.translate(player0.x, player0.y);
    ctx.scale(1, -1), ctx.font='30px Arial', ctx.fillStyle='white';
    if(!isEnd)tt=Math.floor(cnt*10/fps)/10;
    var sx=Math.round(player.x/ballDis), sy=Math.round(player.y/ballDis);
    if(sx==bw-1&&sy==bh-1)isEnd=1;
    ctx.fillText('x:'+sx+' y: '+sy+' time: '+tt, -ww/2+10, -wh/2+33);
    ctx.restore();
    requestAnimationFrame(draw);
}

function update(){
    var player2=new Ball();
    Object.assign(player2, player0);
    if(cntMove>cnt){
        player0.x+=(player.x-player0.x)/(cntMove-cnt);
        player0.y+=(player.y-player0.y)/(cntMove-cnt);
    }
    ctx.translate((player2.x-player0.x)/scale, (player2.y-player0.y)/scale);
    ++cnt;
}

init();
setInterval(update, 1000/fps);
requestAnimationFrame(draw);

document.addEventListener('keydown', function(evt){
    if(evt.code=='ArrowRight'||evt.code=='KeyD')player.move(1, 0);
    else if(evt.code=='ArrowUp'||evt.code=='KeyW')player.move(0, 1);
    else if(evt.code=='ArrowLeft'||evt.code=='KeyA')player.move(-1, 0);
    else if(evt.code=='ArrowDown'||evt.code=='KeyS')player.move(0, -1);
});
