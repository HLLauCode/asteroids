const FPS = 60;
const SHIP_SIZE = 30;

let canv = document.getElementById('gameCanvas')
let ctx = canv.getContext('2d')

let ship = {
    x: canv.width / 2,
    y: canv.height / 2,
    r: SHIP_SIZE / 2,
    a: 90 / 180 * Math.PI //convert degree to radians
}

//set up game loop
setInterval(update, 1000 / FPS)

function update() {
    //draw space
    ctx.fillstyle = "black";
    ctx.fillRect(0, 0, canv.clientWidth, canv.height)

    //draw ship
    ctx.strokeStyle = "white";
    ctx.lineWidth = SHIP_SIZE / 20;
    ctx.beginPath();
    ctx.moveTo(
        ship.x + ship.r * Math.cos(ship.a),
        ship.y - ship.r * Math.sin(ship.a)
    );
    ctx.lineTo( //rear left
        ship.x - ship.r * (Math.cos(ship.a) + Math.sin(ship.a)),
        ship.y + ship.r * (Math.sin(ship.a) - Math.cos(ship.a))
    );
    ctx.lineTo( //rear right
        ship.x - ship.r * (Math.cos(ship.a) - Math.sin(ship.a)),
        ship.y + ship.r * (Math.sin(ship.a) + Math.cos(ship.a))
    );
    ctx.closePath();
    ctx.stroke();
    //rotate ship


    //move ship


}