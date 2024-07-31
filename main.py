from dotenv import load_dotenv
import os
import google.generativeai as genai
import pandas as pd
from google.api_core.exceptions import GoogleAPIError, InternalServerError
import re

# Creating the data
data = {
    'Equipment': ['car', 'truck'],
    'Fuel_Consumption_Liters': [100, 200],
    'Carbon_Emission_Kg': [250, 500]
}

# Creating the DataFrame
df = pd.DataFrame(data)

# Load environment variables from .env file
load_dotenv()

# Configure the Google Generative AI
api_key = os.getenv("GOOGLE_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
else:
    raise ValueError("GOOGLE_API_KEY is not set in environment variables")

# Initialize the Generative Model
model = genai.GenerativeModel('gemini-1.5-flash-latest')

def get_gemini_response(prompt1, df):
    try:
        # Convert DataFrame to a string representation
        df_str = df.to_string(index=False)
        prompt_with_data = f"{prompt1}\n\nData:\n{df_str}"
        
        # Generate content based on the prompt and DataFrame
        response = model.generate_content(prompt_with_data)
        
        if hasattr(response, 'text'):
            return response.text
        else:
            return "Sorry, I couldn't generate a response. Please try again."
    except InternalServerError as e:
        print(f"Internal server error: {e}")
        return "Internal server error occurred. Please try again."
    except GoogleAPIError as e:
        print(f"Google API error: {e}")
        return "An error occurred with the Google API. Please try again."
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return "An unexpected error occurred. Please try again."

def clean_and_format_text(text):
    # Remove asterisks and duplicates, and format the text properly
    text = text.replace('*', '').strip()
    
    lines = text.split('\n')
    seen = set()
    result = []
    skip_section = False
    for line in lines:
        line = line.strip()
        if line.startswith('1. Energy Efficiency Upgrade:'):
            skip_section = True
            continue
        if line.startswith('2. Alternative Refrigerants:'):
            skip_section = True
            continue
        if skip_section and (line.startswith('2.') or line.startswith('1.')):
            skip_section = False
        
        if not skip_section and line and line not in seen:
            result.append(line)
            seen.add(line)
    
    # Format the text without the specific sections
    formatted_text = ""
    for line in result:
        formatted_text += f"{line}\n"
                
    return formatted_text.strip()

def get_mapping(prompt1, points, segments):
    # Create a prompt for mapping points to segments
    mapping_prompt = (f"{prompt1}\n\nPoints:\n{', '.join(points)}\n\nSegments:\n{', '.join(segments)}\n\n"
                      "Please map each point to the most relevant segment from the list.")
    
    # Get the response from the model
    response = get_gemini_response(mapping_prompt, df)
    return response

if __name__ == "__main__":
    # Initial prompt to generate mitigation strategies
    prompt1 = ('''Provide a detailed and structured mitigation strategy based on this data frame for the equipment car. '
               'The response should include a heading "Mitigation Strategies" Ensure the response is clear and concise, '
               'with less than 10 points in total, without any subtopic
               'Provide the segment for each point in the example format of:'
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
                  ''')
    ans = get_gemini_response(prompt1, df)
    
    if ans:
        miti = clean_and_format_text(ans)
        
        # Convert cleaned text to a list of points
        points = [line.strip() for line in miti.split('\n') if line.strip()]
        
        # Define the segments list
        segments = ['Water Purification', 'Sanitary Pads', 'Planting', 'Bio Fuel', 'Data Analytics', 'Electric Tractor', 
                    'Waste Management', 'Energy Production', 'Battery', 'Organic Waste', 'Waste Segregation', 'Meat', 
                    'Furniture', 'Rubber', 'Air Freshner', 'Forest', 'Cloth', 'Wind Energy', 'Air Pollution', 
                    'Rainwater Harvesting', 'Solid Waste', 'Household Products', 'Electric Bus', 'Heat Recovery', 
                    'Air Purification', 'BioGas', 'Building Materials', 'Water Management', 'Fashion', 
                    'Steel Wate Management', 'Leather', 'Energy Storage', 'Toilet', 'Soilless Farming', 'Sewage', 
                    'Food', 'Packaging', 'Sanitation', 'Electric Car', 'Electric Truck', 'Paper Waste Management', 
                    'Electric Cycle', 'Material', 'Cosmetics', 'Green Chemical', 'Plant Meat', 'AC', 'GreenGas', 
                    'ePlane', 'Carbon Emission', 'Eco Friendly Houses', 'Circular Economy', 'Bricks', 'Solar System', 
                    'Green Chemistry', 'E-Waste', 'Shoes & Slippers', 'Banana Fibre', 'Renewable Water', 
                    'Carbon Fibre', 'Electric Auto', 'Testing', 'Plastic Free', 'Energy Efficiency', 
                    'EV Charging Station', 'Organic Food', 'Bamboo', 'Recycling Waste', 'Wood', 'Fuel Efficiency', 
                    'EV', 'Electric Bike', 'Purification']
        
        # Create prompt for mapping points to segments
        mapping_prompt = ('Map the following points to the most relevant segments from the list.\n\n'
                  'Points:\n'
                  f'{", ".join(points)}\n\n'
                  'Segments:\n'
                  f'{", ".join(segments)}\n\n'
                  'Provide the segment for each point in the example format of:\n\n'
                  'Mapping\n'
                  '1. Fuel Efficiency Improvements: Fuel Efficiency, Energy Efficiency, EV, Electric Car, Electric Auto\n'
                  '2. Vehicle Maintenance: Fuel Efficiency, Energy Efficiency\n'
                  '3. Driving Practices: Fuel Efficiency, Energy Efficiency\n'
                  '4. Alternative Fuels: Bio Fuel, GreenGas\n'
                  '5. Vehicle Downsizing: Fuel Efficiency, Energy Efficiency\n'
                  '6. Route Optimization: Fuel Efficiency, Energy Efficiency\n'
                  '7. Vehicle Sharing: Fuel Efficiency, Energy Efficiency\n'
                  '8. Public Transportation: Electric Bus, Electric Bike, Electric Cycle\n'
                  '9. Cycling and Walking: Electric Bike, Electric Cycle\n'
                  '10. Carbon Offsetting: Carbon Emission, Renewable Water, Carbon Fibre\n')

        # Get the segment mapping from the model
        res = get_mapping(mapping_prompt, points, segments)
        if res:
            map = clean_and_format_text(res)

def process_text(text):
    # Define a dictionary to store the results
    result = {
        'Mitigation Strategies': [],
        'Mapping': []
    }
    text = text.replace('##', '').strip()
    # Split the text into sections based on the headers
    sections = re.split(r'\n##\s*', text)
    for section in sections:
        if not section.strip():
            continue
        # Extract section title and content
        title_match = re.match(r'^([^\n]+)', section)
        if title_match:
            title = title_match.group(1).strip()
            content = section[len(title):].strip()
            if title == 'Mitigation Strategies':
                strategies = re.split(r'\d+\.\s*', content)
                strategies = [s.strip() for s in strategies if s.strip()]
                result['Mitigation Strategies'] = strategies
            elif title == 'Mapping':
                mapping = re.split(r'\d+\.\s*', content)
                mapping = [m.strip() for m in mapping if m.strip()]
                result['Mapping'] = mapping
    return result

def map_mitigation_strategies(mitigation_dict):
    """
    Maps mitigation strategies to their topics and formats the output.

    Parameters:
    - mitigation_dict: A dictionary containing 'Mitigation Strategies' and 'Mapping'.

    Returns:
    - A formatted string with topics, tags, and strategies.
    """
    # Create a dictionary to map topics to strategies
    topic_to_strategies = {}

    # Populate the dictionary with topics and their strategies
    for entry in mitigation_dict['Mapping']:
        topic, tags = entry.split(': ')
        tags = tags.split(', ')
        
        # Find the strategy corresponding to the topic
        strategy = next((s for s in mitigation_dict['Mitigation Strategies'] if s.startswith(topic)), None)
        
        if strategy:
            # Extract the part after the colon in the strategy
            strategy_text = strategy.split(': ', 1)[1]
            
            if topic not in topic_to_strategies:
                topic_to_strategies[topic] = {
                    'Strategies': [],
                    'Tags': tags
                }
            topic_to_strategies[topic]['Strategies'].append(strategy_text)

    # Generate the formatted output
    output = []
    for topic, details in topic_to_strategies.items():
        output.append(f"Topic: {topic}")
        output.append("Tags: " + ", ".join(details['Tags']))
        output.append("Strategies:")
        for strategy in details['Strategies']:
            output.append(f"  - {strategy}")
        output.append("")  # Add a blank line for separation

    return "\n".join(output)


dict1 = process_text(miti)
dict2 = process_text(map)

d = {
    'Mitigation Strategies': dict1['Mitigation Strategies'],
    'Mapping': [
        dict2['Mapping'][i] if i < len(dict2['Mapping']) else dict1['Mitigation Strategies'][i]
        for i in range(len(dict1['Mitigation Strategies']))
    ]
}
print(map_mitigation_strategies(d))
