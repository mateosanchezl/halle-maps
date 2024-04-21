from flask import Flask, request, jsonify
import pandas as pd
import numpy as np

app = Flask(__name__)

# Haversine function to calculate distance
def haversine(lon1, lat1, lon2, lat2):
    lon1, lat1, lon2, lat2 = map(np.radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = np.sin(dlat/2)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2)**2
    c = 2 * np.arcsin(np.sqrt(a))
    r = 6371  # Radius of Earth in kilometers
    return c * r

# Function to predict temperature
def predict_temperature(year, month, lat, lon, df):
    df['distance'] = df.apply(lambda row: haversine(lon, lat, row['longitude'], row['latitude']), axis=1)
    closest_data = df[(df['yyyy'] == year) & (df['mm'] == month)].sort_values('distance').iloc[0]
    return closest_data['tmax'], closest_data['tmin']

# Load your data (this should be global or cached in a real application)
df = pd.read_csv('./model_df.csv')


@app.route('/predict', methods=['GET'])
def get_prediction():
    # Get parameters from request
    year = request.args.get('year', default=2020, type=int)
    month = request.args.get('month', default=1, type=int)
    latitude = request.args.get('latitude', type=float)
    longitude = request.args.get('longitude', type=float)

    # Predict temperatures
    try:
        tmax, tmin = predict_temperature(year, month, latitude, longitude, df)
        return jsonify({'tmax': tmax, 'tmin': tmin})
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
