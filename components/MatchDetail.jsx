import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import '../src/App.css';

const API_KEY = import.meta.env.VITE_APP_API_KEY;

const MatchDetail = () => {
  const { id } = useParams();
  const [matchDetails, setMatchDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const url = `https://api-football-beta.p.rapidapi.com/fixtures?id=${id}`;
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
        setMatchDetails(result.response[0]); // Assuming the API returns an array and we are interested in the first item
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!matchDetails) {
    return <div>Match not found</div>;
  }

  const dateObject = new Date(matchDetails.fixture.date);
  const formattedDate = dateObject.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="match-detail">
      <h3>Match Details</h3>
      <p>Date: {formattedDate}</p>
      <p>Venue: {matchDetails.fixture.venue.name}, {matchDetails.fixture.venue.city}</p>
      <div className="match-info">
        <div className="team">
          <img src={matchDetails.teams.home.logo} alt={matchDetails.teams.home.name}/>
          <p>{matchDetails.teams.home.name}</p>
        </div>
        <div className="match-stats">
          <h2>Score: {matchDetails.score.fulltime.home} - {matchDetails.score.fulltime.away}</h2>
        </div>
        <div className="team">
        <p>{matchDetails.teams.away.name}</p>
          <img src={matchDetails.teams.away.logo} alt={matchDetails.teams.away.name} />
          
        </div>
      </div>
    </div>
  );
};

export default MatchDetail;
