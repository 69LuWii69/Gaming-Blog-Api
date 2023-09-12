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
// function parseHTMLForID(html, id) {
//   const $ = cheerio.load(html);
//   const tables = [];

//   $(`li a[href="#${id}"]`).each((index, anchorElement) => {
//     const href = $(anchorElement).attr('href').replace('#', '');
//     const matchingH3 = $(`h3[id="${href}"]`);

//     if (matchingH3.length > 0) {
//       const currentTable = {
//         name: matchingH3.text().trim(),
//         data: [],
//         id: href,
//       };

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
// Function to parse HTML and extract data for a specific ID with restructuring
function parseHTMLForID(html, id) {
    const $ = cheerio.load(html);
    const rotations = [];
    let currentRotation = ''; // Keep track of the current rotation
  
    $(`li a[href="#${id}"]`).each((index, anchorElement) => {
      const href = $(anchorElement).attr('href').replace('#', '');
      const matchingH3 = $(`h3[id="${href}"]`);
  
      if (matchingH3.length > 0) {
        matchingH3.next('table').each((index, tableElement) => {
          const rotationData = [];
          $(tableElement).find('tr').each((i, trElement) => {
            const row = [];
            $(trElement).find('th, td').each((j, cellElement) => {
                 
                const cellText = $(cellElement).text().trim();
              if (cellText) {
                // If it's a mission name, set it as the current rotation
                if( cellText===0){
                  currentRotation = cellText;
                    
                }
                else if (j === 0) {
                    currentRotation = cellText;
                } else {
                    // currentRotaion
                  // If it's a reward, combine it with the current rotation
                  row.push(currentRotation + ' : ' + cellText);
                }
              }
            });
            if (row.length > 0) {
              rotationData.push(row);
            }
          });
          if (rotationData.length > 0) {
            rotations.push(rotationData);
          }
        });
      }
    });
  
    return rotations;
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
// const port = process.env.PORT || 5000;
// const app = express();
// const cheerio = require('cheerio');

// const base = 'https://www.warframe.com/droptables';

// const resData = {}; // Use an object to store data with IDs as keys

// // Function to fetch HTML content
// async function fetchHTMLContent() {
//   try {
//     const response = await axios.get(base);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// }

// // Function to parse HTML and extract data for a specific ID
// function parseHTMLForID(html, id) {
//   const $ = cheerio.load(html);
//   const tables = [];

//   $(`li a[href="#${id}"]`).each((index, anchorElement) => {
//     const href = $(anchorElement).attr('href').replace('#', '');
//     const matchingH3 = $(`h3[id="${href}"]`);

//     if (matchingH3.length > 0) {
//       const currentTable = {
//         name: matchingH3.text().trim(),
//         data: [],
//         id: href,
//       };

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

// // Function to format data for "missionRewards" ID
// function formatMissionRewardsData(data) {
//   const formattedData = [];
//   data.forEach((table) => {
//     const formattedTable = {
//       name: table.name,
//       data: [],
//     };

//     table.data.forEach((rotation) => {
//       // Create subtables for rotations
//       const subtable = [['Resource', 'Rate']];
//       rotation.forEach((row) => {
//         // Assuming the first two columns are resource and rate
//         subtable.push([row[0], row[1]]);
//       });

//       formattedTable.data.push(subtable);
//     });

//     formattedData.push(formattedTable);
//   });

//   return formattedData;
// }

// // Route to fetch and return data for a specific ID
// app.get('/fetch/:id', async (req, res, next) => {
//   try {
//     const id = req.params.id;
//     const html = await fetchHTMLContent();
//     const tables = parseHTMLForID(html, id);
    
//     if (!resData[id]) {
//       resData[id] = []; // Initialize data array for this ID if it doesn't exist
//     }

//     if (id === 'missionRewards') {
//       // Format data specifically for "missionRewards"
//       const formattedData = formatMissionRewardsData(tables);
//       resData[id].push(...formattedData);
//     } else {
//       resData[id].push(...tables);
//     }

//     res.json(resData[id]); // Return the data for the specific ID
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
