const fs = require('fs');
const Transform = require('./transforms');

module.exports = class CollectionParser extends Transform {
  constructor(collectionPath, dataFilePath, loadOptions) {
    super();
    this.collectionPath = collectionPath || null;
    this.dataFilePath = dataFilePath || null;
    this.loadOptions = loadOptions;
  }

  /**
   * From Postman collection constructs header object
   * @param {object} header 
   * @param {object} dataObj 
   */
  buildHeaderObject(header, dataObj) {
    let headerObj = {};
    for( let index in header) {
      const key = header[index].key;
      const value = header[index].value;
      headerObj[key] = value;
    }

    return this.mapDataToObject(headerObj, dataObj);
  }

  /**
   * From Postman collection constructs the request body
   * @param {object} body 
   * @param {object} dataObj 
   */
  buildPostBodyObject(body, dataObj) {
    if (typeof body === 'string') {
      body = JSON.parse(body);
      return this.mapDataToObject(body, dataObj);
    }

    else if (body.mode === 'urlencoded') {
      const postBody = body.urlencoded;
      const bodyObj = {};
      for( let index in postBody) {
        const key = postBody[index].key;
        const value = postBody[index].value;
        bodyObj[key] = value;
      }

      return this.mapDataToObject(bodyObj, dataObj);
    }

    else if (body.mode === 'raw' && body.raw !== '') {
      return this.mapDataToObject(body.raw, dataObj);
    }
  }

  /**
   * From the Postman collection maps out the necessary properties to an option object and stores in an array.
   * Option object is to define the load test
   * @param {object} collectionJSON 
   * @param {object} dataObj 
   * @returns {array} : returns an array of objects representing the options for running each load test
   */
  buildLoadTestOptions(collectionJSON, dataObj) {
    const options = collectionJSON.item.map(index => {
      const optionConfig = {
        name: index.name,
        url: this.mapEnvVariables(index.request.url.raw),
        method: index.request.method,
        headers: this.buildHeaderObject(index.request.header, dataObj),
        body: this.buildPostBodyObject(index.request.body, dataObj),
      };

      return Object.assign(optionConfig, this.loadOptions);
    });

    return options;
  }

  /**
   * Parses Postman json file into a js object and converts it into an array of options for the load tests
   * @param {string} jsonPath: path to the Postman collection file
   * @param {object} dataObj: object containing data to be mapped to the postman collection via string replacement for {{}}
   */
  parseCollection(jsonPath, dataObj) {
    const file = fs.readFileSync(jsonPath, 'utf8');
    const obj = JSON.parse(file);
    return this.buildLoadTestOptions(obj, dataObj);
  }
}