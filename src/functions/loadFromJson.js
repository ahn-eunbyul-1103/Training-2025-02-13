import saveToJSON from '../functions/saveToJson.js';
import students from '../storage/studentsData.js';
import fs from 'fs';
import path from 'path';

function loadFromJSON(callback) {
  const __dirname = path.resolve(); // commonjs -> module 변경으로 인해 추가
  const filePath = path.join(__dirname, "students.json");
  fs.readFile(filePath, "utf8", function (error, data) {
    if (error) {
      // ? filePath에 students.json 파일이 존재하지 않는다면
      if (error.code === "ENOENT") {
        saveToJSON(students, function (saveError) {
          if (saveError) {
            callback(saveError);
          } else {
            callback(null, students);
          }
        });
      } else {
        callback(error);
      }
    } else {
      callback(null, JSON.parse(data));
    }
  });
}

export default loadFromJSON;