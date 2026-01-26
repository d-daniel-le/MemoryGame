const grid = document.querySelector(".game-grid");
const selectOption = document.querySelector("#difficulties");
const newGame = document.querySelector(".new-game");
const timerDisplay = document.querySelector(".timer");
const count = document.querySelector(".count")
const gameOver = document.createElement("p");
const theme = document.querySelector("input.color");
const wrongAnswer = document.querySelector("#wrong-answer");
const rightAnswer = document.querySelector("#right-answer");
const flipCard = document.querySelector("#flip-card");

let firstBox;
let secondBox;
let stopClick = false;
let moves;
let seconds = 0;
let timerValue =null;

// Create grid size
let size = 4;
Difficulties();

theme.addEventListener("change", ()=>{
    let colorValue = theme.value;
    document.querySelector("body").style.backgroundColor = colorValue;
})

selectOption.addEventListener("change", ()=>{
    Difficulties();
    timerStop();
    timerDisplay.textContent = "Time: 00:00";
    gameOver.remove();
})

newGame.addEventListener("click", function (){
    Difficulties();
    timerStop();
    timerDisplay.textContent = "Time: 00:00";
    gameOver.remove();
})

function GridSize (sizeInput){
    
    moves = 0;
    document.querySelector(".moves").textContent = `Moves: ${moves}`;
    grid.innerHTML = "";
    size = sizeInput;

    let totalBoxes = size * size;

    // Create value for boxes

    const value = [];
    for(let i = 0; i<totalBoxes/2; i++){
        const letter = String.fromCharCode(65 +i);
        value.push(letter, letter)
    }

    value.sort(function(){
        return Math.random() - 0.5;
    })

    // Create boxes and insert a value
    for(let i = 0; i < totalBoxes; i++){
        const singleBox = document.createElement("button");
        singleBox.className = "box";
        singleBox.dataset.value = value[i];
        singleBox.textContent = value[i];
        singleBox.addEventListener("click", function (){
            timerStart();
            flipCard.play();
            if (singleBox.classList.contains("matched")){
                return
            }

            // if the comparison is happening, don't let the user click
            if (stopClick){
                return;
            }
            
            // prevent accidental reassignment to the second box if it's already clicked
            if (firstBox === singleBox){
                return;
            }

            // assign values
            if (!firstBox){
                firstBox = singleBox;
                firstBox.classList.add("revealed");
                return;
            }
            else{
                secondBox = singleBox;
                secondBox.classList.add("revealed");
                stopClick = true;
            }

            // comparison

            if (firstBox.dataset.value === secondBox.dataset.value){
                setTimeout(()=>{
                    rightAnswer.play()
                }, 1500);
                firstBox.classList.add("matched");
                secondBox.classList.add("matched");
                moves++;
                document.querySelector(".moves").textContent = `Moves: ${moves}`;
                resetMoves();

                if (grid.querySelectorAll(".matched").length ===totalBoxes){
                    timerStop();
                    gameOver.classList.add("game-over");
                    gameOver.textContent = "Game Over";
                    count.append(gameOver)
                }
                
            }
            else{
                setTimeout(()=>{
                    wrongAnswer.play()
                }, 1200);
                moves++;
                document.querySelector(".moves").textContent = `Moves: ${moves}`;
                setTimeout(() => {
                    firstBox.classList.remove("revealed");
                    secondBox.classList.remove("revealed");
                    resetMoves();
                }, 900);
            }
        });
        
        grid.append(singleBox);
    }

    grid.style.gridTemplateColumns = `repeat(${size}, 60px)`;

    
}

// Support Function
function resetMoves(){
    firstBox = null;
    secondBox = null;
    stopClick = false;
}

function Difficulties(){
    if (selectOption.value === "Easy"){
        GridSize(4);
    }
    else if (selectOption.value === "Medium"){
        GridSize(6);
    }
    else{
        GridSize(8);
    }
}

function timerStart(){
    if (timerValue !== null ){
        return;
    }

    timerValue = setInterval(function(){
        seconds++;

        const mins = Math.floor(seconds/60)
        const secs = seconds % 60;

        timerDisplay.textContent = `Timer: ${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;

    }, 1000)
}

function timerStop(){
    clearInterval(timerValue);
}