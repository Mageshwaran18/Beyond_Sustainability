import React, { useState } from 'react';

const Form = () => {
  const [facilityCode, setFacilityCode] = useState('');
  const [equipment, setEquipment] = useState('');
  const [fuelConsumption, setFuelConsumption] = useState('');
  const [carbonEmissions, setCarbonEmissions] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log({ facilityCode, equipment, fuelConsumption, carbonEmissions });
  };

  return (
    <div className="bg-gray-100 flex items-center justify-center h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Facilities Form</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="facilityCode" className="block text-sm font-medium text-gray-700 mb-1">Facility Code</label>
            <input
              type="text"
              id="facilityCode"
              value={facilityCode}
              onChange={(e) => setFacilityCode(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="equipment" className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
            <input
              type="text"
              id="equipment"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="fuelConsumption" className="block text-sm font-medium text-gray-700 mb-1">Equipment Fuel Consumption</label>
            <input
              type="text"
              id="fuelConsumption"
              value={fuelConsumption}
              onChange={(e) => setFuelConsumption(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="carbonEmissions" className="block text-sm font-medium text-gray-700 mb-1">Equipment Carbon Emissions</label>
            <input
              type="text"
              id="carbonEmissions"
              value={carbonEmissions}
              onChange={(e) => setCarbonEmissions(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-center">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">Submit</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form;
