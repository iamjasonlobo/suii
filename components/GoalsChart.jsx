import React, { useEffect, useState } from 'react';
import '../src/App.css'

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Label
} from "recharts";

const API_KEY = import.meta.env.VITE_APP_API_KEY;

const GoalsChart = () => {
  const [goalsHistory, setGoalsHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const cleanData = (data) => {
    return data.filter(match => match.teams.home && match.goals.home !== null)
      .map(match => ({
        date: new Date(match.fixture.date).toLocaleDateString('en-GB'),
        homeTeam: match.teams.home.name,
        goals: match.goals.home
      }))
      .reverse();
  };

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const url = `https://api-football-beta.p.rapidapi.com/fixtures?season=2023&league=39&from=${thirtyDaysAgo.toISOString().split('T')[0]}&to=${today.toISOString().split('T')[0]}`;
      const options = {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': 'api-football-beta.p.rapidapi.com'
        }
      };

      try {
        const response = await fetch(url, options);
        const result = await response.json();
        const cleanedData = cleanData(result.response);
        setGoalsHistory(cleanedData);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <br></br>
      <h2>30-Day Home Team Goals</h2>
      <LineChart
        width={700}
        height={300}
        data={goalsHistory}
        margin={{
          top: 10,
          right: 30,
          left: 20,
          bottom: 30,
        }}
      >
        <Line
          type="monotone"
          dataKey="goals"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
        <CartesianGrid strokeDasharray="5 5" />
        <XAxis dataKey="date" interval={2} angle={20} dx={20}>
          <Label value="Date" offset={-10} position="insideBottom" />
        </XAxis>
        <YAxis
          label={{
            value: "Goals",
            angle: -90,
            position: "insideLeft",
            textAnchor: "middle",
          }}
        />
        <Tooltip />
      </LineChart>
    </div>
  );
};

export default GoalsChart;
