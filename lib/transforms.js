module.exports = class Transforms {
  // 
  /**
   * Maps environment variables to string where postman parameters are defined by {{}}
   * @param {string} stringValue 
   * @param {object} dataObj 
   */
  replaceStringValues(stringValue, dataObj) {
    let original = stringValue;
    const hasSubValues = stringValue.includes('{') && stringValue.includes('}');
    if (hasSubValues) 
    {
      stringValue = (() => {
        const regex = /\{\{.*?\}\}/g;
        const matches = original.match(regex);
      
        matches.forEach(index => {
          const valueToReplace = index.replace(/[^\-\_\w\s]/gi, '').toLowerCase();
          const replacementValue = dataObj[valueToReplace];

          if (!replacementValue) {
            console.error(`ERROR: Missing an environment variable:\n Please create an environment variable for ${valueToReplace}`);
            throw new Error(`ERROR: Missing environment variable: ${valueToReplace}`);
          }

          original = original.replace(index, replacementValue);
        });

        return original;
      })();
    } 

    return stringValue;
  }

  /**
   * Replaces parts of string containing {{}} with environment variables whose key matches the string inside {{}}
   * @param {string} stringVal
   */
  mapEnvVariables(stringVal) {
    let string = stringVal;
    const hasSubValues = stringVal.includes('{') && stringVal.includes('}');
    if (hasSubValues) {
      stringVal = (() => {
        const regex = /\{\{.*?\}\}/g;
        const matches = string.match(regex);
      
        matches.forEach(index => {
          const valueToReplace = index.replace(/[^\-\_\w\s]/gi, '').toUpperCase();
          const replacementValue = process.env[valueToReplace];

          if (!replacementValue) {
            console.error(`ERROR: Missing an environment variable:\n Please create an environment variable for ${valueToReplace}`);
            throw new Error(`ERROR: Missing environment variable: ${valueToReplace}`);
          }

          string = string.replace(index, replacementValue);
        });

        return string;
      })();
    } 

    return stringVal;
  }

  /**
   * Replaces part of string that matches postman parameter {{}} with matching property from dataObj
   * @param {string} indexValue 
   * @param {object} dataObj 
   */
  replacePropertyValues(indexValue, dataObj) {
    const regex = /\{\{.*?\}\}/g;
    const matches = indexValue.match(regex);
    
    if (matches) {
      matches.forEach(index => {
        const valueToReplace = index.replace(/[^\-\_\w\s]/gi, '').toLowerCase();
        const replacementValue = dataObj[valueToReplace] || null;

        if (!replacementValue) {
          console.error(`ERROR: Missing associated test data in object:\n Please add in the test data under the following property: ${valueToReplace}`);
          throw new Error(`ERROR: Missing object property to map to parameter: ${valueToReplace}`);
        }

        if (typeof replacementValue === 'string') index = index.replace(index, replacementValue);
        if (typeof replacementValue === 'object') index = replacementValue;

        indexValue = index;
      });
    } 

    return indexValue;
  }

  /**
   * Validates if inputted object/string contains the specified delimiter or array of delimiters
   * @param {object || string} input
   * @param {object || string} delimiter
   */
  containsDelimiter(input, delimiter) {
    let containsDelimiter = false;

    if (Array.isArray(delimiter)) {
      delimiter.forEach(value => {
        containsDelimiter = this.containsDelimiter(input, value) ? true: containsDelimiter;
      });
    }

    else if (typeof input === 'object') {
      for (let key in input) {
        if (typeof input[key] === 'string') containsDelimiter = input[key].includes(delimiter) ? true : false;
        if (typeof input[key] === 'object') this.containsDelimiter(input[key], delimiter);
      }
    } 

    else if (typeof input === 'string') {
      containsDelimiter = input.includes(delimiter);
    }

    return containsDelimiter;
  }

  /**
   * Iterates through object replacing postman parameter notation {{}}. Maps out parameter names to those stored in a flat json file.
   * TODO: handle array 
   * @param {object} body: object with potential strings containing {{}} for replacement
   * @param {object} dataObj: object that maps data to the body
   */
  mapDataToObject(body, dataObj) {
    for (const key in body) {
      if (typeof body[key] === 'object') {
        const subObject = body[key];
        body[key] = this.mapDataToObject(subObject, dataObj);
      } 

      if (typeof body[key] === 'string') {
        const hasSubValues = body[key].includes('{') && body[key].includes('}');
        if (hasSubValues) {
          body[key] = this.replacePropertyValues(body[key], dataObj);
        } 
      }
    }

    return body;
  }
}