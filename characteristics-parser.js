const fs = require('fs');
const csv = require('@fast-csv/parse');
const { Characteristics } = require("./schema/characteristics");

let batchSize = 100;
let currentCharacteristicsCounter = 0

function readCharacteristics (toSkip) {
  toSkip = toSkip ? toSkip : 0
  let data = [];
  const readStream = fs.createReadStream("./characteristics.csv")
    .pipe(csv.parse({ headers: true, skipRows: toSkip }))
    .on("error", (error) => console.error(error))
    .on("data", (row) => {
      row.id = parseInt(row.id);
      row.product_id = parseInt(row.product_id);
      console.log(row)
      Characteristics.insertMany(row)
      .then(() => {
        // currentCharacteristicsCounter = row.id
        // readCharacteristics(currentCharacteristicsCounter);
        // readStream.destroy();
      })

      .catch(error => {
        console.log(error);
      })
      // data.push(row);

      // if (row.id === batchSize) {
      //   currentCharacteristicsCounter = row.id
      //   console.log(data)
      //   Characteristics.insertMany(data)
      //   .then(res => {
      //     batchSize += 100;
      //     data = [];
      //     readCharacteristics(currentCharacteristicsCounter);
      //     readStream.destroy();
      //   })
      //   .catch(err => {
      //     console.log(err);
      //   });
      // } else if (row.id === 100430) {
      //   Characteristics.insertMany(data)
      //   .then(res => {
      //   console.log('done');
      //   readStream.destroy();
      //   })
      //   .catch( err => {
      //     console.log(err)
      //   })
      // }
    })
    .on("end", (rowCount) => console.log('this is the end', rowCount));
}

module.exports = { readCharacteristics }