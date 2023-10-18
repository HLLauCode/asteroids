const FPS = 60;
const FRICTION = 0.6;
const LASER_DIST = 0.6; //max distance laser can travel
const LASER_EXPLODE_DUR = 0.1; //duration of the laser explosion in second
const LASER_MAX = 10; //max no. of lasers on screen at once
const LASER_SPD = 500; //speed ot laser in px/s
const SHIP_BLINK_DUR = 0.1; //duration of ship blink during invincible time
const SHIP_EXPLODE_DUR = 0.3; //explode duration
const SHIP_INV_DUR = 3; //invincible time after explosion
const SHIP_SIZE = 30; //px
const SHIP_THRUST = 5;
const TURN_SPEED = 270; 
const ROIDS_JAG = 0.4; //jaggedness of roids
const ROIDS_NUM = 4; //starting numbers of roids
const ROIDS_SPD = 50; //max staring spd of roids
const ROIDS_SIZE = 100; //starting size of roids in px
const ROIDS_VERT = 10; //avg num of vertices on each roid
const SHOW_BOUNDING = false;
const SHOW_CENTRE_DOT = false;

let roids = [];
let canv = document.getElementById('gameCanvas')
let ctx = canv.getContext('2d')

//set up the game parameters


let ship = newShip();

//set up event handlers
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

//set up game loop
setInterval(update, 1000 / FPS)
createAsteroidBelt();

function keyDown(/** @type {keyboardEvent} */ e) {
    switch(e.keyCode) {
        case 32: //shoot laser
            shootLaser();
            break;
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
        case 32:
            ship.canShoot = true;
            break;
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
        roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 2)));
    }
}

function destroyAsteroid(index) {
    let x = roids[index].x;
    let y = roids[index].y;
    let r = roids[index].r;

    //split the asteroid in two if necessary
    if (r == Math.ceil(ROIDS_SIZE / 2)) {
        roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 4)));
        roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 4)));
    } else if (r == Math.ceil(ROIDS_SIZE / 4)) {
        roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 8)));
        roids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 8)));
    }

    //destroy the asteroid
    roids.splice(index, 1);
}

