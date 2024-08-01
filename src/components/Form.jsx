import React, { useState } from 'react';
import axios from 'axios';

const Form = () => {
  const [output, setOutput] = useState('');
  const [formData, setFormData] = useState({
    'Facility code': '',
    'Equipment': '',
    'Equipment consumption': '',
    'Equipment Emission': ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3000/mitigation-strategies', formData);
      console.log('Data submitted successfully:', response.data);
      setOutput(response.data);
      alert('Data submitted successfully!');
    } catch (error) {
      console.error('There was an error submitting the form!', error);
    }
  };

  return (
    <>
    <div className="bg-gray-100 flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Facilities Form</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="Facility code" className="block text-sm font-medium text-gray-700 mb-1">Facility Code</label>
            <input
              type="text"
              id="Facility code"
              name="Facility code"
              value={formData['Facility code']}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="Equipment" className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
            <input
              type="text"
              id="Equipment"
              name="Equipment"
              value={formData['Equipment']}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="Equipment consumption" className="block text-sm font-medium text-gray-700 mb-1">Equipment Consumption</label>
            <input
              type="text"
              id="Equipment consumption"
              name="Equipment consumption"
              value={formData['Equipment consumption']}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="Equipment Emission" className="block text-sm font-medium text-gray-700 mb-1">Equipment Emission</label>
            <input
              type="text"
              id="Equipment Emission"
              name="Equipment Emission"
              value={formData['Equipment Emission']}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-center">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
              Submit
            </button>
          </div>
        </form>
      </div>
      
    </div>
    {output && (
        <div className="bg-white p-4 rounded-lg shadow-lg mt-8 w-full max-w-md">
          <h3 className="text-xl font-bold mb-4">Output</h3>
          <pre className="bg-gray-100 p-4 rounded-md">
            {JSON.stringify(output, null, 2)}
          </pre>
        </div>
      )}

    </>
  );
};

export default Form;
