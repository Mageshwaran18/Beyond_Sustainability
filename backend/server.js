require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();
app.use(bodyParser.json());

// Load environment variables
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  throw new Error('GOOGLE_API_KEY is not set in environment variables');
}

// Initialize the Google Generative AI
const genAI = new GoogleGenerativeAI(apiKey);

// Function to convert data to a string representation
function dataToString(data) {
  
  return `Facility Code: ${data.Facility_Code}, Equipment: ${data.Equipment} - Fuel Consumption: ${data.Equipment_Fuel_Consumption}L, Carbon Emission: ${data.Equipment_Carbon_Emissions}Kg`;
}

async function getGeminiResponse(prompt, data) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    if (!model) {
      throw new Error('Failed to initialize generative model');
    }


    // console.log("j::::::::"+dataToString(data))
    const promptWithData = `${prompt}\n\nData:\n${dataToString(data)}`;
    // console.log("promptWithData:::"+promptWithData)
    const result = await model.generateContent( promptWithData);

    

    if (result && result.response) {
      // console.log("resuly"+result.response.text())
      return result.response.text();
    } else {
      return "Sorry, I couldn't generate a response. Please try again.";
    }
  } catch (error) {
    console.error('An error occurred:', error.message);
    return 'An error occurred while generating a response. Please try again.';
  }
}

function cleanAndFormatText(text) {
  // Remove asterisks and duplicates, and format the text properly
 try{
  text = text.replace(/\*/g, '').trim();

  const lines = text.split('\n');
  const seen = new Set();
  const result = [];
  let skipSection = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('1. Energy Efficiency Upgrade:')) {
      skipSection = true;
      continue;
    }
    if (trimmedLine.startsWith('2. Alternative Refrigerants:')) {
      skipSection = true;
      continue;
    }
    if (skipSection && (trimmedLine.startsWith('2.') || trimmedLine.startsWith('1.'))) {
      skipSection = false;
    }
    if (!skipSection && trimmedLine && !seen.has(trimmedLine)) {
      result.push(trimmedLine);
      seen.add(trimmedLine);
    }
  }

  return result.join('\n').trim();
 }catch(error){
  console.log(error.message)
 }
}

async function getMapping(prompt, points, segments) {
  const mappingPrompt = `${prompt}\n\nPoints:\n${points.join(', ')}\n\nSegments:\n${segments.join(', ')}\n\nPlease map each point to the most relevant segment from the list.`;
  const response = await getGeminiResponse(mappingPrompt, points);
  return response;
}

function processText(text) {
  const result = {
    'Mitigation Strategies': [],
    'Mapping': []
  };

  text = text.replace('##', '').trim();
  const sections = text.split('\n##\s*');

  sections.forEach(section => {
    if (!section.trim()) return;

    const titleMatch = section.match(/^([^\n]+)/);
    if (titleMatch) {
      const title = titleMatch[1].trim();
      const content = section.substring(title.length).trim();
      if (title === 'Mitigation Strategies') {
        const strategies = content.split(/\d+\.\s*/).filter(s => s.trim());
        result['Mitigation Strategies'] = strategies;
      } else if (title === 'Mapping') {
        const mapping = content.split(/\d+\.\s*/).filter(m => m.trim());
        result['Mapping'] = mapping;
      }
    }
  });

  return result;
}

function mapMitigationStrategies(mitigationDict) {
  console.log('Mitigation Dictionary:', mitigationDict);  // Add this for debugging

  const topicToStrategies = {};

  mitigationDict['Mapping'].forEach(entry => {
    // Split the entry into sections based on line breaks and process each line
    const lines = entry.split('\n').filter(line => line.trim());
    lines.forEach(line => {
      const match = line.match(/(\w[\w\s]+):\s*(.*)/);
      if (match) {
        const topic = match[1].trim();
        const tags = match[2].trim();
        const tagList = tags.split(', ').map(tag => tag.trim());

        // Add to the topicToStrategies object
        if (!topicToStrategies[topic]) {
          topicToStrategies[topic] = {
            'Strategies': [],
            'Tags': tagList
          };
        }
      } else {
        console.error('Invalid line format:', line);
      }
    });
  });

  // Populate strategies from mitigationDict['Mitigation Strategies']
  mitigationDict['Mitigation Strategies'].forEach(strategy => {
    const [topic, description] = strategy.split(': ', 2);
    if (topic && description) {
      if (!topicToStrategies[topic]) {
        topicToStrategies[topic] = {
          'Strategies': [],
          'Tags': []
        };
      }
      topicToStrategies[topic]['Strategies'].push(description.trim());
    }
  });

  // Create output format
  const output = [];
  for (const [topic, details] of Object.entries(topicToStrategies)) {
    output.push(`Topic: ${topic}`);
    output.push(`Tags: ${details['Tags'].join(', ')}`);
    output.push('Strategies:');
    details['Strategies'].forEach(strategy => {
      output.push(`  - ${strategy}`);
    });
    output.push('');
  }

  return output.join('\n');
}


