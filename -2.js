const axios = require('axios');
const express = require('express');
const { hostname } = require('os');
const port = process.env.PORT || 5000;
const app = express();
const cheerio = require('cheerio');

const base = 'https://www.warframe.com/droptables';

const resData = {}; // Use an object to store data with IDs as keys

// Function to fetch HTML content
async function fetchHTMLContent() {
  try {
    const response = await axios.get(base);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Function to parse HTML and extract data for a specific ID
function parseHTMLForID(html, id) {
  const $ = cheerio.load(html);
  const tables = [];

  // Check if the ID is "missionRewards"
  if (id === 'missionRewards') {
    const missionRewardsTable = $(`#${id}`);

    if (missionRewardsTable.length === 0) {
      return tables; // Return empty array if "missionRewards" not found
    }

    missionRewardsTable.find('th[colspan="2"]').each((index, heading) => {
      const tableName = $(heading).text().trim();
      const subtable = [];

      let currentRow = $(heading).closest('tr').next(); // Skip the header row

      while (currentRow.length && !currentRow.hasClass('blank-row')) {
        const resource = currentRow.find('td').eq(0).text().trim();
        const rate = currentRow.find('td').eq(1).text().trim();

        subtable.push({ resource, rate });

        currentRow = currentRow.next(); // Move to the next row
      }

      tables.push({ tableName, data: subtable });
    });
  }

  return tables;
}

// Route to fetch and return data for a specific ID
app.get('/fetch/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const html = await fetchHTMLContent();
    const tables = parseHTMLForID(html, id);
    
    if (!resData[id]) {
      resData[id] = []; // Initialize data array for this ID if it doesn't exist
    }

    resData[id].push(...tables); // Add the tables to resData for the specific ID
    res.json(resData[id]); // Return the data for the specific ID
  } catch (error) {
    next(error);
  }
});

// Error handling middleware (should be at the end)
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json('Error fetching data');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`http://${hostname}:${port}`);
});

// const axios = require('axios');
// const express = require('express');
// const { hostname } = require('os');
// const fs = require('fs').promises; // Use fs.promises for async file operations
// const path = require('path');
// const port = process.env.PORT || 5000;
// const app = express();
// const cheerio = require('cheerio');

// const base = 'https://www.warframe.com/droptables';

// // Function to fetch HTML content
// async function fetchHTMLContent() {
//   try {
//     const response = await axios.get(base);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// }

// // Function to parse HTML and extract data
// // function parseHTML(html) {
// //   const $ = cheerio.load(html);
// //   const tables = [];
// //   $('li a[href^="#"]').each((index, anchorElement) => {
// //     const href = $(anchorElement).attr('href').replace('#', '');
// //     const matchingH3 = $(`h3[id="${href}"]`);

// //     if (matchingH3.length > 0) {
// //       const currentTable = {
// //         name: matchingH3.text().trim(),
// //         data: [],
// //         id: href, // Add id attribute
// //       };

// //       // Append the table (with <th> tags as headers and <tr> tags as values) as a subtable
// //       matchingH3.next('table').each((index, tableElement) => {
// //         const subtable = [];
// //         $(tableElement).find('tr').each((i, trElement) => {
// //           const row = [];
// //           $(trElement).find('th, td').each((j, cellElement) => {
// //             row.push($(cellElement).text().trim());
// //           });
// //           subtable.push(row);
// //         });
// //         currentTable.data.push(subtable);
// //       });

// //       tables.push(currentTable);
// //     }
// //   });

// //   return tables;
// // }

// // Function to save data to JSON file
// async function saveDataToJson(data) {
//   const jsonData = JSON.stringify(data, null, 2);
//   await fs.writeFile('tables.json', jsonData, { flag: 'w' });
// }

// // Function to divide data into separate JSON files


// function parseHTML(html) {
//   const $ = cheerio.load(html);
//   const missions = [];

//   // Find all tables within the #missionRewards section
//   $('#missionRewards table').each((index, tableElement) => {
//     const mission = {
//       name: '', // Mission name
//       rotations: [], // Rotations within the mission
//     };

//     // Get the mission name from the table's first <th> tag
//     mission.name = $(tableElement).find('th[colspan="2"]').text().trim();

//     // Process rows within the table starting from the second row
//     let rows = $(tableElement).find('tr').slice(1); // Exclude the first row
//     let currentRotation = null;

//     rows.each((i, trElement) => {
//       const columns = $(trElement).find('td');

