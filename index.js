const CollectionParser = require('./lib/collectionParser');
const Controller = require('./lib/controller');
require('dotenv').config();

// class PostmanToLoad {
//   constructor(collectionPath, dataFilePath, props) {
//     this.controller = new Controller(props);
//     this.collectionParser = new CollectionParser(collectionPath, dataFilePath, props);
//   }
// }

exports.CollectionParser = CollectionParser;
exports.Controller = Controller;

//TODO: Callbacks to generate headers additional headers not present in postman collection
//TODO: Callbacks to handle data that needs to be retrieved and set to the data object or env variable before running load
//TODO: Setup events to allow for reporters to be plugged in
//TODO: Handle array of load options with name property and match to load test to be ran via this property
//TODO: Map load profiles to names via listing collection names under array property of the profile object
//TODO: Parse through results and check against object to see if it has an empty matching property if match set property value to that of the result

