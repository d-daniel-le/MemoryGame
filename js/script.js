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
const displayTotal = document.querySelector(".display-total");
const stateKey = "Key_V1";
const totalMovesKey ="Total_Key";
const state = loadState();

let firstBox;
let secondBox;
let stopClick = false;
let moves;
let seconds = 0;
let timerValue =null;
let time = "";
let colorValue;

displayTotal.textContent = `Total Moves: ${Number(localStorage.getItem(totalMovesKey) || 0)}`;

// Create grid size
let size = 4;
// Difficulties();

if (!loadState()){
    Difficulties();
}else{
    (function loadCurrentState(){
        const state = loadState();
        if (state){
            size = state.size ?? 4;
            moves = state.moves ?? 0;
            seconds = state.seconds ?? 0;
            colorValue = state.themeColor ?? "#2196F3";
    
            document.querySelector(".moves").textContent = `Moves: ${moves}`;
            timerDisplay.textContent = `Time: ${String(Math.floor(seconds/60)).padStart(2,"0")}:${String(seconds%60).padStart(2,"0")}`;
    
            if (size === 4){
                selectOption.value = "Easy";
            }
            else if (size === 6){
                selectOption.value = "Medium";
            }
            else{
                selectOption.value = "Hard";
            }
    
            // rebuild grid
            GridSize(size, state.boxValues)
            
            if (!state.themeColor || state.themeColor === "#2196F3"){
                document.body.style.backgroundColor = "#d5e1ef";
            }
            else{
                document.body.style.backgroundColor = colorValue;
            }
    
            selectOption.style.color = colorValue;
            selectOption.style.border = `1px solid ${colorValue}`;
            newGame.style.setProperty("--theme-color", colorValue);
            theme.value = colorValue;

            // restore state of the grid
            const boxes = Array.from(document.querySelectorAll(".box"));

            firstBox = null;
            secondBox = null;
            stopClick = false;

            if (state.firstBox !== null && state.firstBox!== undefined){
                firstBox = boxes[state.firstBox];
            }

            if (state.secondBox !== null && state.secondBox!== undefined){
                secondBox = boxes[state.secondBox];
                stopClick = state.stopClick ? true : false;
            }

            boxes.forEach((box, i) => {
                if (state.matchedBoxes && state.matchedBoxes[i]){
                    box.classList.add("matched", "revealed");
                    box.style.backgroundColor = "#4CAF50";
                    box.style.border = `1px solid #4CAF50`;
                }
                else if (state.revealedBoxes && state.revealedBoxes[i]){
                    box.classList.add("revealed")
                    box.style.backgroundColor = "#4CAF50";
                    box.style.border = `1px solid #4CAF50`;
                }
                else{
                    box.style.backgroundColor = colorValue;
                    box.style.border = `1px solid ${colorValue}`;
    
                }
            })

            const notMatched = boxes.filter((box) => {
                return box.classList.contains("revealed") && !box.classList.contains("matched")
            })

            if (notMatched.length >= 2){
                notMatched.forEach(box => {
                    box.classList.remove("revealed");
                    box.style.backgroundColor = colorValue ?? "#2196F3"
                    box.style.border = `1px solid ${colorValue ?? "#2196F3"}`;

                })

                firstBox = null;
                secondBox = null;
                stopClick = false;
                saveState();
            }

            if (state.gameOveris){
                timerStop();
                const finishTime = state.endTime ?? time;
                gameOver.classList.add("game-over");
                gameOver.innerHTML = `<span>Game Over</span>You took ${moves} moves and ${finishTime}`;
                if (!count.contains(gameOver)){
                    count.append(gameOver);
                }
                
                const instruction = document.querySelector(".instruction");
                if (instruction){
                    instruction.hidden = true;
                }

            }

            // Timer Control
            if (state.gameOveris === false && state.seconds !== 0){
                timerStart();
            }
        }
        else{
            return;
        }
    })();
}

