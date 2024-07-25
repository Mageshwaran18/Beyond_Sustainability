const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

// POST API to handle form submission
app.post('/api/facilities', (req, res) => {
    const { facilityCode, equipment, fuelConsumption, carbonEmissions } = req.body;
    console.log('Form data received:', req.body);

    req.body.equipment+="hello"

    // Here, you can process the data, save it to a database, etc.
    

    res.json({ message: 'Form data received successfully', data: req.body });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
