const axios = require('axios');
const express = require('express');
const { hostname } = require('os');
const fs = require('fs').promises;
const path = require('path');
const port = process.env.PORT || 5000;
const app = express();
const cheerio = require('cheerio');

const base = 'https://www.warframe.com/droptables';

const resData = []; // Initialize an array to store the data

// Function to fetch HTML content
async function fetchHTMLContent() {
  try {
    const response = await axios.get(base);
    return response.data;
  } catch (error) {
    throw error;
  }
}

// Function to parse HTML and extract data
function parseHTML(html) {
  const $ = cheerio.load(html);
  const tables = [];
  $('li a[href^="#"]').each((index, anchorElement) => {
    const href = $(anchorElement).attr('href').replace('#', '');
    const matchingH3 = $(`h3[id="${href}"]`);

    if (matchingH3.length > 0) {
      const currentTable = {
        name: matchingH3.text().trim(),
        data: [],
        id: href,
      };

      matchingH3.next('table').each((index, tableElement) => {
        const subtable = [];
        $(tableElement).find('tr').each((i, trElement) => {
          const row = [];
          $(trElement).find('th, td').each((j, cellElement) => {
            row.push($(cellElement).text().trim());
          });
          subtable.push(row);
        });
        currentTable.data.push(subtable);
      });

      tables.push(currentTable);
    }
  });

  return tables;
}

// Route to fetch and return data
app.get('/fetch', async (req, res, next) => {
  try {
    const html = await fetchHTMLContent();
    const tables = parseHTML(html);
    resData.push(...tables); // Add the tables to resData
    res.json(resData); // Return the data
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