function newAsteroid(x, y, r) {
    let roid = {
        x: x,
        y: y,
        xv: Math.random() * ROIDS_SPD / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ROIDS_SPD / FPS * (Math.random() < 0.5 ? 1 : -1),
        r: r,
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

function explodeShip() {
    ship.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * FPS);
}

function newShip() {
    return {
        x: canv.width / 2,
        y: canv.height / 2,
        r: SHIP_SIZE / 2,
        a: 90 / 180 * Math.PI,  //convert degree to radians
        blinkNum: Math.ceil(SHIP_INV_DUR / SHIP_BLINK_DUR),
        blinkTime: Math.ceil(SHIP_BLINK_DUR * FPS),
        canShoot: true,
        explodeTime: 0,
        lasers: [],
        rot: 0,
        thrusting: false,
        thrust: {
            x: 0,
            y: 0
        }
    }
}

function shootLaser() {
    //create laser object
    if (ship.canShoot && ship.lasers.length < LASER_MAX) {
        ship.lasers.push({ //from the nose of the ship
            x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
            y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
            xv: LASER_SPD * Math.cos(ship.a) / FPS,
            yv: -LASER_SPD * Math.sin(ship.a) / FPS,
            dist: 0,
            explodeTime: 0
        })
    }
    //prevent further shooting
    ship.canShoot = false;
}

function update() {
    let blinkOn = ship.blinkNum % 2 == 0;
    let exploding = ship.explodeTime > 0;
    //draw space
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canv.width, canv.height)

    // thrusting
    if(ship.thrusting) {
        ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
        ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;

        //draw thruster
    if (!exploding && blinkOn) {
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
    }
        
    } else { //slowly stoping the ship
        ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
        ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
    }

    //draw ship
    if(!exploding) {
        if(blinkOn) {
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
        }

        //handle blinking
        if (ship.blinkNum > 0) {
            ship.blinkTime--;
            if (ship.blinkTime == 0) {
                ship.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS);
                ship.blinkNum--;
            }
        }
        
    } else {
        //draw explosion
        ctx.fillStyle = "darkred";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.7, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.4, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 1.1, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.8, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r * 0.5, 0, Math.PI * 2, false);
        ctx.fill();
    }
    

    if (SHOW_BOUNDING) {
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.r, 0, Math.PI * 2, false);
        ctx.stroke();
    }

    //draw lasers
    for(let i = 0; i< ship.lasers.length; i++) {
        if (ship.lasers[i].explodeTime ==0) {
            ctx.fillStyle = "salmon";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, SHIP_SIZE / 15, 0, Math.PI * 2, false);
            ctx.fill();
        } else {
            ctx.fillStyle = "orangered";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.75, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "salmon";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.5, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.fillStyle = "pink";
            ctx.beginPath();
            ctx.arc(ship.lasers[i].x, ship.lasers[i].y, ship.r * 0.25, 0, Math.PI * 2, false);
            ctx.fill();
        }
    }
    
    //detect laser hit asteroids
    let ax, ay, ar, lx, ly;
    for (let i = roids.length -1; i >= 0; i--) {

        //grab asteroids props
        ax = roids[i].x;
        ay = roids[i].y;
        ar = roids[i].r;

        //loop over the lasers
        for (let j = ship.lasers.length - 1; j >= 0; j--) {
            lx = ship.lasers[j].x;
            ly = ship.lasers[j].y;

            //detect hits
            if (ship.lasers[j].explodeTime == 0 && distBetweenPoints(ax, ay, lx, ly) < ar) {

                //remove roid
                destroyAsteroid(i);
                ship.lasers[j].explodeTime = Math.ceil(LASER_EXPLODE_DUR * FPS);
                break;
            }
        }
    }

    //check for asteroid collisions
    if (!exploding) {
        if (ship.blinkNum == 0) {
            for (let i = 0; i < roids.length; i++) {
                if(distBetweenPoints(ship.x, ship.y, roids[i].x, roids[i].y) < ship.r + roids[i].r) {
                    explodeShip();
                    destroyAsteroid(i);
                    break;
                }
            }
        }
        
        //rotate ship
        ship.a += ship.rot;

        //move ship
        ship.x += ship.thrust.x;
        ship.y += ship.thrust.y;
    } else {
        ship.explodeTime--;

        if (ship.explodeTime === 0) {
            ship = newShip();
        }
    }
    

    

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

    //move lasers
    for(let i = ship.lasers.length - 1; i >=0; i--) {
        //check distanve travelled
        if (ship.lasers[i].dist > LASER_DIST * canv.width) {
            ship.lasers.splice(i, 1);
            continue;
        }

        //handle explosion
        if (ship.lasers[i].explodeTime > 0) {
            ship.lasers[i].explodeTime--;

            //destroy the laser after the duration is up
            if (ship.lasers[i].explodeTime == 0) {
                ship.lasers.splice(i,1);
                continue;
            }
        } else {
            //move laser
            ship.lasers[i].x += ship.lasers[i].xv;
            ship.lasers[i].y += ship.lasers[i].yv;

            //calculate distance travelled
            ship.lasers[i].dist += Math.sqrt(Math.pow(ship.lasers[i].xv, 2) + Math.pow(ship.lasers[i].yv, 2));
        }

        

        

        //handle edge
        if (ship.lasers[i].x < 0) {
            ship.lasers[i].x = canv.width;
        } else if (ship.lasers[i].x > canv.width) {
            ship.lasers[i].x = 0;
        }
        if (ship.lasers[i].y < 0) {
            ship.lasers[i].y = canv.height;
        } else if (ship.lasers[i].y > canv.heighth) {
            ship.lasers[i].y = 0;
        }
    }

    for (let i = 0; i < roids.length; i++) {
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
    
    
    let x, y, r, a, vert, offs;
    for(let i = 0; i < roids.length; i++) {
        //draw roids
        ctx.strokeStyle = "grey";
        ctx.lineWidth = SHIP_SIZE / 20;
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

        if (SHOW_BOUNDING) {
            ctx.strokeStyle = "lime";
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2, false);
            ctx.stroke();
        }
    }
}