// syncing tabs
window.addEventListener("storage", (totalElement) => {
    if (totalElement.key !== totalMovesKey){
        return;
    }
    if (!displayTotal){
        return
    }
    displayTotal.textContent = `Total Moves: ${Number(totalElement.newValue || 0)}`;
})

// Default Theme
if (!state){
    document.querySelector(".new-game").style.setProperty("--theme-color", "#2196F3");
}

// Theme
theme.addEventListener("change", ()=>{
    colorValue = theme.value;
    document.querySelector("body").style.backgroundColor = colorValue;
    document.querySelectorAll(".box").forEach(function (box){
        if (!box.classList.contains("revealed")){
            box.style.backgroundColor = colorValue;
        }
        box.style.border = `1px solid ${colorValue}`;
    });
    document.querySelector("#difficulties").style.color = colorValue;
    document.querySelector("#difficulties").style.border = `1px solid ${colorValue}`;
    document.querySelector(".new-game").style.setProperty("--theme-color", colorValue);

    const earlierState = loadState() || {}
    saveState({gameOveris: earlierState.gameOveris, endTime: earlierState.endTime});

})

// Difficulty levels
selectOption.addEventListener("change", ()=>{
    Difficulties();
    document.querySelectorAll(".box").forEach(function (box){
        if (!box.classList.contains("revealed")){
            box.style.backgroundColor = colorValue;
        }
        box.style.border = `1px solid ${colorValue}`;
    });
    timerStop();
    timerDisplay.textContent = "Time: 00:00";
    seconds = 0;
    timerValue = null;
    gameOver.remove();
})

// Restart or starting new game
newGame.addEventListener("click", function (){
    timerStop();
    clearState();
    Difficulties();
    document.querySelectorAll(".box").forEach(function (box){
        if (!box.classList.contains("revealed")){
            box.style.backgroundColor = colorValue;
        }
        box.style.border = `1px solid ${colorValue}`;
    });
    timerDisplay.textContent = "Time: 00:00";
    seconds = 0;
    timerValue = null;
    gameOver.remove();
    saveState({ gameOveris: false, endTime: null});
})

