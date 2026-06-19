import React from "react";
import { useEffect, useState, useRef } from "react";

function App() {
  const countdownSound = useRef(
    new Audio("./assets/sound/mixkit-short-race-countdown-926.wav")
  );

  const correctAnswer = useRef(
    new Audio("./assets/sound/mixkit-correct-answer-tone-2870.wav")
  );

  const tickingClock = useRef(
    new Audio("./assets/sound/mixkit-bell-tick-tock-timer-1046.wav")
  );

  const gameSound = useRef(
    new Audio("./assets/sound/Sakura-Girl-Beach-chosic.com_.mp3")
  );

  const mouseClick = useRef(
    new Audio("./assets/sound/Mouse-Click-00-c-FesliyanStudios.com.mp3")
  );

  const [scoresArray, setScoresArray] = useState(
    JSON.parse(localStorage.getItem('scores')) || []
  );
  
  const [started, setStarted] = useState(false);
  const [gameVisible, setGameVisible] = useState(false);
  const [btnVisible, setBtnVisible] = useState(true);
  const [countDown, setCountDown] = useState('');
  const [word, setWord] = useState('');
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(20);
  const [gameOver, setGameOver] = useState(false);
  const [animateScore, setAnimateScore] = useState(false);
  const [totalWords, setTotalWords] = useState(0);
  const [allWords, setAllWords] = useState([]);
  const scoreRef = useRef(0);

  function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
  }

  const [shuffledWords, setShuffledWords] = useState([]);

  useEffect(() => {
    async function loadWords() {
      const response = await fetch(
        'https://api.datamuse.com/words?sp=?????&max=100'
      );
      
      const data = await response.json();
      const words = data.map(word => word.word);
      setAllWords(words);
      setTotalWords(words.length);
      setShuffledWords(shuffleArray(words));
    }

    loadWords();
  }, []);

  function saveScore(score) {
    const gameData = {
      hits: score,
      percentage: ((score / totalWords) * 100).toFixed(2),
    };

    const updatedScores = [...scoresArray, gameData]
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 10);

    setScoresArray(updatedScores);
    localStorage.setItem("scores", JSON.stringify(updatedScores));
  }


  function startGame() {
    mouseClick.current.play();
    setBtnVisible(false);
    let count = 3;
    
    const interval = setInterval(() => {
      countdownSound.current.play();
      
      if (count > 0) {
        setCountDown(count);
        count--;
      } 
      else {
        if (timer <= 10) {
          tickingClock.current.play();
        }
        gameSound.current.play();
        clearInterval(interval);
        setCountDown('');
        nextWord();
        scoreRef.current = 0;
        setScore(0);        
        setTimer(20);
        setGameOver(false);
        setGameVisible(true);
        setStarted(true);
      }

    }, 1000);
  }


  function nextWord() {
    if (shuffledWords.length === 0) {
      endGame();
      return;
    }

    const wordsLeft = [...shuffledWords];
    const next = wordsLeft.pop();

    setWord(next);
    setInput('');
    setShuffledWords(wordsLeft);
  }


  function endGame() {
    gameSound.current.pause();
    tickingClock.current.pause();
    setGameOver(true);
    saveScore(scoreRef.current);
  }

  function resetGame() {
    scoreRef.current = 0;
    setScore(0);
    setTimer(20);
    setInput('');
    setWord('');
    setGameOver(false);
    setGameVisible(false);
    setStarted(false);
    setBtnVisible(true);
    setCountDown('');
    setShuffledWords(shuffleArray(...allWords));
  }


  function handleInput(e) {
    const value = e.target.value;

    setInput(value);

    if (value === word) {
      correctAnswer.current.play();
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setAnimateScore(true);
      setTimeout(() => setAnimateScore(false), 500);
      nextWord();
    }
  }


  useEffect(() => {
    if(!gameVisible || gameOver) return;

    const interval = setInterval(() => {
      setTimer(prev => {
        if(prev <= 1){
          clearInterval(interval);
          endGame();
          return 0;
        }
        if (prev === 11) {
          tickingClock.current.play();
        }

        return prev - 1;
      });

    },1000);
    return () => clearInterval(interval);
  }, [gameVisible, gameOver]);


return (
    <>
      {!started && (
        <div className="startPage">
          <p className="countDown">
            {countDown}
          </p>
            {btnVisible && (
              <button 
                className="startBtn"
                onClick={startGame}
              >
                <span>Start game!</span>
              </button>
            )}
        </div>
      )}

      {gameVisible && (
        <div className="everything">
          <p className="timer">
            Time: {timer}s
          </p>
          <div className="game-container">
          <h1 className="your-text-class">
            {"Word Timer".split("").map((char, index) => (
              <span
                key={index}
                style={{
                  animationDelay: `0.${index + 1}s`
                }}
              >
                {char}
              </span>
            ))}
          </h1>
            {!gameOver ? (
              <>
                <p className="word-display">
                  {word.split("").map((char,index)=>(
                    <span
                      key={index}
                      className={
                        input[index] === char
                          ? "matched-letter"
                          : ""
                      }
                    >
                      {char}
                    </span>
                  ))}
                </p>
                <input
                  className="user-input"
                  value={input}
                  onChange={handleInput}
                  autoFocus
                />
                <p className={`score ${animateScore ? 'score-animation' : ''}`}>
                  {`Hits: ${score}`}
                </p>
              </>

            ) : (
              <>
                <div className="scoreTable">
                  <h2>HIGH SCORES</h2>
                  <ul className="scoreboard">
                    {scoresArray.length > 0 ? (
                      scoresArray.map((score, index) => (
                        <li key={index}>
                          {`#${index + 1}: ${score.hits} words ${score.percentage}%`}
                        </li>
                      ))
                    ) : (
                      <p>No games have been played.</p>
                    )}
                  </ul>
                </div>
                <p className="game-over">
                  Game Over!
                </p>
                <button className="reset" onClick={resetGame}>
                  reset
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
