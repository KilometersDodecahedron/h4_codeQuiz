//0 is question, 1-4 are possible answers, 5 is correct array number
$(document).ready(function(){
    //holder for start menu
    var mainMenu = $("#start-menu");
    var highScoreList = $("#list-of-high-scores");
    var startButton = $("#start-button");

    //holder for results screen
    var resultsScreen = $("#results-screen");
    var numberOfCorrectAnswersDisplay = $("#number-of-correct");
    var finalTimeRemainingDisplay = $("#final-time-remaining");
    var finalScoreDisplay = $("#final-score-display");

    var madeTopScoreHolder = $("#initials-input-holder");
    var initialsInputField = $("#initials-input");
    var finishedInputingInitialsButton = $("#accept-initial-input-button");
    var returnToMainMenuButton = $("#return-to-main-menu-button");

    //holder for the quiz area
    var quizSection = $("#quizElements");
    var questionDisplayElement = $("#questionDisplay");
    
    //the radio input buttons, and the array that holds them
    var radioButtonOne = $("#buttonOne");
    var radioButtonTwo = $("#buttonTwo");
    var radioButtonThree = $("#buttonThree");
    var radioButtonFour = $("#buttonFour");
    var answerButtons = [radioButtonOne, radioButtonTwo, radioButtonThree, radioButtonFour];

    //text next to buttons where potential answers are displayed
    var possibleAnswerDisplayOne = $("#answerOne");
    var possibleAnswerDisplayTwo = $("#answerTwo");
    var possibleAnswerDisplayThree = $("#answerThree");
    var possibleAnswerDisplayFour = $("#answerFour");
    var buttonTextArray = [possibleAnswerDisplayOne, possibleAnswerDisplayTwo, possibleAnswerDisplayThree, possibleAnswerDisplayFour];
    var timeRemainingDisplayElement = $("#timeRemainingDisplay");

    //after picking an answer, this element reveals and displays whether they got it right
    var informPlayerOfAnswerAlertElement = $("#answerReveal");

    var nextQuestionButton = $("#nextQuestionButton");

    //question and answer array
    var arrayOfQuestionAndAnswerArrays = [
        ["What special character should be placed at the end of every line of JavaScript code?", "$", ";", "&", "#", 2],
        ["Which of the following is NOT a JavaScript variable type?", "Script", "String", "Number", "Object", 1],
        ['Which of the following lines of code increases the value of "numberVariable" by 1?', "numberVariable = numberVariable + 1", "numberVariable += 1", "numberVariable++", "All of the above", 4],
        ["Which of these statements will retun 'false'?", "5 > 4", "10 <= 10", '3 === "3"', "0.00 == 0", 3],
        ["How would you give the function purchaseBurger() the parameter withCheese?", "function purchaseBurger(withCheese)", "$(purchaseBurger).function(withCheese)", 'function purchaseBurger("withCheese")', "function(purchaseBurger, withCheese)", 1],
        ["What keyword immediately ends a function AND causes it to return a value?", "break", "return", "value", "end", 2],
        ["Which of the following adds the function buttonFunction() to all button elements?", 'document.querySelectorAll("button").addEventListener("click", buttonFunction)', 'button.value = addOnClickEvent(buttonFunction)', '$("button").click(buttonFunction)', "The First and Third Answers", 4],
        ["Which function prints information in the console?", "document.write()", "window.alert()", "console.log()", "print()", 3],
        ['What value will be returned from the operation: 3 + "Bagel" + (2 + 5) * 7', "3Bagel257", "3Bagel235", "3Bagel49", "73Bagel7", 3],
        ["What aspect of JavaScript was jQuery designed to make more convenient?", "Fetching images from other websites", "Interacting with HTML Elements", "Sharing your code with other developers", "Creating password-protected applications", 2]
    ];
    var timeRemaining = 90;
    //called to reset timeRemaining if quiz is taken again
    var timeAtStart = timeRemaining;
    var answerHasBeenSubmitted = false;
    var currentQuestion = 0;
    var questionsAnsweredCorrectly = 0;
    const correctAnswersScoreMultiplier = 10;
    const correctAnswerTimeBonus = 5;
    const incorrectAnswerTimePenalty = 5;
    var finalScore = 0;

    //called from local storage
    var highScoreArray = [];
    //housing the string for localStorage in a variable to make it easier to keep track of
    const localStorageString = "highScoreArray";
    //names of the properties of the hi-score objects to populate highScoreArray
    const objectPlayerInitialsString = "playerInitials";
    const objectPlayerScoreString = "playerScore";

    //store the setInterval function globally
    var timerIntervalVariable;

    //run at start, and when returning to main menu 
    function loadSavedData(){
        $(highScoreList).empty();

        var accessedData = localStorage.getItem(localStorageString);
        if(accessedData){
            highScoreArray = JSON.parse(accessedData);
            $.each(highScoreArray, function(i, scoreObject){
                var scoreListItem = $("<li>");
                $(scoreListItem).text(scoreObject.playerInitials + " : " + scoreObject.playerScore);
                $(highScoreList).append(scoreListItem);
            })
        }
    }

    loadSavedData();

    //called from finishedInputingInitialsButton
    function saveNewHighScore(initials){
        var saveData = { playerInitials: initials, playerScore: finalScore.toString()};
        highScoreArray.push(saveData);
        highScoreArray.sort(function(a, b){ return (a.playerScore - b.playerScore) * -1});

        if(highScoreArray.length >  10){
            highScoreArray.pop();
        }

        var stringifiedData = JSON.stringify(highScoreArray);
        localStorage.setItem(localStorageString, stringifiedData);
    }
    
    function updateTimerDisplay(){
        $(timeRemainingDisplayElement).text(timeRemaining);
    }

    //turns timer on and off
    function timerIsRunning(_timerRunning){
        if(_timerRunning){
            timerIntervalVariable = setInterval(function() {
                timeRemaining--;
                updateTimerDisplay();
                if(timeRemaining <= 0){
                    endQuiz();
                }
            }, 1000);
        }
        else{
            clearInterval(timerIntervalVariable);
        }
    }

    //ends the quiz. Called for timerIsRunning and nextQuestionButton
    function endQuiz(){
        finalScore = (questionsAnsweredCorrectly * correctAnswersScoreMultiplier) + timeRemaining;
        $(quizSection).hide();
        $(resultsScreen).show();
        $(numberOfCorrectAnswersDisplay).text(questionsAnsweredCorrectly);
        $(finalTimeRemainingDisplay).text(timeRemaining + " seconds");
        $(finalScoreDisplay).text(finalScore);
        timerIsRunning(false);

        var checkIfNewHighScore = false;
        if(highScoreArray.length < 10){
            checkIfNewHighScore = true;
        }
        else
        {
            $.each(highScoreArray, function(i, scoreObject){
                if(finalScore > scoreObject.playerScore){
                    checkIfNewHighScore = true;
                }
            });
        }

        if(checkIfNewHighScore == true){
            $(initialsInputField).show();
            $(returnToMainMenuButton).hide();
        }
        else
        {
            $(initialsInputField).hide();
            $(returnToMainMenuButton).show();
        }
    }
    
    function setQuestionsAndAnswers(){
        questionDisplayElement.text("Question " + (currentQuestion + 1) + ": " + arrayOfQuestionAndAnswerArrays[currentQuestion][0]);
        $.each(buttonTextArray, function(i, value){
            value.text(arrayOfQuestionAndAnswerArrays[currentQuestion][i + 1]);
        });
    }

    //start button on main menu
    $(startButton).click(function(){
        mainMenu.hide();
        quizSection.show();
        timeRemaining = timeAtStart;
        questionsAnsweredCorrectly = 0;
        finalScore = 0;
        currentQuestion = 0;
        setQuestionsAndAnswers();
        $(madeTopScoreHolder).show();
        $(returnToMainMenuButton).show();
        timerIsRunning(true);
    });

    //assign fuctions to multiple choice buttons
    $.each(answerButtons, function(i, theButton){
        $(theButton).click(function() {
            if(!answerHasBeenSubmitted){
                answerHasBeenSubmitted = true;
            }
            //if question answered correctly
            if(theButton[0].value == arrayOfQuestionAndAnswerArrays[currentQuestion][5]){
                $(informPlayerOfAnswerAlertElement).addClass("alert-success").removeClass("alert-danger").text("Correct!").show();
                timerIsRunning(false);
                timeRemaining += correctAnswerTimeBonus;
                questionsAnsweredCorrectly++;
                $(nextQuestionButton).show();
            }
            //if answer was wrong
            else {
                $(informPlayerOfAnswerAlertElement).addClass("alert-danger").removeClass("alert-success").text("Incorrect! The answer was: " + 
                    arrayOfQuestionAndAnswerArrays[currentQuestion][arrayOfQuestionAndAnswerArrays[currentQuestion][5]]).show();
                timerIsRunning(false);
                timeRemaining -= incorrectAnswerTimePenalty;
                $(nextQuestionButton).show();
            }

            //update timer to show bonus/penalty time
            updateTimerDisplay()
        });
    });

    //the results screen button that returns to the main menu
    $(returnToMainMenuButton).click(function(){
        $(madeTopScoreHolder).hide();
        $(returnToMainMenuButton).hide();
        loadSavedData()
        $(resultsScreen).hide();
        $(mainMenu).show();
    });

    //button eccepts initial input in field
    $(finishedInputingInitialsButton).click(function(){
        if($(initialsInputField).val().length > 0){
            saveNewHighScore($(initialsInputField).val());
            $(madeTopScoreHolder).hide();
            $(returnToMainMenuButton).show();
            $(initialsInputField).val("");
        }
    });

    //adds function to the button that goes to the next question 
    $(nextQuestionButton).click(function(){
        $(informPlayerOfAnswerAlertElement).hide();
        $(nextQuestionButton).hide();

        answerHasBeenSubmitted = false;
        currentQuestion++;

        //reset radio buttons
        $.each(answerButtons, function(i, value){
            value.prop("checked", false);
        });

        if(currentQuestion < arrayOfQuestionAndAnswerArrays.length){
            setQuestionsAndAnswers();
            timerIsRunning(true);
        }
        else{
            endQuiz();
        }
    });
});