app.post('/mitigation-strategies', async (req, res) => {
  const data = req.body;
  const prompt1 = 'Provide a detailed and structured mitigation strategy based on this data frame for the equipment Boiler...';

  try {
    const ans = await getGeminiResponse(prompt1, data);
    // console.log("ans :" + ans )
    if (ans) {
      const miti = cleanAndFormatText(ans);
      // console.log(miti)
      const points = miti.split('\n').filter(line => line.trim());
      const segments = ['Water Purification', 'Sanitary Pads', 'Planting', 'Bio Fuel', 'Data Analytics', 'Electric Tractor', 
        'Waste Management', 'Energy Production', 'Battery', 'Organic Waste', 'Waste Segregation', 'Meat', 'Furniture', 
        'Rubber', 'Air Freshner', 'Forest', 'Cloth', 'Wind Energy', 'Air Pollution', 'Rainwater Harvesting', 'Solid Waste', 
        'Household Products', 'Electric Bus', 'Heat Recovery', 'Air Purification', 'BioGas', 'Building Materials', 'Water Management', 
        'Fashion', 'Steel Waste Management', 'Leather', 'Energy Storage', 'Toilet', 'Soilless Farming', 'Sewage', 'Food', 
        'Packaging', 'Sanitation', 'Electric Car', 'Electric Truck', 'Paper Waste Management', 'Electric Cycle', 'Material', 
        'Cosmetics', 'Green Chemical', 'Plant Meat', 'AC', 'GreenGas', 'ePlane', 'Carbon Emission', 'Eco Friendly Houses', 
        'Circular Economy', 'Bricks', 'Solar System', 'Green Chemistry', 'E-Waste', 'Shoes & Slippers', 'Banana Fibre', 
        'Renewable Water', 'Carbon Fibre', 'Electric Auto', 'Testing', 'Plastic Free', 'Energy Efficiency', 'EV Charging Station', 
        'Organic Food', 'Bamboo', 'Recycling Waste', 'Wood', 'Fuel Efficiency', 'EV', 'Electric Bike', 'Purification'];

      const mappingPrompt = 'Map the following points to the most relevant segments from the list...\n\n' +
        `Points:\n${points.join(', ')}\n\n` +
        `Segments:\n${segments.join(', ')}\n\n` +
        'Provide the segment for each point in the example format of:\n\n' +
        'Mapping\n' +
        '1. Fuel Efficiency Improvements: Fuel Efficiency, Energy Efficiency, EV, Electric Car, Electric Auto\n' +
        '2. Vehicle Maintenance: Fuel Efficiency, Energy Efficiency\n' +
        '3. Driving Practices: Fuel Efficiency, Energy Efficiency\n' +
        '4. Alternative Fuels: Bio Fuel, GreenGas\n' +
        '5. Vehicle Downsizing: Fuel Efficiency, Energy Efficiency\n' +
        '6. Route Optimization: Fuel Efficiency, Energy Efficiency\n' +
        '7. Vehicle Sharing: Fuel Efficiency, Energy Efficiency\n' +
        '8. Public Transportation: Electric Bus, Electric Bike, Electric Cycle\n' +
        '9. Cycling and Walking: Electric Bike, Electric Cycle\n' +
        '10. Carbon Offsetting: Carbon Emission, Renewable Water, Carbon Fibre\n';

      const resMapping = await getMapping(mappingPrompt, points, segments);
      if (resMapping) {
        const map = cleanAndFormatText(resMapping);
        const dict1 = processText(miti);
        const dict2 = processText(map);

        const finalData = {
          'Mitigation Strategies': dict1['Mitigation Strategies'],
          'Mapping': dict2['Mapping'].map((m, i) => m || dict1['Mitigation Strategies'][i])
        };

        const result = mapMitigationStrategies(finalData);
        res.json({ result });
      } else {
        res.status(500).json({ error: 'Failed to generate mapping' });
      }
    } else {
      res.status(500).json({ error: 'Failed to generate mitigation strategies' });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