//       // Check if it's a new rotation
//       if (columns.length === 2 && columns.eq(0).text().startsWith('Rotation')) {
//         if (currentRotation !== null) {
//           mission.rotations.push(currentRotation);
//         }

//         currentRotation = {
//           name: columns.eq(0).text().trim(),
//           rewards: [],
//         };
//       } else if (currentRotation !== null) {
//         // Add rewards to the current rotation
//         const reward = columns.map((_, element) => $(element).text().trim()).get();
//         currentRotation.rewards.push(reward);
//       }
//     });

//     // Push the last rotation
//     if (currentRotation !== null) {
//       mission.rotations.push(currentRotation);
//     }

//     // Push the mission to the missions array
//     missions.push(mission);
//   });

//   return missions;
// }

// // Route to fetch and process data


// // Route to divide data into separate JSON files
// app.get('/fetchMissionRewards', async (req, res, next) => {
//   try {
//     const html = await fetchHTMLContent();
//     const missionRewards = parseHTML(html);
//     await saveDataToJson(missionRewards);
//     res.json(missionRewards);
//   } catch (error) {
//     next(error);
//   }
// });

// // Error handling middleware (should be at the end)
// app.use((err, req, res, next) => {
//   console.error('Error:', err);
//   res.status(500).json('Error fetching data');
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
//   console.log(`http://${hostname}:${port}`);
// });

//!v13 getting there 
// const axios = require('axios');
// const express = require('express');
// const { hostname } = require('os');
// const fs = require('fs').promises; // Use fs.promises for async file operations
// const path = require('path');
// const port = process.env.PORT || 5000;
// const app = express();
// const cheerio = require('cheerio');

// const base = 'https://www.warframe.com/droptables';

// // Function to fetch HTML content
// async function fetchHTMLContent() {
//   try {
//     const response = await axios.get(base);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// }

// // Function to parse HTML and extract data
// function parseHTML(html) {
//   const $ = cheerio.load(html);
//   const tables = [];
//   $('li a[href^="#"]').each((index, anchorElement) => {
//     const href = $(anchorElement).attr('href').replace('#', '');
//     const matchingH3 = $(`h3[id="${href}"]`);

//     if (matchingH3.length > 0) {
//       const currentTable = {
//         name: matchingH3.text().trim(),
//         data: [],
//         id: href, // Add id attribute
//       };

//       // Append the table (with <th> tags as headers and <tr> tags as values) as a subtable
//       matchingH3.next('table').each((index, tableElement) => {
//         const subtable = [];
//         $(tableElement).find('tr').each((i, trElement) => {
//           const row = [];
//           $(trElement).find('th, td').each((j, cellElement) => {
//             row.push($(cellElement).text().trim());
//           });
//           subtable.push(row);
//         });
//         currentTable.data.push(subtable);
//       });

//       tables.push(currentTable);
//     }
//   });

//   return tables;
// }

// // Function to save data to JSON file
// async function saveDataToJson(data) {
//   const jsonData = JSON.stringify(data, null, 2);
//   await fs.writeFile('tables.json', jsonData, { flag: 'w' });
// }

// // Function to divide data into separate JSON files
// async function divideDataIntoFiles(data) {
//   // Create the dropTables folder if it doesn't exist
//   const folderPath = 'dropTables';
//   if (!fs.existsSync(folderPath)) {
//     await fs.mkdir(folderPath);
//   }

//   for (const item of data) {
//     const filename = path.join(folderPath, `${item.id}.json`); // Create a filename based on the ID
//     const jsonData = JSON.stringify(item, null, 2);
//     await fs.writeFile(filename, jsonData, { flag: 'w' });
//   }
// }

// // Route to fetch and process data
// app.get('/fetch', async (req, res, next) => {
//   try {
//     const html = await fetchHTMLContent();
//     const tables = parseHTML(html);
//     await saveDataToJson(tables);
//     res.json('Data saved to tables.json');
//   } catch (error) {
//     next(error);
//   }
// });

// // Route to divide data into separate JSON files
// app.get('/divide', async (req, res, next) => {
//   try {
//     const tables = JSON.parse(await fs.readFile('tables.json', 'utf8'));
//     await divideDataIntoFiles(tables);
//     res.json('Data divided into separate JSON files');
//   } catch (error) {
//     next(error);
//   }
// });

