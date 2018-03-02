var fs = require('fs');
main();

// Create a new Car at (0,0)
function getNewCar(){
    return {x:0, y:0, freeAt:0, rides_completed:[]};
}

//rideArray is [xi,xf,yi,yf,startTime,endTime]
function getNewRide(index,rideArray){
    return{
        i: index,
        xi: rideArray[0],
        yi: rideArray[1],
        xf: rideArray[2],
        yf: rideArray[3],
        start: rideArray[4],
        end: rideArray[5],
        distance: getDistance(rideArray[0],rideArray[1],rideArray[2],rideArray[3])
    }
}

//Calculate the distance between P1 and P2
function getDistance(x1,y1,x2,y2){
    return Math.abs(x1-x2) + Math.abs(y1-y2);
}
//Compare rides by start Time. If start time is equal, compare by ride distance.
function compareRides(ride1,ride2){
    return ( (ride1.start === ride2.start) ? (ride2.distance - ride1.distance) : (ride1.start - ride2.start));
}

//Get array of cars that can process a given ride and finish it until the ride end time.
function getAvailableCars(ride,allCars){
    let availableCars = [];
    allCars.forEach(car => {
        let distanceToStartPoint = getDistance(ride.xi,ride.yi,car.x,car.y);
        if (car.freeAt + distanceToStartPoint + ride.distance <= ride.end){
            availableCars.push(car);
        }
    });
    return availableCars;
}

//Get the car that is closest to the beggining of the given ride.
function getClosestCar(ride,availableCars){
    if (availableCars != null && availableCars.length > 0){
        let minDistance = Number.MAX_SAFE_INTEGER;
        let closestCarIndex = -1;
        availableCars.forEach((car,i) => {
            let distance = getDistance(ride.xi,ride.yi,car.x,car.y);
            if (distance < minDistance){
                closestCarIndex = i;
                minDistance = distance;
            }
        });
        return availableCars[closestCarIndex];
    }
    return null;
}

//Get a car that can get bonus points or null if there is none.
function getBonusCar(ride,availableCars){
    let possibleBonusCar = null;
    for(car of availableCars){
        let distanceToRide = Math.abs(ride.xi - car.x) + Math.abs(ride.yi - car.y);
        let arrivalTime = car.freeAt + distanceToRide;
        if (ride.start === arrivalTime){
            return car;
        }
        else if (possibleBonusCar == null && (ride.start > arrivalTime)){ //car will wait
            possibleBonusCar = car;
        }
    }
    return possibleBonusCar; //might be null
}

function assignRidesToCars(rides,cars){
    rides.forEach(ride =>{
        let bestCar = null;
        let availableCars = getAvailableCars(ride,cars);
        let bonusCar = getBonusCar(ride,availableCars);
        if (bonusCar != null){
            bestCar = bonusCar;
        }else{
            bestCar = getClosestCar(ride, availableCars);
        }
        if (bestCar != null){
            assignRideToCar(ride,bestCar);
        }
    });
}
//Process data to output to a file.
function output(cars){
    return cars.map(car => {
        return [car.rides_completed.length, ...car.rides_completed]
    }).join('\r\n').replace(/,/g,' ');
}

function assignRideToCar(ride,car){

    let distanceTraveled = getDistance(ride.xi,ride.yi,car.x,car.y) + ride.distance;
    car.x = ride.xf;
    car.y = ride.yf;
    car.rides_completed.push(ride.i);
    car.freeAt = Math.max(ride.start + ride.distance, car.freeAt + distanceTraveled);
}

function solve(file){
    let rides = [];
    let cars = [];
    let lines = file.split("\n");
    let firstLine = lines[0].split(" ");
    let numCars = firstLine[2];
    let numRides = firstLine[3];
    let bonus = firstLine[4];
    let maxSteps = firstLine[5];
    let ridesDescription = lines.slice(1);
    ridesDescription.forEach((rideLine,index) =>{
        let rideArray = rideLine.split(" ").map(elem => parseInt(elem));
        rides.push(getNewRide(index,rideArray));
    })
    for(let i = 0; i < numCars; i++){
        cars.push(getNewCar());
    }
    rides.sort(compareRides);
    assignRidesToCars(rides,cars);
    return output(cars);

}

function writeFile(filename,data){
    fs.writeFile(filename, data, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    }); 
}
 
function main(){
    let fileNames = ["a_example.in","b_should_be_easy.in","c_no_hurry.in","d_metropolis.in","e_high_bonus.in"];
    fileNames.forEach(filename => {
        let file = fs.readFileSync("inputs/" + filename, 'utf8');
        let output = solve(file.trim());
        writeFile("./outputs/" + filename + ".out",output);
    })
}