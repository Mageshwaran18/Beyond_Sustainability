const { GoogleGenerativeAI, GoogleGenerativeAIResponseError } = require("@google/generative-ai");
const dotenv = require("dotenv");
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const generationConfig = {
    stopSequences: ["red"],
    maxOutputTokens: 50, // Adjust as needed
    temperature: 0.7,
    topP: 0.1,
    topK: 16,
};

async function getResponse(prompt) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    try {
        const result = await model.generateContent(prompt, generationConfig);
        if (result.response && result.response.candidates && result.response.candidates.length > 0) {
            const candidate = result.response.candidates[0];
            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                return candidate.content.parts[0].text;
            } else {
                return "No content found in the response.";
            }
        } else {
            return "No candidates found in the response.";
        }
    } catch (error) {
        if (error instanceof GoogleGenerativeAIResponseError) {
            return `Error from Google Generative AI API: ${error.message}`;
        } else {
            return `Unexpected error: ${error.message}`;
        }
    }
}

function cleanAndFormatText(text) {
    text = text.replace(/\*/g, '').trim();
    const lines = text.split('\n');
    const seen = new Set();
    let result = [];
    let skipSection = false;

    lines.forEach(line => {
        line = line.trim();
        if (!skipSection && line && !seen.has(line)) {
            result.push(line);
            seen.add(line);
        }
    });

    return result;
}

function mapMitigationStrategies(mitigationResponse, mappingResponse) {
    function cleanResponse(responseArray) {
        return responseArray.map(item => item.replace(/^\d+\.\s*/, ''));
    }

    const cleanMitigationResponse = cleanResponse(mitigationResponse);
    const cleanMappingResponse = cleanResponse(mappingResponse);

    const mappingMap = new Map();
    cleanMappingResponse.slice(1).forEach(mapping => {
        const [strategy, segments] = mapping.split(': ');
        mappingMap.set(strategy, segments);
    });

    let output = [];
    cleanMitigationResponse.slice(1).forEach(mitigation => {
        const [strategy, description] = mitigation.split(': ');
        const segments = mappingMap.get(strategy);
        if (segments) {
            output.push(
                `Mitigation Strategies: ${strategy}\nsegment: ${segments}\n          -- ${mitigation}`
            );
        }
    });

    return output.join('\n\n');
}

function createMitigationPrompt(data) {
    const equipment = data['Equipment'];
    const equipmentConsumption = data['Equipment consumption'];
    const equipmentEmission = data['Equipment Emission'];

    return `
    Provide a detailed and structured mitigation strategy based on the CO2 emission from the ${equipment} with the fuel consumption of ${equipmentConsumption} units of fuel.
    The response should include a heading "Mitigation Strategies" and ensure the response is clear and concise, with less than 10 points in total, without any subtopics.
    Provide the segment for each point in the example format of:
    Mitigation Strategies
    1. Fuel Efficiency Improvements: Implement technologies like hybrid or electric car models to reduce fuel consumption and carbon emissions.
    2. Vehicle Maintenance: Ensure regular maintenance to optimize engine performance and reduce fuel consumption.
    3. Driving Practices: Promote eco-driving techniques, including smooth acceleration, avoiding harsh braking, and maintaining optimal speed to minimize fuel usage.
    4. Alternative Fuels: Explore alternative fuel sources like biofuels or hydrogen to lower carbon emissions.
    5. Vehicle Downsizing: Consider using smaller and lighter vehicles when feasible to reduce fuel consumption.
    6. Route Optimization: Implement efficient route planning to minimize travel distance and fuel consumption.
    7. Vehicle Sharing: Encourage carpooling or ride-sharing initiatives to reduce the number of vehicles on the road.
    8. Public Transportation: Promote the use of public transportation as a viable alternative for commuters.
    9. Cycling and Walking: Encourage walking or cycling for short distances to reduce reliance on vehicles.
    10. Carbon Offsetting: Invest in carbon offsetting programs to compensate for unavoidable emissions.

    The response should be in a similar format(must contain topics and mitigation strategies) and apply to ${equipment} with ${equipmentConsumption} units of fuel.
    `;
}

app.post('/mitigation-strategies', async (req, res) => {
    const data = req.body;
    const mitigationPrompt = createMitigationPrompt(data);
    const response = await getResponse(mitigationPrompt);
    const cleanedResponseArray = cleanAndFormatText(response);

    const segments = [
        'Water Purification', 'Sanitary Pads', 'Planting', 'Bio Fuel', 'Data Analytics', 
        'Electric Tractor', 'Waste Management', 'Energy Production', 'Battery', 'Organic Waste', 
        'Waste Segregation', 'Meat', 'Furniture', 'Rubber', 'Air Freshner', 'Forest', 
        'Cloth', 'Wind Energy', 'Air Pollution', 'Rainwater Harvesting', 'Solid Waste', 
        'Household Products', 'Electric Bus', 'Heat Recovery', 'Air Purification', 'BioGas', 
        'Building Materials', 'Water Management', 'Fashion', 'Steel Wate Management', 'Leather', 
        'Energy Storage', 'Toilet', 'Soilless Farming', 'Sewage', 'Food', 'Packaging', 
        'Sanitation', 'Electric Car', 'Electric Truck', 'Paper Waste Management', 
        'Electric Cycle', 'Material', 'Cosmetics', 'Green Chemical', 'Plant Meat', 'AC', 
        'GreenGas', 'ePlane', 'Carbon Emission', 'Eco Friendly Houses', 'Circular Economy', 
        'Bricks', 'Solar System', 'Green Chemistry', 'E-Waste', 'Shoes & Slippers', 
        'Banana Fibre', 'Renewable Water', 'Carbon Fibre', 'Electric Auto', 'Testing', 
        'Plastic Free', 'Energy Efficiency', 'EV Charging Station', 'Organic Food', 'Bamboo', 
        'Recycling Waste', 'Wood', 'Fuel Efficiency', 'EV', 'Electric Bike', 'Purification'
    ];

    const mappingPrompt = `
Map the following points to the most relevant segments from the list.

Points:
${cleanedResponseArray.join(', ')}

Segments:
${segments.join(', ')}

Provide the segment for each point in the example format of:

Mapping
1. Fuel Efficiency Improvements: Fuel Efficiency, Energy Efficiency, EV, Electric Car, Electric Auto
2. Vehicle Maintenance: Fuel Efficiency, Energy Efficiency
3. Driving Practices: Fuel Efficiency, Energy Efficiency
4. Alternative Fuels: Bio Fuel, GreenGas
5. Vehicle Downsizing: Fuel Efficiency, Energy Efficiency
6. Route Optimization: Fuel Efficiency, Energy Efficiency
7. Vehicle Sharing: Fuel Efficiency, Energy Efficiency
8. Public Transportation: Electric Bus, Electric Bike, Electric Cycle
9. Cycling and Walking: Electric Bike, Electric Cycle
10. Carbon Offsetting: Carbon Emission, Renewable Water, Carbon Fibre
`;

    const ans = await getResponse(mappingPrompt);
    const map = cleanAndFormatText(ans);
    const final = mapMitigationStrategies(cleanedResponseArray, map);
    res.send(final);
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