// // Error handling middleware (should be at the end)
// app.use((err, req, res, next) => {
//   console.error('Error:', err);
//   res.status(500).json('Error fetching data');
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
//   console.log(`http://${hostname}:${port}`);
// });

//!v12 failed
// const axios = require('axios');
// const express = require('express');
// const { hostname } = require('os');
// const fs = require('fs');
// const port = process.env.PORT || 5000;
// const app = express();
// const cheerio = require('cheerio');

// const base = 'https://www.warframe.com/droptables';

// app.get('/fetch', (req, res) => {
//     axios.get(base)
//         .then((response) => {
//             const html = response.data;
//             const $ = cheerio.load(html);
//             const tables = [];

//             let currentTable = null;

//             // Iterate over all table rows
//             $('table tr').each((rowIndex, rowElement) => {
//                 const rowData = [];

//                 // Check if the row is a table heading
//                 if ($(rowElement).find('th').length > 0) {
//                     // If a table is in progress, push it to the tables array
//                     if (currentTable) {
//                         tables.push(currentTable);
//                     }

//                     // Get the heading of the next table
//                     const heading = $(rowElement).find('th').text().trim();

//                     // Start a new table
//                     currentTable = { heading, data: [] };
//                 } else {
//                     // Iterate over cells in the row
//                     $(rowElement).find('td').each((cellIndex, cellElement) => {
//                         rowData.push($(cellElement).text().trim());
//                     });

//                     if (rowData.length > 0 && currentTable) {
//                         currentTable.data.push(rowData);
//                     }
//                 }
//             });

//             // Push the last table to the tables array
//             if (currentTable) {
//                 tables.push(currentTable);
//             }

//             // Write the tables data to a JSON file
//             const jsonData = JSON.stringify(tables, null, 2);
//             fs.writeFileSync('tables.json', jsonData, { flag: 'w' });

//             res.json('Data saved to tables.json');
//         })
//         .catch((error) => {
//             console.error('Error:', error);
//             res.status(500).json('Error fetching data');
//         });
// });

// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
//     console.log(`http://${hostname}:${port}`);
// });


//!v11 diiferent tables created
// const axios = require('axios');
// const express = require('express');
// const { hostname } = require('os');
// const fs = require('fs');
// const port = process.env.PORT || 5000;
// const app = express();
// const cheerio = require('cheerio');
// const path = require('path');

// const base = 'https://www.warframe.com/droptables';

// // Function to fetch HTML content
// async function fetchHTMLContent() {
//   try {
//     const response = await axios.get(base);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// }

// // Function to parse HTML and extract data
// function parseHTML(html) {
//   const $ = cheerio.load(html);
//   const tables = [];
//   $('li a[href^="#"]').each((index, anchorElement) => {
//     const href = $(anchorElement).attr('href').replace('#', '');
//     const matchingH3 = $(`h3[id="${href}"]`);

//     if (matchingH3.length > 0) {
//       const currentTable = {
//         name: matchingH3.text().trim(),
//         data: [],
//         id: href, // Add id attribute
//       };

//       // Append the table (with <th> tags as headers and <tr> tags as values) as a subtable
//       matchingH3.next('table').each((index, tableElement) => {
//         const subtable = [];
//         $(tableElement).find('tr').each((i, trElement) => {
//           const row = [];
//           $(trElement).find('th, td').each((j, cellElement) => {
//             row.push($(cellElement).text().trim());
//           });
//           subtable.push(row);
//         });
//         currentTable.data.push(subtable);
//       });

//       tables.push(currentTable);
//     }
//   });

//   return tables;
// }

// // Function to save data to JSON file
// function saveDataToJson(data) {
//   const jsonData = JSON.stringify(data, null, 2);
//   fs.writeFileSync('tables.json', jsonData, { flag: 'w' });
// }

// // Function to divide data into separate JSON files
// function divideDataIntoFiles(data) {
//   // Create the dropTables folder if it doesn't exist
//   const folderPath = 'dropTables';
//   if (!fs.existsSync(folderPath)) {
//     fs.mkdirSync(folderPath);
//   }

//   data.forEach(item => {
//     const filename = path.join(folderPath, `${item.id}.json`); // Create a filename based on the ID
//     const jsonData = JSON.stringify(item, null, 2);
//     fs.writeFileSync(filename, jsonData, { flag: 'w' });
//   });
// }
// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error('Error:', err);
//   res.status(500).json('Error fetching data');
// });