// Grid Control
function GridSize (sizeInput, stateValue = null){
    if (!document.querySelector(".instruction")){
        const instruction = document.createElement("p");
        instruction.classList.add("instruction");
        instruction.innerHTML = "How to play:<br>Select 2 cards to find a match. The game ends when all cars are matched. <br>Let's the game begin!"
    
        document.querySelector(".count").append(instruction);    
    }

    if (!stateValue){
        moves = 0;
        document.querySelector(".moves").textContent = `Moves: ${moves}`;
    }
    grid.innerHTML = "";
    size = sizeInput;

    let totalBoxes = size * size;

    // Create value for boxes

    let value;
    if (stateValue && stateValue.length === totalBoxes){
        value = stateValue.slice();
    }
    else{
        value = [];
        for(let i = 0; i<totalBoxes/2; i++){
            const letter = String.fromCharCode(65 +i);
            value.push(letter, letter)
        }
    
        value.sort(function(){
            return Math.random() - 0.5;
        })
    }

    // Create boxes and insert a value
    for(let i = 0; i < totalBoxes; i++){
        const singleBox = document.createElement("button");
        singleBox.className = "box";
        singleBox.dataset.value = value[i];
        singleBox.textContent = value[i];
        singleBox.dataset.index = i;
        singleBox.addEventListener("click", function (){
            // if (document.querySelector(".instruction")){
            //     document.querySelector(".instruction").remove(".instruction")
            //     timerStart();
            // }

            const instruction = document.querySelector(".instruction");
            if (instruction){
                instruction.remove();
                timerStart();

            }

            flipCard.play();
            if (singleBox.classList.contains("matched")){
                return;
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
                firstBox.style.backgroundColor = "#4CAF50";
                firstBox.style.border = `1px solid #4CAF50`;
                saveState();
                return;
            }
            else{
                secondBox = singleBox;
                secondBox.classList.add("revealed");
                stopClick = true;
                secondBox.style.backgroundColor = "#4CAF50";
                secondBox.style.border = `1px solid #4CAF50`;
                saveState();
            }

            // comparison

            if (firstBox.dataset.value === secondBox.dataset.value){
                setTimeout(()=>{
                    rightAnswer.play()
                }, 1500);
                firstBox.classList.add("matched");
                secondBox.classList.add("matched");
                saveState();
                moves++;
                incrementTotalMoves();
                document.querySelector(".moves").textContent = `Moves: ${moves}`;
                saveState();
                resetMoves();

                if (grid.querySelectorAll(".matched").length ===totalBoxes){
                    timerStop();
                    saveState({ gameOveris: true, endTime: time});
                    gameOver.classList.add("game-over");
                    gameOver.innerHTML = `<span>Game Over</span>You took ${moves} moves and ${time}`;
                    count.append(gameOver)
                }
                
            }
            else{
                setTimeout(()=>{
                    wrongAnswer.play()
                }, 1200);
                moves++;
                incrementTotalMoves();
                document.querySelector(".moves").textContent = `Moves: ${moves}`;
                setTimeout(() => {
                    firstBox.classList.remove("revealed");
                    secondBox.classList.remove("revealed");
                    if (colorValue ===undefined){
                        firstBox.style.backgroundColor ="#2196F3"
                        secondBox.style.backgroundColor = "#2196F3"
                        firstBox.style.border = "#2196F3";
                        secondBox.style.border = "#2196F3";

                    } else{
                        firstBox.style.backgroundColor = colorValue;
                        secondBox.style.backgroundColor = colorValue;
                        firstBox.style.border = `1px solid ${colorValue}`;
                        secondBox.style.border = `1px solid ${colorValue}`;
                    }

                    resetMoves();
                    saveState();
                }, 900);
            }
        });
        
        grid.append(singleBox);
    }

    grid.style.gridTemplateColumns = `repeat(${size}, 60px)`;
    
    if (!stateValue){
        saveState();
    }

    
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

    if(timerValue){
        return;
    }

    timerValue = setInterval(function(){
        seconds++;
        
        const mins = Math.floor(seconds/60)
        const secs = seconds % 60;

        time = `${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`

        timerDisplay.textContent = `Time: ${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;
        
        if(!document.hidden && seconds % 5 === 0){
            saveState();
        }
        
    }, 1000); 
    
}

function timerStop(){
    clearInterval(timerValue);
    timerValue = null;
}

function incrementTotalMoves(){
    const total = Number(localStorage.getItem(totalMovesKey) || 0) + 1
    localStorage.setItem(totalMovesKey, total)

    displayTotal.textContent = `Total Moves: ${total}`;
}

// State Functions
function saveState(additionalState = {}){
    const gridBoxes = Array.from(document.querySelectorAll(".box"));

    const state = {
        "size": size,
        "moves": moves,
        "seconds": seconds,
        "themeColor": colorValue === undefined || colorValue === null ? "#2196F3" : colorValue,
        "boxValues": gridBoxes.map( box => box.dataset.value),
        "matchedBoxes": gridBoxes.map( box => box.classList.contains("matched")),
        "revealedBoxes": gridBoxes.map( box => box.classList.contains("revealed")),
        "firstBox": firstBox ? Number(firstBox.dataset.index) : null,
        "secondBox": secondBox ? Number(secondBox.dataset.index) : null,
        "stopClick": stopClick,
        ...additionalState
    };

    sessionStorage.setItem(stateKey, JSON.stringify(state));
}

function loadState(){
    const getCurrentState = sessionStorage.getItem(stateKey);

    if (!getCurrentState){
        return null;
    }
    
    try{
        return JSON.parse(getCurrentState);
    }
    catch{
        return null;
    }
}

function clearState(){
    sessionStorage.removeItem(stateKey);
}