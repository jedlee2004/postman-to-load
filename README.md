# POSTMAN to Load Tests
Parses Postman collections into an array of options that can be ran through the Load Test module (https://www.npmjs.com/package/loadtest)

## Installing
Using npm: 
```
npm install postman-to-load
```

Using bower:
```
bower install postman-to-load
```

## Postman To Load API:
### Collection Parser Methods:
* buildHeaderObject
* buildPostBodyObject
* buildLoadTestOptions
* parseCollection
 - path: path to the postman json collection to parse
 - dataObj: object that contains properties whose keys match the postman collection parameters {{}}. Will map the dataObj values to the collections parameters.
 - Main function that leverages the above functions to create headers, post body, load options and map them to an array of objects that represent the options for executing each load test. 
 - 

### Controller Methods:
* statusCallback
* resultHandler
* loadTest
* loadTestViaIteration
* parallelLoadExecution

### Load Test Options:
Below is an example of how to configure the load test:
```
  const load = require(esl
  function resultHandler(results) {
    return results;
  }

  function statusCallback(error, result, latency){
    const status = result.statusCode;
    const body = JSON.parse(result.body);
    const statusObj = {
      data: body.data, 
      status, 
      latency,
      duration: result.requestElapsed,
      index: result.requestIndex,
      instance: result.instanceIndex,
    };

    if (error) {
      statusObj.error = error
    }
    
    return statusObj;
  };

  const loadTestOptions = {
    concurrency: 1,
    maxRequests: 20,
    contentType: 'application/json',
    requestsPerSecond: 1,
    maxSeconds: 20,
    quiet: true,
    resultHandler,
    statusCallBack,
  };
  ```

  - concurrency: How many clients running in parallel.
  - maxRequests: Maximum number of requests the load test will execute. Once reached test will end. 
  - requestsPerSecond: How many requests each client sends per second. IE: if you have a concurrency of 2 and rps of 5 you will send 10 requests sent each second.
  - maxSeconds: Maximum number of seconds the test will run. After this duration requests will cease.
  - resultHandler: callback function that can be used to enhance how the test results are handled. Set this property if you want custom result handling.
  - statusCallBack: callback function that is defined by default, but can be overridden if user sets this property as a custom callback function. 

After  requiring the module and configuring the load test options we can parse our Postman Json collections:
```
  const parseCollections = new Index.CollectionParser(null, null, props);
  const jsonPath = path.resolve(__dirname, 'EXHWorkingCollection.postman_collection.json');
  const options = parseCollections.parseCollection(jsonPath, dataObj);
```
#### parseCollection:
Function that takes a path to the Postman collection and a js object that maps out the postman parameters that need to be resolved. 
It will return an array of options in a format that can be used to execute the load tests. 

#### Collection mapping: 
```
  const dataObj = {
    'my-api-key': process.env.MY_KEY_DEV,
    username: 'LoadTestMe',
    password: 'Crashed',
  };
```

#### Running a single load test from the option array created from the postman collection
```
  const postLoad = new Index.Controller(props);
  const result = await load.loadTest(options[1]);
```
#### Running the array of options created by the postman collection
```
  const result = await load.loadTestViaIteration(options);
```
#### Running an array of load tests stored as promises concurrently
```
  const result = await load.parallelLoadExecution(promiseArray);
```