// // Route to fetch and process data
// app.get('/fetch', async (req, res, next) => {
//   try {
//     const html = await fetchHTMLContent();
//     const tables = parseHTML(html);
//     saveDataToJson(tables);
//     res.json('Data saved to tables.json');
//   } catch (error) {
//     next(error);
//   }
// });
// app.get('/divide', (req, res) => {
//   try {
//     const tables = JSON.parse(fs.readFileSync('tables.json', 'utf8'));
//     divideDataIntoFiles(tables);
//     res.json('Data divided into separate JSON files');
//   } catch (error) {
//     console.error('Error:', error);
//     res.status(500).json('Error dividing data');
//   }
// });
//      //! all left to do is custom scripts foir all diff tables;

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
//   console.log(`http://${hostname}:${port}`);
// });


//!v10 -table structure done without all data

// const axios = require('axios');
// const express = require('express');
// const { hostname } = require('os');
// const fs = require('fs');
// const port = process.env.PORT || 5000;
// const app = express();
// const cheerio = require('cheerio');

// const base = 'https://www.warframe.com/droptables';

// // Function to fetch HTML content
// async function fetchHTMLContent() {
//   try {
//     const response = await axios.get(base);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// }

// // Function to parse HTML and extract data
// function parseHTML(html) {
//   const $ = cheerio.load(html);
//   const tables = [];

//   $('li a[href^="#"]').each((index, anchorElement) => {
//     const href = $(anchorElement).attr('href').replace('#', '');
//     const matchingH3 = $(`h3[id="${href}"]`);

//     if (matchingH3.length > 0) {
//       const currentTable = {
//         name: matchingH3.text().trim(),
//         data: [],
//         id: href, // Add id attribute
//       };
//       tables.push(currentTable);
//     }
//   });

//   return tables;
// }

// // Function to save data to JSON file
// function saveDataToJson(data) {
//   const jsonData = JSON.stringify(data, null, 2);
//   fs.writeFileSync('tables.json', jsonData, { flag: 'w' });
// }

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error('Error:', err);
//   res.status(500).json('Error fetching data');
// });

// // Route to fetch and process data
// app.get('/fetch', async (req, res, next) => {
//   try {
//     const html = await fetchHTMLContent();
//     const tables = parseHTML(html);
//     saveDataToJson(tables);
//     res.json('Data saved to tables.json');
//   } catch (error) {
//     next(error);
//   }
// });

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
//   console.log(`http://${hostname}:${port}`);
// });
//!v9 fail
// const axios = require('axios');
// const express = require('express');
// const { hostname } = require('os');
// const fs = require('fs');
// const port = process.env.PORT || 5000;
// const app = express();
// const cheerio = require('cheerio');

// const base = 'https://www.warframe.com/droptables';

// // Function to fetch HTML content
// async function fetchHTMLContent() {
//   try {
//     const response = await axios.get(base);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// }

// // Function to parse HTML and extract data
// function parseHTML(html) {
//   const $ = cheerio.load(html);
//   const tables = [];

//   let currentTable = { type: '', data: [] };
  
//   $('li a[href^="#"]').each((index, anchorElement) => {
//     const href = $(anchorElement).attr('href').replace('#', '');
//     const matchingH3 = $(`h3[id="${href}"]`);
    
//     if (matchingH3.length > 0) {
//       if (currentTable.type !== '') {
//         tables.push(currentTable);
//         currentTable = { type: '', data: [] };
//       }
//       currentTable.type = matchingH3.text().trim();
//     }
//   });

//   return tables;
// }

// // Function to save data to JSON file
// function saveDataToJson(data) {
//   const jsonData = JSON.stringify(data, null, 2);
//   fs.writeFileSync('tables.json', jsonData, { flag: 'w' });
// }

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error('Error:', err);
//   res.status(500).json('Error fetching data');
// });

// // Route to fetch and process data
// app.get('/fetch', async (req, res, next) => {
//   try {
//     const html = await fetchHTMLContent();
//     const tables = parseHTML(html);
//     saveDataToJson(tables);
//     res.json('Data saved to tables.json');
//   } catch (error) {
//     next(error);
//   }
// });

// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
//   console.log(`http://${hostname}:${port}`);
// });
//!v8 failed
// const axios = require('axios');
// const express = require('express');
// const { hostname } = require('os');
// const fs = require('fs');
// const port = process.env.PORT || 5000;
// const app = express();
// const cheerio = require('cheerio');

