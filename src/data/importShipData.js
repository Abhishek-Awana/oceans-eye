import React from 'react';
import csv from 'csv-parser';

const importShipData = () => {
  return new Promise((resolve, reject) => {
    const shipData = [];
    const filePath = './shipData.csv'; // Replace with the actual path to your CSV file

    fetch(filePath)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch CSV file');
        }
        return response.text();
      })
      .then(text => {
        // Parse CSV text
        const rows = text.trim().split('\n');
        const headers = rows[0].split(',');
        for (let i = 1; i < rows.length; i++) {
          const values = rows[i].split(',');
          const entry = {};
          for (let j = 0; j < headers.length; j++) {
            entry[headers[j]] = values[j];
          }
          shipData.push(entry);
        }
        resolve(shipData);
      })
      .catch(error => {
        reject(error);
      });
  });
};

export default importShipData;
