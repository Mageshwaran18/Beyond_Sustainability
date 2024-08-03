const { GoogleGenerativeAI, GoogleGenerativeAIResponseError } = require("@google/generative-ai");
const dotenv = require("dotenv");
const readline = require("readline");
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');


const app = express();
app.use(cors())
app.use(bodyParser.json());

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

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


function createMitigationPrompt(data) {
  const equipment = data['Equipment'];
  const equipmentConsumption = data['Equipment consumption'];
  const equipmentEmission = data['Equipment Emission'];
    console.log(equipment,equipmentConsumption,equipmentEmission);
  const prompt = `Provide mitigation strategies for the reduction of ${equipmentEmission} CO2 emission from the ${equipment} with the fuel consumption of ${equipmentConsumption} units of fuel.`;

  return prompt;
}

app.post('/mitigation-strategies', async (req, res) => {
  const data = req.body;
  const mitigationPrompt = createMitigationPrompt(data);
  console.log(mitigationPrompt);
  const response = await getResponse(mitigationPrompt);
  console.log("Response:", response);
  res.send(response);
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});