// const base = 'https://www.warframe.com/droptables';

// app.get('/fetch', (req, res) => {
//     axios.get(base)
//         .then((response) => {
//             const html = response.data;
//             const $ = cheerio.load(html);
//             const tables = [];

//             let currentTable = { name: '', data: [] }; // Initialize currentTable as { name, data: [] }
//             let currentSubtable = { heading: '', data: [] }; // Initialize currentSubtable as { heading, data: [] }

//             // Parse <li> tags for anchor tags with href attributes
//             $('li a[href^="#"]').each((index, anchorElement) => {
//                 const href = $(anchorElement).attr('href').replace('#', '');

//                 // Find the corresponding <h3> tag with matching id
//                 const matchingH3 = $(`h3[id="${href}"]`);

//                 if (matchingH3.length > 0) {
//                     // If a table is in progress, push it to the tables array
//                     if (currentTable.name !== '') {
//                         tables.push(currentTable);
//                         currentTable = { name: '', data: [] }; // Reset currentTable
//                     }

//                     // Get the heading from the <h3> tag
//                     currentTable.name = matchingH3.text().trim();
//                 }
//             });

          
//             // Write the tables data to a JSON file
//             const jsonData = JSON.stringify(tables, null, 2);
//             fs.writeFileSync('tables.json', jsonData, { flag: 'w' });

//             res.json('Data saved to tables.json');
//         })
//         .catch((error) => {
//             console.error('Error:', error);
//             res.status(500).json('Error fetching data');
//         });
// });

// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
//     console.log(`http://${hostname}:${port}`);
// });

//!v7 much better readablity but mission major divisions remain unsorted
// const axios = require('axios');
// const express = require('express');
// const { hostname } = require('os');
// const fs = require('fs');
// const port = process.env.PORT || 5000;
// const app = express();
// const cheerio = require('cheerio');

// const base = 'https://www.warframe.com/droptables';

// app.get('/fetch', (req, res) => {
//     axios.get(base)
//         .then((response) => {
//             const html = response.data;
//             const $ = cheerio.load(html);
//             const tables = [];

//             let currentTable = null;

//             // Iterate over all table rows
//             $('table tr').each((rowIndex, rowElement) => {
//                 const rowData = [];

//                 // Check if the row is a table heading
//                 if ($(rowElement).find('th').length > 0) {
//                     // If a table is in progress, push it to the tables array
//                     if (currentTable) {
//                         tables.push(currentTable);
//                     }

//                     // Get the heading of the next table
//                     const heading = $(rowElement).find('th').text().trim();

//                     // Start a new table
//                     currentTable = { heading, data: [] };
//                 } else {
//                     // Iterate over cells in the row
//                     $(rowElement).find('td').each((cellIndex, cellElement) => {
//                         rowData.push($(cellElement).text().trim());
//                     });

//                     if (rowData.length > 0 && currentTable) {
//                         currentTable.data.push(rowData);
//                     }
//                 }
//             });

//             // Push the last table to the tables array
//             if (currentTable) {
//                 tables.push(currentTable);
//             }

//             // Write the tables data to a JSON file
//             const jsonData = JSON.stringify(tables, null, 2);
//             fs.writeFileSync('tables.json', jsonData, { flag: 'w' });

//             res.json('Data saved to tables.json');
//         })
//         .catch((error) => {
//             console.error('Error:', error);
//             res.status(500).json('Error fetching data');
//         });
// });

// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
//     console.log(`http://${hostname}:${port}`);
// });


//!v6 bettar thanv4 but nehh
// const axios = require('axios');
// const express = require('express');
// const { hostname } = require('os');
// const fs = require('fs');
// const port = process.env.PORT || 5000;
// const app = express();
// const cheerio = require('cheerio');

// const base = 'https://www.warframe.com/droptables';

// app.get('/fetch', (req, res) => {
//     axios.get(base)
//         .then((response) => {
//             const html = response.data;
//             const $ = cheerio.load(html);
//             const tables = [];

//             // Find all tables and iterate over them
//             $('table').each((tableIndex, tableElement) => {
//                 const tableData = [];
//                 const tableInfo = {};

//                 // Find the parent table's heading (e.g., "Mercury/Apollodorus (Survival)")
//                 tableInfo.planet = $(tableElement).prev('h3').text().trim();

//                 // Iterate over rows in the table
//                 $(tableElement).find('tr').each((rowIndex, rowElement) => {
//                     const rowData = [];

