const util = require('util');
const load = require('loadtest');
const Report = require('../lib/jsonReport');

module.exports = class Controller  { 
  constructor(props) {
    this.concurrency = props.concurrency;
    this.maxRequests = props.maxRequests;
    this.contentType = props.contentType;
    this.requestPerSecond = props.requestPerSecond;
    this.maxSeconds = props.maxSeconds;
    this.quiet = props.quiet || true;
    this.userStatusCallback = props.statusCallback || null;
    this.userResultHandler = props.resultHandler || null;
    this.dataObj = null;
  }

  get loadOptions() {
    return {
      concurrency: this.concurrency,
      maxRequests: this.maxRequests,
      contentType: this.contentType,
      requestsPerSecond: this.requestPerSecond,
      maxSeconds: this.maxSeconds,
      statusCallBack: this.statusCallback,
      quiet: this.quiet,
    };
  }

  /**
   * Converts loadtest function into a promise
   */
  get promiseLoad() {
    return util.promisify(load.loadTest);
  }

  /**
   * Default handler for each http call status results
   * If user passes function into props.userResultHandler in the constructor will override this function
   * @param {*} error 
   * @param {*} result 
   * @param {*} latency 
   */
  statusCallback(error, result, latency) {
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

    if (body.data) {
      this.resolveParametersFromResults(body.data, this.dataObj);
    }

    return statusObj;
  };

  /**
   * Generates json report by default but takes callback function to allow user to add additional result handling
   * TODO: Build out result handler to write reports, and inherit user defined result handler
   * TODO: Dynamically resolve name for json report
   * @param {object} results 
   * @param {function} userHandler 
   */
  resultHandler(results, userHandler = this.userResultHandler) {
    const report = new Report();
    report.writeJsonToFile(results, 'Load-Test-Report');
    userHandler(results);
  }

  /**
   * Takes the dataObj and finds properties that have no value defined. These should represent values needing resolution 
   * by other rest calls. Then maps the matching property in response body to this property to be used in later tests.
   * @param {*} responseBody 
   * @param {*} dataObj 
   */
  resolveParametersFromResults(responseBody, dataObj){
    for(let key in dataObj) {
      const value = dataObj[key];
      if (value === '' || value === null) {
        dataObj[key] = responseBody[key] ? responseBody[key] : null;
        global.LoadData[key] = responseBody[key];
      }
    }
    
    return dataObj;
  }

  /**
   * Runs the load test defined by the options object. 
   * @param {object} options 
   * @param {function} cb : intended to allow user to retrieve unresolved data via async http calls
   */
  async loadTest(options, cb) {
    if (cb) await cb();
    console.log(`...LOAD TESTING: ${options.name}\n...URL: ${options.url}\n`)
    options.statusCallback = this.userStatusCallback || this.statusCallback;
    const result = await this.promiseLoad(options);
    result.name = options.name;
    result.url = options.url;
    this.resultHandler(result);
    return result;
  }

  /**
   * Iterates over an array of load test options running each test
   * @param {array} optionsArray 
   */
  async loadTestViaIteration(optionsArray) {
    const results = [];
    for (let index in optionsArray) {
      const res = await this.loadTest(optionsArray[index]);
      results.push(res);
    }
    return results;
  }

  /**
   * Executes all load tests pass as an array of promises concurrently
   * @param {array} promiseArray 
   */
  async parallelLoadExecution(promiseArray) {
    const results = await Promise.all(promiseArray);
    return results;
  }

  async delayedLoadExecution(optionsArray, delay) {
    const results = [];
    for (let index in optionsArray) {
      const res = setTimeout(() => await this.loadTest(optionsArray[index]), delay);
      results.push(res);
    }
    return results;
  }
}
