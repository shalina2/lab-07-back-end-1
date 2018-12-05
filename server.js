'use strict';

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
require('dotenv').config();
const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});

// Error Handler
function handleError(err, res) {
  console.error(err);
  if (res) res.status(500).send('This location is not a valid input');
}

// Requests location data
app.get('/location', (req, res) => {
  searchToLatLong(req.query.data).then(location => res.send(location)).catch(error => handleError(error, res));
});

// Requests weather data
app.get('/weather', getWeather);

// Location constructor
function Location(query, res) {
  this.formatted_query = res.body.results[0].formatted_address;
  this.latitude = res.body.results[0].geometry.location.lat;
  this.longitude = res.body.results[0].geometry.location.lng;
  this.search_query = query;
}

// Weather constructor
function Weather(day) {
  this.forecast = day.summary;
  this.current_time = new Date(day.time * 1000).toDateString();
}

// Helper function for location
function searchToLatLong(query) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;

  return superagent.get(url).then(res => {
    return new Location(query, res)
  }).catch(error => handleError(error));
}

// Helper function for weather
function getWeather(req, res) {
  const url = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${req.query.data.latitude},${req.query.data.longitude}`;

  superagent.get(url).then(result => {
    const weatherSummaries = result.body.daily.data.map(day => {
      return new Weather(day);
    });
    res.send(weatherSummaries);
  }).catch(error => handleError(error));
}