//                     // Check if the row contains th elements (headers)
//                     if ($(rowElement).find('th').length > 0) {
//                         rowData.push($(rowElement).find('th').text().trim());
//                     } else {
//                         // Iterate over cells in the row (td elements)
//                         $(rowElement).find('td').each((cellIndex, cellElement) => {
//                             rowData.push($(cellElement).text().trim());
//                         });
//                     }

//                     if (rowData.length > 0) {
//                         tableData.push(rowData);
//                     }
//                 });

//                 if (tableData.length > 0) {
//                     tableInfo.rotations = tableData;
//                     tables.push(tableInfo);
//                 }
//             });

//             // Write the tables data to a JSON file
//             const jsonData = JSON.stringify(tables, null, 2);
//             fs.writeFileSync('tables.json', jsonData, { flag: 'w' });

//             res.json('Data saved to tables.json');
//         })
//         .catch((error) => {
//             console.error('Error:', error);
//             res.status(500).json('Error fetching data');
//         });
// });

// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
//     console.log(`http://${hostname}:${port}`);
// });

//!v5-tables with mission, relic, etc as parent

// const axios = require('axios');
// const express = require('express');
// const { hostname } = require('os');
// const fs = require('fs');
// const port = process.env.PORT || 5000;
// const app = express();
// const cheerio = require('cheerio');

// const base = 'https://www.warframe.com/droptables';

// app.get('/fetch', (req, res) => {
//     axios.get(base)
//         .then((response) => {
//             const html = response.data;
//             const $ = cheerio.load(html);
//             const tables = [];

//             // Find all tables and iterate over them
//             $('table').each((tableIndex, tableElement) => {
//                 const tableData = [];

//                 // Find the parent table's heading (e.g., "Mercury/Apollodorus (Survival)")
//                 const parentHeading = $(tableElement).prev('h3').text().trim();

//                 // Iterate over rows in the table
//                 $(tableElement).find('tr').each((rowIndex, rowElement) => {
//                     const rowData = [];

//                     // Check if the row contains th elements (headers)
//                     if ($(rowElement).find('th').length > 0) {
//                         rowData.push($(rowElement).find('th').text().trim());
//                     } else {
//                         // Iterate over cells in the row (td elements)
//                         $(rowElement).find('td').each((cellIndex, cellElement) => {
//                             rowData.push($(cellElement).text().trim());
//                         });
//                     }

//                     if (rowData.length > 0) {
//                         tableData.push(rowData);
//                     }
//                 });

//                 if (tableData.length > 0) {
//                     const tableInfo = {
//                         parentHeading,
//                         data: tableData,
//                     };
//                     tables.push(tableInfo);
//                 }
//             });

//             // Write the tables data to a JSON file
//             const jsonData = JSON.stringify(tables, null, 2);
//             fs.writeFileSync('tables.json', jsonData, { flag: 'w' });

//             res.json('Data saved to tables.json');
//         })
//         .catch((error) => {
//             console.error('Error:', error);
//             res.status(500).json('Error fetching data');
//         });
// });

// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
//     console.log(`http://${hostname}:${port}`);
// });


//!v4--culltered tables
// const axios = require('axios');
// const express = require('express');
// const { hostname } = require('os');
// const fs = require('fs');
// const port = process.env.PORT || 5000;
// const app = express();
// const cheerio = require('cheerio');

// const base = 'https://www.warframe.com/droptables';

// app.get('/fetch', (req, res) => {
//     axios.get(base)
//         .then((response) => {
//             const html = response.data;
//             const $ = cheerio.load(html);
//             const tables = [];

//             // Find all tables and iterate over them
//             $('table').each((tableIndex, tableElement) => {
//                 const tableData = [];

//                 // Iterate over rows in the table
//                 $(tableElement).find('tr').each((rowIndex, rowElement) => {
//                     const rowData = [];

//                     // Check if the row contains th elements (headers)
//                     if ($(rowElement).find('th').length > 0) {
//                         rowData.push($(rowElement).find('th').text().trim());
//                     } else {
//                         // Iterate over cells in the row (td elements)
//                         $(rowElement).find('td').each((cellIndex, cellElement) => {
//                             rowData.push($(cellElement).text().trim());
//                         });
//                     }

//                     if (rowData.length > 0) {
//                         tableData.push(rowData);
//                     }
//                 });

//                 if (tableData.length > 0) {
//                     tables.push(tableData);
//                 }
//             });

