const FPS = 60;
const SHIP_SIZE = 30; //px
const SHIP_THRUST = 5;
const TURN_SPEED = 270; 
const FRICTION = 0.7;

let canv = document.getElementById('gameCanvas')
let ctx = canv.getContext('2d')

let ship = {
    x: canv.width / 2,
    y: canv.height / 2,
    r: SHIP_SIZE / 2,
    a: 90 / 180 * Math.PI,  //convert degree to radians
    rot: 0,
    thrusting: false,
    thrust: {
        x: 0,
        y: 0
    }
}

//set up event handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

//set up game loop
setInterval(update, 1000 / FPS)

function keyDown(/** @type {keyboardEvent} */ e) {
    switch(e.keyCode) {
        case 37: //left
            ship.rot = TURN_SPEED / 180 * Math.PI / FPS;
            break;
        case 38: //up
            ship.thrusting = true;  
            break;
        case 39: //right
            ship.rot = -TURN_SPEED / 180 * Math.PI / FPS;
            break;
    }
}

function keyUp(/** @type {keyboardEvent} */ e) {
    switch(e.keyCode) {
        case 37: //left
            ship.rot = 0;
            break;
        case 38: //up
            ship.thrusting = false;
            break;
        case 39: //right
            ship.rot = 0;
            break;
    }
}


function update() {
    //draw space
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height)

    // thrusting
    if(ship.thrusting) {
        ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
        ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;

        //draw thruster
        ctx.fillStyle = "red";
        ctx.strokeStyle = "orange";
        ctx.lineWidth = SHIP_SIZE / 10;
        ctx.beginPath();
        ctx.moveTo( //rear left
            ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
            ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
        );
        ctx.lineTo( //rear centre behind the ship
            ship.x - ship.r * (6 / 3 * Math.cos(ship.a)),
            ship.y + ship.r * (6 / 3 * Math.sin(ship.a))
        )
        ctx.lineTo( //rear right
            ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
            ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
        );
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    } else { //slowly stoping the ship
        ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
        ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
    }

    //draw ship
    ctx.strokeStyle = "white";
    ctx.lineWidth = SHIP_SIZE / 20;
    ctx.beginPath();
    ctx.moveTo(
        ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
        ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
    );
    ctx.lineTo( //rear left
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))
    );
    ctx.lineTo( //rear right
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))
    );
    ctx.closePath();
    ctx.stroke();

    //rotate ship
    ship.a += ship.rot;

    //move ship
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;

    //handle edge
    if(ship.x < 0 - ship.r) {
        ship.x = canv.width + ship.r
    } else if(ship.x > canv.width + ship.r) {
        ship.x = 0 - ship.r
    }
    if(ship.y < 0 - ship.r) {
        ship.y = canv.height + ship.r
    } else if(ship.y > canv.height + ship.r) {
        ship.y = 0 - ship.r
    }

    //centre dot
    // ctx.fillStyle = "red";
    // ctx.fillRect(1, 1, 2, 2);
}