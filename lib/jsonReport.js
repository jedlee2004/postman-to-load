const fs = require('fs');
const path = require('path');

module.exports = class JsonFiles {
  writeJsonToFile(json, fileName) {
    const filePath = path.join(__dirname, `../reports/${fileName}.json`);
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) { fs.mkdirSync(dir); }

    try {
      fs.appendFileSync(
        filePath,
        JSON.stringify(json, null, 4),
        'utf8',
        { flags: 'a+' },
      );
    } catch (err) {
      console.error('Error', err.stack);
    }
  }

  readJSONFile(file, logDir) {
    const dir = logDir ? path.join(__dirname, `../../logs/${file}.json`) : path.dirname(file);

    if (fs.existsSync(dir)) {
      const data = fs.readFileSync(dir, 'utf8');
      try {
        const jsonObj = JSON.parse(data);
        return jsonObj;
      } catch (err) {
        console.error(`Failed to read JSON file with: ${err}`);
      }
    }

    console.error(`${file} does not exist`);
    return false;
  }

  overWriteFile(content, fileName) {
    const filePath = path.join(__dirname, `../../logs/${fileName}.json`);
    const options = { encoding: 'utf8', flag: 'w' };
    const data = JSON.stringify(content, null, 4);
    fs.writeFileSync(filePath, data, options);
  }
}