//             // Write the tables data to a JSON file
//             const jsonData = JSON.stringify(tables, null, 2);
//             fs.writeFileSync('alltable.json', jsonData, { flag: 'w' });

//             res.json('Data saved to alltable.json');
//         })
//         .catch((error) => {
//             console.error('Error:', error);
//             res.status(500).json('Error fetching data');
//         });
// });

// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
//     console.log(`http://${hostname}:${port}`);
// });

//!v3
// const axios = require('axios');
// const express = require('express');
// const { hostname } = require('os');
// const fs = require('fs');
// const port = process.env.PORT || 5000;
// const app = express();
// const cheerio = require('cheerio');

// const base = 'https://www.warframe.com/droptables';

// app.get('/fetch', (req, res) => {
//     axios.get(base)
//         .then((response) => {
//             const html = response.data;
//             const $ = cheerio.load(html);
//             const tables = [];

//             // Find all tables and iterate over them
//             $('table').each((tableIndex, tableElement) => {
//                 const tableData = [];

//                 // Iterate over rows in the table
//                 $(tableElement).find('tr').each((rowIndex, rowElement) => {
//                     const rowData = [];

//                     // Iterate over cells in the row
//                     $(rowElement).find('td').each((cellIndex, cellElement) => {
//                         rowData.push($(cellElement).text().trim());
//                     });

//                     if (rowData.length > 0) {
//                         tableData.push(rowData);
//                     }
//                 });

//                 if (tableData.length > 0) {
//                     tables.push(tableData);
//                 }
//             });

//             // Write the tables data to a JSON file
//             const jsonData = JSON.stringify(tables, null, 2);
//             fs.writeFileSync('tables.json', jsonData, { flag: 'w' });

//             res.json('Data saved to tables.json');
//         })
//         .catch((error) => {
//             console.error('Error:', error);
//             res.status(500).json('Error fetching data');
//         });
// });

// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
//     console.log(`http://${hostname}:${port}`);
// });
//!v3
// const { default: axios } = require('axios');
// const express = require('express');
// const { hostname } = require('os');
// const fs = require('fs');
// const port = process.env.PORT || 5000;
// const app = express();
// const cheerio = require('cheerio');

// const base = 'https://www.warframe.com/droptables';

// app.get('/fetch', (req, res) => {
//     axios.get(base)
//         .then((response) => {
//             const html = response.data;
//             const $ = cheerio.load(html);
//             const $tables = $('h3 ').contents();
            
//            console.log($tables);
//             // const tablesData = [];
            
//             // $tables.each((index, element) => {
//             //     const tableData = {}; 
                
//             //     tablesData.push(tableData);
//             // });

            
//             // const jsonData = JSON.stringify($tables);
//             // fs.writeFileSync('alltable.js', jsonData, { flag: 'w' });

//             // res.json('Data saved to alltable.js');
//         })
//         .catch((error) => {
//             console.error('Error:', error);
//             res.status(500).json('Error fetching data');
//         });
// });

// app.listen(port, () => {
//     console.log(`Feeding kubrow at ${port}`);
//     console.log(`http://${hostname}:${port}`);
// });


//!v2
// const { default: axios } = require('axios');
// const express = require('express');
// const { hostname } = require('os');
// const port = process.env.PORT || 5000;
// const app = express();
// const cheerio = require('cheerio');
// const { constants } = require('buffer');
// const { contains } = require('cheerio/lib/static');

// const base='https://www.warframe.com/droptables';
// app.get('/fetch', (req, res) => {
//     axios.get(base)
//        .then((response)=>{
//         const html=response.data;
//         const $ = cheerio(html);
//         // console.log(html);
//          const $tables=$(' h3 > table ')
//        })
//     res.json(`Welcome to droptables `);
//     res.end();
// });

// app.listen(port, () => {
//     console.log(`Feeding kubrow at ${port}`);
//     console.log(`http://${hostname}:${port}`);
// });

//!v1
// const express=require('express');
// const fs =require ('fs');
// const axios=require('axios');
// const port=process.env.PORT||5000; 
// const { hostname } = require('os');


// const app=express()

// app.get('/home', (req:"https://www.warframe.com/droptables")=>{
//     res.json('welcome to droptables')
// })
// app.listen(port,()=>{
//     console.log(`feeding kubrow at ${port}`);
//     console.log(`http://${hostname}:${port}`);
// });