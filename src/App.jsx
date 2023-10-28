import { useState, useEffect } from 'react';
import './App.css';
import GoalsChart from '../components/GoalsChart';
import { useNavigate } from 'react-router-dom';

const API_KEY = import.meta.env.VITE_APP_API_KEY;
const RECORDS_PER_PAGE = 20;

const App = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [weeklyStats, setWeeklyStats] = useState({ homeGoals: 0, awayGoals: 0, extraTimeMatches: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const url = 'https://api-football-beta.p.rapidapi.com/fixtures?season=2023&league=39';
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
        setMatches(result.response);
        calculateWeeklyStats(result.response);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const calculateWeeklyStats = (matches) => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const weeklyMatches = matches.filter(match => {
      const matchDate = new Date(match.fixture.date);
      return matchDate > lastWeek && matchDate <= new Date();
    });

    const homeGoals = weeklyMatches.reduce((acc, match) => acc + match.goals.home, 0);
    const awayGoals = weeklyMatches.reduce((acc, match) => acc + match.goals.away, 0);
    const extraTimeMatches = weeklyMatches.filter(match => match.score.extratime.home !== null || match.score.extratime.away !== null).length;

    setWeeklyStats({ homeGoals, awayGoals, extraTimeMatches });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);  // Reset hours, minutes, seconds, and milliseconds

  // Filter matches to only include those on or before today
  const filteredMatches = matches.filter(match => {
    const matchDate = new Date(match.fixture.date);
    return matchDate <= today;
  });

  // Custom sort function to sort matches by date with today's date first
  const sortedMatches = filteredMatches.slice().sort((a, b) => {
    const dateA = new Date(a.fixture.date);
    const dateB = new Date(b.fixture.date);
    return Math.abs(dateA - today) - Math.abs(dateB - today);
  });

  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = startIndex + RECORDS_PER_PAGE;
  const displayedMatches = sortedMatches.slice(startIndex, endIndex);

  const totalPages = Math.ceil(sortedMatches.length / RECORDS_PER_PAGE);

  return (
    <>
      <div>
        <h4>Last Week Recap</h4>
        <div className='summary-container'>
          <div className='summary-card'>
            <h1>{weeklyStats.homeGoals}</h1>
            <h4>Home Team Goals</h4>
          </div>
          <div className='summary-card'>
            <h1>{weeklyStats.awayGoals}</h1>
            <h4>Away Team Goals</h4>
          </div>
          <div className='summary-card'>
            <h1>{weeklyStats.extraTimeMatches}</h1>
            <h4>Extra Time Matches</h4>
          </div>
        </div>
      </div>

      <div className='graph-container'><GoalsChart /></div>
      

      <table className='matches-table'>
        <thead>
          <tr>
            <th>Date</th>
            <th>Match</th>
            <th>Goals</th>
            <th>Extra Time</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {displayedMatches.map((match, index) => {
            const dateObject = new Date(match.fixture.date);
            const formattedDate = dateObject.toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            });
            return (
              <tr key={index}>
                <td>{formattedDate}</td>
                <td>{match.teams.home.name} v {match.teams.away.name}</td>
                <td>{match.goals.home} - {match.goals.away}</td>
                <td>{match.score.extratime.home !== null ? 'Yes' : 'No'}</td>
                <td>
                  <button onClick={() => navigate(`/matchDetails/${match.fixture.id}`)}>ℹ️</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={() => setCurrentPage(prevPage => Math.max(prevPage - 1, 1))} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages))} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </>
  );
};

export default App;
