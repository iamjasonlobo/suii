import { useState, useEffect } from 'react';
import './App.css';

const API_KEY = import.meta.env.VITE_APP_API_KEY;
const RECORDS_PER_PAGE = 20;

const App = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [weeklyStats, setWeeklyStats] = useState({ matches: 0, goals: 0, extraTimeMatches: 0 });

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
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const weeklyMatches = matches.filter(match => {
      const matchDate = new Date(match.fixture.date);
      return matchDate >= startOfWeek && matchDate <= endOfWeek && (match.teams.home.name === 'Manchester City' || match.teams.away.name === 'Manchester City');
    });

const weeklyGoals = weeklyMatches.reduce((total, match) => {
  return total + (match.teams.home.name === 'Manchester City' ? match.goals.home : 0)
               + (match.teams.away.name === 'Manchester City' ? match.goals.away : 0);
}, 0);


    const extraTimeMatches = weeklyMatches.filter(match => match.score.extratime.home !== null).length;

    setWeeklyStats({ matches: weeklyMatches.length, goals: weeklyGoals, extraTimeMatches });
  }, [matches]);

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
      <div className='header'>
        <div className='logo'>suii</div>
        <div>
          <ul>
            <li>Dashboard</li>
            <li>Search</li>
            <li>About</li>
          </ul>
        </div>
      </div>

      <div>
        <h4>Manchester City | Last Week Recap</h4>
        <div className='summary-container'>
          <div className='summary-card'>
            <h1>{weeklyStats.matches}</h1>
            <h4>Matches</h4>
          </div>
          <div className='summary-card'>
            <h1>{weeklyStats.goals}</h1>
            <h4>Goals</h4>
          </div>
          <div className='summary-card'>
            <h1>{weeklyStats.extraTimeMatches}</h1>
            <h4>Extra Time Matches</h4>
          </div>
        </div>
      </div>
      <table className='matches-table'>
        <thead>
          <tr>
            <th>Date</th>
            <th>Match</th>
            <th>Goals</th>
            <th>Extra Time</th>
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
