var fs = require('fs');
main();


function getNewCar(){
    return {x:0, y:0, freeAt:0, rides_completed:[]};
}

function getDistance(x1,y1,x2,y2){
    return Math.abs(x1-x2) + Math.abs(y1-y2);
}

function orderRides(ride1,ride2){
    return ( (ride1.start === ride2.start) ? (ride2.distance - ride1.distance) : (ride1.start - ride2.start));
}

function orderRidesByDistance(ride1,ride2){
    return (ride1.xi + ride1.yi) - (ride2.xi + ride2.yi);
}


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

function getClosestCar(ride,availableCars){
    if (availableCars != null && availableCars.length > 0){
        let minDistance = 999999999999999;
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

function getBonusCar(ride,availableCars){
    for(car of availableCars){
        let distance = Math.abs(ride.xi - car.x) + Math.abs(ride.yi - car.y);
        if (ride.start >= car.freeAt + distance){
            return car;
        }
    }
    return null;
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

function program(file){
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
        let rideArray = rideLine.split(" ");
        rideDistance = getDistance(parseInt(rideArray[0]),parseInt(rideArray[1]),parseInt(rideArray[2]),parseInt(rideArray[3]));
        rides.push({
            i: index,
            xi:parseInt(rideArray[0]),
            yi:parseInt(rideArray[1]),
            xf:parseInt(rideArray[2]),
            yf:parseInt(rideArray[3]),
            start:parseInt(rideArray[4]),
            end: parseInt(rideArray[5]),
            distance: rideDistance
        })
    })
    for(let i = 0; i < numCars; i++){
        cars.push(getNewCar());
    }
    rides.sort(orderRides);
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
        let file = fs.readFileSync(filename, 'utf8');
        let output = program(file.trim());
        writeFile(filename + ".final.out",output);
    })
}