import React from 'react'

export default function DifficultyBtns({startGame}) {
  return (
    <div className="difficultyBtns">
        <p className="difficultyHeader"> CHOOSE YOUR CHALLENGE </p>
        <div className="difficultyOptions">
        <div className="difficultyCard easy">
            <button onClick={() => startGame(4)}>
            <span>Easy</span>
            </button>
            <div className="difficultyLabel">
            4 letters
            <span>Perfect for beginners</span>
            </div>
        </div>
        
        <div className="difficultyCard medium">
            <button onClick={() => startGame(7)}>
            <span>Medium</span>
            </button>
            <div className="difficultyLabel">
            7 letters
            <span>For intermediate players</span>
            </div>
        </div>
        
        <div className="difficultyCard hard">
            <button onClick={() => startGame(10)}>
            <span>Hard</span>
            </button>
            <div className="difficultyLabel">
            10 letters
            <span>For typing masters</span>
            </div>
        </div>
        </div>
    </div>
  )
}