let n = 0
let wins = 0;
let losses = 0;
let useRandomAI = false;


const l = [1,2,3,4,5]; // list to randomly choose from
const odd = [1,3,5];
const even = [2,4];

let probs = [0.2, 0.2, 0.2, 0.2, 0.2]; // prior probability array/distribution
const uniform = [0.2, 0.2, 0.2, 0.2, 0.2]; // uniform one used for decay 
const alpha = 0.8; // decay factor

document.getElementById("aiToggle").addEventListener("click", () => {
    useRandomAI = !useRandomAI;

    document.getElementById("aiToggle").textContent =
        useRandomAI ? "AI: Random" : "AI: Adaptive";
}); // configuring button, upon click, reverses boolean and changes text


const userNum = document.getElementById("userInput");

function updStatsBox() {
    const total = wins + losses;
    const winrate = total === 0 ? 0 : Math.round((wins/total) * 100);

    document.getElementById("wins").textContent = `Wins: ${wins}`;
    document.getElementById("losses").textContent = `Losses: ${losses}`;
    document.getElementById("winrate").textContent = `Winrate: ${winrate}%`;
} // function that updates the statistics within the stats box in the top right

function finishRound(u, compNum) {

    const result = document.getElementById("resultText");
    const totalSum = u + compNum;

    if (totalSum % 2 === 0) {
        result.textContent = `You win! The AI chose: ${compNum}`;
        result.style.color = "green";
        wins++;
    } else {
        result.textContent = `You lose! The AI chose: ${compNum}`;
        result.style.color = "red";
        losses++;
    }

    n++;

    scoreChart.data.datasets[0].data = [wins, losses];
    scoreChart.update();

    updStatsBox();
    updateBrainVisualiser();

}

function updateBrainVisualiser() {

    const displayProbs = useRandomAI 
        ? [0.2, 0.2, 0.2, 0.2, 0.2]
        : probs; // use boolean to determine whether to use uniform array for visuals or not

    for (let i = 0; i < displayProbs.length; i++) {
        const node = document.getElementById(`node${i+1}`);
        const wrap = node.parentElement;
        const p = displayProbs[i];

        // size configurations
        const size = 40 + p * 60;
        node.style.width = `${size}px`;
        node.style.height = `${size}px`;

        // colour configurations
        let color;
        if (useRandomAI) {
            color = "#3a7bd5"; // calm blue
        } else {
            if (p < 0.1) color = "#3a7bd5";
            else if (p < 0.3) color = "#6a4bc4";
            else if (p < 0.6) color = "#d64bc4";
            else color = "#ff4b4b";
        }

        node.style.background = `radial-gradient(circle, ${color}, #111)`;
        node.style.boxShadow = `0 0 ${p*40}px ${color}`;

        // dim in random mode, for inactive feel
        node.style.opacity = useRandomAI ? "0.6" : "1";

        // pulse only in adaptive mode
        if (!useRandomAI) {
            wrap.classList.add("pulse");
            setTimeout(() => wrap.classList.remove("pulse"), 450);
        }
    }
}

// function that uses bayesian updating to update probabilities for ai

function upd_probs(){

    const result = document.getElementById("resultText");
    const u = Number(userNum.value); // user input, number typed in

    if (isNaN(u) || u < 1 || u > 5) {
        result.textContent = "Enter a number between 1 and 5";
        result.style.color = "cyan";
        return;
    } // text pops up upon typing an invalid input in

    let compNum;

    let lArray = [0.1, 0.1, 0.1, 0.1, 0.1]; // likelihood array (changes later)

    if (useRandomAI) {
        compNum = Math.floor((Math.random() * 5) + 1)
    } // if else statements to toggle the random/adaptive modes of the ai
    else {

    if (n==0){
        compNum = Math.floor((Math.random() * 5) + 1)
        finishRound(u, compNum);
        return;
    } // if first go, assume complete randomness of user


    lArray[u - 1] = 0.6 // changes likelihood array so whatever number user inputted, that probability place in likelihood array is changed to 0.6
    
    // process of bayesian updating below 

    probs = (probs.map((p, i) => p * lArray[i]));

    const sum = (probs.reduce((total, n) => total + n, 0));

    probs = probs.map(p => p / sum);

    probs = probs.map((p, i) => p * alpha + (1 - alpha) * uniform[i]);

    // finds index in array with largest probability value for AI to work out best counter move

    const idx = (probs.indexOf(Math.max(...probs)) + 1) % 2;

    if (idx == 0){
        compNum = odd[Math.floor(Math.random() * odd.length)];
       
    }

    else {
        compNum = even[Math.floor(Math.random() * even.length)];
    }}

    // win/lose statement, text update

    const totalSum = u + compNum;

    if ((totalSum % 2) == 0){
        result.textContent = `You win! The AI chose: ${compNum}`;
        result.style.color = "green";
        wins++;
    }

    else {
        result.textContent = `You lose! The AI chose: ${compNum}`;
        result.style.color = "red";
        losses++;
    }


    n++;
    scoreChart.data.datasets[0].data = [wins, losses];
    scoreChart.update();
    updStatsBox();
    updateBrainVisualiser();

}


// if enter key pressed, begin processing etc. 

userNum.addEventListener("keydown", (event) => {
    if (event.key == "Enter"){
        upd_probs();
    }
});

// creating bar chart with Chartjs

const ctx = document.getElementById("scoreChart").getContext("2d");

const scoreChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Wins', 'Losses'],
        datasets: [{
            label: 'Score',
            data: [wins, losses],
            backgroundColor: ["green", "red"]
        }]
    }, 

    options: {
        scales: {
            y: { beginAtZero: true}
        }
    }
});
