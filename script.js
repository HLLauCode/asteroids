const FPS = 60;
const SHIP_SIZE = 30; //px
const SHIP_THRUST = 5;
const TURN_SPEED = 270; 
const FRICTION = 0.6;
const ROIDS_JAG = 0.6; //jaggedness of roids
const ROIDS_NUM = 4; //starting numbers of roids
const ROIDS_SPD = 50; //max staring spd of roids
const ROIDS_SIZE = 100; //starting size of roids in px
const ROIDS_VERT = 10; //avg num of vertices on each roid

let roids = [];
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
createAsteroidBelt();

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

function createAsteroidBelt() {
    roids = [];
    let x, y;
    for(let i = 0; i < ROIDS_NUM; i++) {
        do {
            x = Math.floor(Math.random() * canv.width);
            y = Math.floor(Math.random() * canv.height);
        } while (distBetweenPoints(ship.x, ship.y, x, y) < ROIDS_SIZE * 2 + ship.r)
        roids.push(newAsteroid(x, y));
    }
}

function newAsteroid(x, y) {
    let roid = {
        x: x,
        y: y,
        xv: Math.random() * ROIDS_SPD / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ROIDS_SPD / FPS * (Math.random() < 0.5 ? 1 : -1),
        r: ROIDS_SIZE / 2,
        a: Math.random() * Math.PI * 2,
        vert: Math.floor(Math.random() * (ROIDS_VERT + 1) + ROIDS_VERT / 2),
        offs: [],
    }

    //create offsets of vert
    for (let i = 0; i < roid.vert; i++) {
        roid.offs.push(Math.random() * ROIDS_JAG *  2 + 1 - ROIDS_JAG);
    }

    return roid
}

function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
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

    //draw roids
    ctx.strokeStyle = "grey";
    ctx.lineWidth = SHIP_SIZE / 20;
    let x, y, r, a, vert, offs;
    for(let i = 0; i < roids.length; i++) {
        //get roid properties
        x = roids[i].x;
        y = roids[i].y;
        r = roids[i].r;
        a = roids[i].a;
        vert = roids[i].vert;
        offs = roids[i].offs;
        //draw path
        ctx.beginPath();
        ctx.moveTo(
            x + r * offs[0] * Math.cos(a),
            y + r * offs[0] * Math.sin(a)
        )

        //draw polygon
        for (let j = 1; j < vert; j++) {
            ctx.lineTo(
                x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
                y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert)
            )
        }
        ctx.closePath();
        ctx.stroke();

        //move roids
        roids[i].x += roids[i].xv;
        roids[i].y += roids[i].yv;

        //handle edge
        if(roids[i].x < 0 - roids[i].r) {
            roids[i].x = canv.width + roids[i].r
        } else if(roids[i].x > canv.width + roids[i].r) {
            roids[i].x = 0 - roids[i].r
        }
        if(roids[i].y < 0 - roids[i].r) {
            roids[i].y = canv.height + roids[i].r
        } else if(roids[i].y > canv.height + roids[i].r) {
            roids[i].y = 0 - roids[i].r
        }
    }
}