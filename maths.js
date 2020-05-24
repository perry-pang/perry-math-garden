const MAXIMUM_FIGURE = 9;
var answer;
var score = 0;
var backGroundImages = [];

function nextQuestion() {
    const n1 = Math.floor(Math.random() * MAXIMUM_FIGURE)
    const n2 = Math.ceil(Math.random() * (MAXIMUM_FIGURE - n1))

    document.getElementById('n1').innerHTML = n1;
    document.getElementById('n2').innerHTML = n2;

    answer = n1 + n2;

}

function checkAnswer() {
    const prediction = predictImage();
    // console.log(`answer: ${answer}, prediction: ${prediction}`);
    
    if (prediction == answer) {
        if (score >= 6) {
            alert("Well cone! You math garden is in full bloom! Want to start it again?");
            score = 0;
            backGroundImages = [];
            document.body.style.backgroundImage = backGroundImages;
        } else {
            score++;
            // console.log(`Correct! Score ${score}`);
            backGroundImages.push(`url('images/background${score}.svg')`);
            document.body.style.backgroundImage = backGroundImages;
        }
    } else {
        alert("Oops! Check your calculation and try writing the nunmber neater next time!");
        if (score > 0) {
            score--;
        }
        setTimeout(function () {
            backGroundImages.pop();
            document.body.style.backgroundImage = backGroundImages;
        }, 1000);
    // console.log(`Wrong! Score ${score}`);
    }
    
}