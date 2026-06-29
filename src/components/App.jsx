import React from "react";
import { useEffect, useState, useRef } from "react";
import ScoreTable from "./ScoreTable.jsx";
import DifficultyBtns from "./DifficultyBtns.jsx";

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
  const [diffBtnVisible, setDiffBtnVisible] = useState(false);
  const [countDown, setCountDown] = useState('');
  const [word, setWord] = useState('');
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [animateScore, setAnimateScore] = useState(false);
  const [totalWords, setTotalWords] = useState(0);
  const [allWords, setAllWords] = useState([]);
  const [shuffledWords, setShuffledWords] = useState([]);
  const scoreRef = useRef(0);

  function shuffleArray(array) {
    return [...array].sort(() => Math.random() - 0.5);
  }

  async function fetchWords(gameLevel) {
    const wordLength = "?".repeat(gameLevel);
    
    const response = await fetch(
      `https://api.datamuse.com/words?sp=${wordLength}&max=100`
    );
    
    const data = await response.json();
    const words = data.map(word => word.word);
    console.log("Fetched words:", words);
    setAllWords(words);
    setTotalWords(words.length);
    const shuffled = shuffleArray(words);
    setShuffledWords(shuffled);
    return shuffled; 
  }
  
  function setDifficulty() {
    mouseClick.current.play();
    setBtnVisible(false);
    setDiffBtnVisible(true);
  }

  function saveScore(score) {
    const gameData = {
      hits: score,
      percentage: totalWords > 0 ? ((score / totalWords) * 100).toFixed(2) : 0,
    };

    const updatedScores = [...scoresArray, gameData]
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 10);

    setScoresArray(updatedScores);
    localStorage.setItem("scores", JSON.stringify(updatedScores));
  }

  async function startGame(gameLevel) {
    mouseClick.current.play();
    setDiffBtnVisible(false);
    
    const words = await fetchWords(gameLevel);
    
    if (!words || words.length === 0) {
      console.error("No words fetched!");
      return;
    }
    
    let count = 3;
    
    const interval = setInterval(() => {
      countdownSound.current.play();
      
      if (count > 0) {
        setCountDown(count);
        count--;
      } 
      else {
        gameSound.current.play();
        clearInterval(interval);
        setCountDown('');
        
        const wordsLeft = [...words];
        const firstWord = wordsLeft.pop();
        setWord(firstWord);
        setShuffledWords(wordsLeft);
        
        scoreRef.current = 0;
        setScore(0);        
        setTimer(30);
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
    setTimer(30);
    setInput('');
    setWord('');
    setGameOver(false);
    setGameVisible(false);
    setStarted(false);
    setBtnVisible(true);
    setCountDown('');
    setShuffledWords([]);
    setAllWords([]);
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
    }, 1000);
    
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
              onClick={setDifficulty}
            >
              <span>Start game!</span>
            </button>
          )}
          {diffBtnVisible && (
            <DifficultyBtns startGame={startGame}/>
          )}
        </div>
      )}

      {gameVisible && (
        <div className="everything">
          <p className={`timer ${timer <= 10 ? 'flash' : ''}`}>
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
                  {word ? word.split("").map((char, index) => (
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
                  )) : "Loading..."}
                </p>
                <input
                  className="user-input"
                  value={input}
                  onChange={handleInput}
                  autoFocus
                  disabled={!word}
                />
                <p className={`score ${animateScore ? 'score-animation' : ''}`}>
                  {`Hits: ${score}`}
                </p>
              </>
            ) : (
              <>
                <ScoreTable scoresArray={scoresArray} />
                <p className="game-over">
                  Game Over!
                </p>
                <button className="reset" onClick={resetGame}>
                  Reset
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
