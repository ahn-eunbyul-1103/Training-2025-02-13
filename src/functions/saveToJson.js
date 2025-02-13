import fs from 'fs';
import path from 'path';

function saveToJSON(data, callback) {
  const __dirname = path.resolve(); // commonjs -> module 변경으로 인해 추가
  const filePath = path.join(__dirname, "students.json");
  fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8", function (error) {
    if (error) {
      callback(error);
    } else {
      callback(null);
    }
  });
}

export default saveToJSON;
