import React from 'react';

function ScoreTable({ scoresArray }) {
  return (
    <div className="scoreTable">
      <h2>HIGH SCORES</h2>
      <ul className="scoreboard">
        {scoresArray?.length > 0 ? (
          scoresArray.map((score, index) => (
            <li key={index}>{`#${index + 1}: ${score.hits} words ${score.percentage}%`}</li>
          ))
        ) : (
          <p>No games have been played.</p>
        )}
      </ul>
    </div>
  );
}

export default ScoreTable;

