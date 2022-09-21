const fs = require('fs');
const readline = require('readline');
const stream = require('stream');
const NodeCache = require('node-cache');
const NodeGeocoder = require('node-geocoder');

// Currently, my google key is not active since my billing account need attention and GCP takes 48 hours to check credit card and all.
// So, I am using open-source available api key of openstreetmap 
// const options = {
//     provider: 'google',
//     apiKey: 'AIzaSyAiXjlLRIAZtK4c5O4CP_b0wLzNOJ4MOGY'
// };

const options = {
    provider:'openstreetmap'
}

const geocoder = NodeGeocoder(options);

// to read file line by line
function readLines({ input }) {
  const output = new stream.PassThrough({ objectMode: true });
  const rl = readline.createInterface({ input });
  rl.on("line", line => { 
    output.write(line);
  });
  rl.on("close", () => {
    output.push(null);
  }); 
  return output;
}

// I am assuming that input.txt is place is the same folder as script
const input = fs.createReadStream("./input.txt");

// Declaring an In-Memory Cache to cache results.
const myCache = new NodeCache();

// Google api will take time, therefore we are requesting asynchronously
(async () => {
  for await (const line of readLines({ input })) {
    
    //Finding in in-memory cache
    let res = myCache.get(line);

    //If not found, calling API
    if(res == undefined){
        res = await geocoder.geocode(line);
        myCache.set(line, res);
    }
    
    // since openstreetmap will search for all places having searched places, Right now, I am assuming 0th index one is the needed one.
    if(res[0])
        res = res[0];
    
    if(res.longitude != undefined && res.latitude != undefined)
    {
        console.log("Processing ...");
        console.log(res.longitude + ", " + res.latitude);

        // Assuming output.txt is empty or not formed, we will start filling fresh data to it.
        fs.appendFile("./output.txt", res.longitude + ", " + res.latitude + "\n", function(err){
            if(err){
                console.log("Error " , err , " in writing to file");
            }
        })
    }    
  }
})();