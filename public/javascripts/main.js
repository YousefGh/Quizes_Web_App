period = 1 // question time period group number
questionIndex = 0; // question number

// JSON Reader
quizes = (function () {
     var json = null;
     $.ajax({
          'async': false, // asyc call false (blocking; sych)
          'global': false,
          'url': "/javascripts/quizes.json",
          'dataType': "json",
          'success': function (data) {
               json = data;
          }
     });
     return json;

})();

$(document).ready(function () {
     
     $('.user_form').hide() // hide at first
     $('.timer').hide() // hide at first
     $('.quiz').hide() // hide at first
     $('#scores').hide();

     $('#submit_quiz').click(function() {
          calculateScores();
     });

     $('.quiz_choice').click(function () { // toggler
          $('.quizes_container').hide()
          $('.user_form').fadeIn();
          localStorage.setItem("quiz_chosen", $(this).attr('id'));
     });

     $('#back').click(function () { // back to quizes
          $('.user_form').hide();
          $('.quizes_container').fadeIn()
     });

     $('#user_form').submit(function (e) {
          e.preventDefault(); //stop auto refresh
          var user_name = document
               .getElementById('user_name')
               .value
               .trim();
          var user_email = document
               .getElementById('user_email')
               .value
               .trim();

          // save to local browser's local storage
          localStorage.setItem("user_name", user_name);
          localStorage.setItem("user_email", user_email);

          $('header').hide();
          $('.quizes_container').hide();
          $('.user_form').hide();

          $('.timer').fadeIn()
          $('.quiz').fadeIn()

          startFirstQuiz();
     });
});

function startFirstQuiz() {
     startTimer(30) // 12 minutes

     // retreive Quiz
     var quizName = localStorage.getItem('quiz_chosen');
     quiz = quizes[quizName]; // Global
     nav_questions(0, quiz);

     userAnswers = [];

     // Not answered = null
     for (let i = 0; i < 10; i++) {
          if (i <= 5) {
               userAnswers.push(null);
          } else {
               userAnswers.push([]);
          }
     }

     // reset userAnswers
     localStorage.setItem("userAnswers", userAnswers);

     // disable back button before starting
     if (questionIndex <= 0) {
          $('#prev_q').attr("disabled", "disabled");
     }

     $('#prev_q')
          .click(function () {
               var minQuestion = 0
               if (period == 2) {
                    minQuestion = 6
                    multiAnswers = []
                    $("input[name='choices']:checked").each(function () {
                         multiAnswers.push($(this).val());
                    });
                    userAnswers[questionIndex] = multiAnswers;
               } else {
                    userAnswers[questionIndex] = $("input[name='choices']:checked").val();
               }

               localStorage.setItem("userAnswers", userAnswers);
               // console.log(userAnswers);
               questionIndex--;

               if (questionIndex <= minQuestion) { // disable prev and turn on next
                    $(this).attr("disabled", "disabled");
                    $('#next_q').removeAttr("disabled");
               } else {
                    $('#next_q').removeAttr("disabled");
               }

               nav_questions(questionIndex, quiz);
               qAnswer = userAnswers[questionIndex];
               trackChecked(qAnswer)
          });

     $('#next_q').click(function () {
          var maxQuestion = 5
          if (period == 2) {
               maxQuestion = 9
               multiAnswers = []
               $("input[name='choices']:checked").each(function () {
                    multiAnswers.push($(this).val());
               });
               userAnswers[questionIndex] = multiAnswers;
          } else {
               userAnswers[questionIndex] = $("input[name='choices']:checked").val();
          }

          localStorage.setItem("userAnswers", userAnswers);
          // console.log(userAnswers);

          questionIndex++;

          if (questionIndex >= maxQuestion) { // disable next and turn on prev
               $(this).attr("disabled", "disabled");
               $('#prev_q').removeAttr("disabled");
          } else {
               $('#prev_q').removeAttr("disabled");
          }

          nav_questions(questionIndex, quiz);
          qAnswer = userAnswers[questionIndex];
          trackChecked(qAnswer)
     });
}

// This function will track answers when the user is navigating the quiz
// it will make sure past user's answers are checked
function trackChecked(qAnswer) {
     if (period == 2) {
          // if the label of answer is in the array of user's answers
          // this is for checkboxes (array of answers)
          if ($.inArray($('#choice1_label').text(), qAnswer) != -1) {
               $('#choice1').prop('checked', true);
          } else {
               $('#choice1').prop('checked', false);
          }

          if ($.inArray($('#choice2_label').text(), qAnswer) != -1) {
               $('#choice2').prop('checked', true);
          } else {
               $('#choice2').prop('checked', false);
          }

          if ($.inArray($('#choice3_label').text(), qAnswer) != -1) {
               $('#choice3').prop('checked', true);
          } else {
               $('#choice3').prop('checked', false);
          }

          if ($.inArray($('#choice4_label').text(), qAnswer) != -1) {
               $('#choice4').prop('checked', true);
          } else {
               $('#choice4').prop('checked', false);
          }
     } else {
          
          if ($('#choice1_label').text() == qAnswer) {
               $('#choice1').prop('checked', true);
          } else {
               $('#choice1').prop('checked', false);
          }

          if ($('#choice2_label').text() == qAnswer) {
               $('#choice2').prop('checked', true);
          } else {
               $('#choice2').prop('checked', false);
          }

          if ($('#choice3_label').text() == qAnswer) {
               $('#choice3').prop('checked', true);
          } else {
               $('#choice3').prop('checked', false);
          }
          if ($('#choice4_label').text() == qAnswer) {
               $('#choice4').prop('checked', true);
          } else {
               $('#choice4').prop('checked', false);
          }
     }
}

// questions navaigator, adds questions and choices when the user
// is navigating to its slide
function nav_questions(questionIndex, quiz) {
     qObject = quiz[questionIndex]
     question = qObject.question;
     choices = qObject.choices;

     // This is just a trick to add an animation
     $('#question')
          .hide()
          .text(question)
          .fadeIn();
     // add the text for display only on the label
     // and add it to the input for functionality
     // this is a way I chose so that the format and styling of the question is beautiful
     $('#choice1_label').text(choices[0]);
     $('#choice1').val(choices[0]);

     $('#choice2_label').text(choices[1]);
     $('#choice2').val(choices[1]);

     $('#choice3_label').text(choices[2]);
     $('#choice3').val(choices[2]);

     $('#choice4_label').text(choices[3]);
     $('#choice4').val(choices[3]);
}

/*
pad function gets the remainder of seconds to show minutes which is the division
and the seconds which are the remainder of the division
then repeat every seconds, it is a good practice to use the system time to exclude system
delays but I did not use it for simplicity purposes and how not critical the system is
*/
function pad(val) {
     var valString = val + ""; // number to string
     if (valString.length < 2) {
          return "0" + valString; // format for < 10 seconds
     } else {
          return valString;
     }
}

function startTimer(totalSeconds) {
     var minutes = document.getElementById("minutes");
     var sec = document.getElementById("seconds");

     var intervalTimerId = setInterval(function () { // set Interval is like repeating the setTimeOut function
          --totalSeconds;
          if (totalSeconds <= 0) { // First period ended
               period++; // move to nextt period
               if (period == 2) {
                    // this snippet is for adding the last question if the time
                    // ended before the user hits back button;
                    // I use back and next for saving answers
                    userAnswers[questionIndex] = $("input[name='choices']:checked").val();
                    localStorage.setItem("userAnswers", userAnswers);

                    alert('Time ended. Moving on to the next group...'); //TODO
                    questionIndex = 6
                    nav_questions(questionIndex, quiz);
                    qAnswer = userAnswers[questionIndex];
                    trackChecked(qAnswer)
                    $('#next_q').removeAttr("disabled");
                    $('#prev_q').attr("disabled", "disabled");

                    $('#choice1').attr('type', 'checkbox');
                    $('#choice2').attr('type', 'checkbox');
                    $('#choice3').attr('type', 'checkbox');
                    $('#choice4').attr('type', 'checkbox');

                    totalSeconds = 60;
               }
               // This timer interval stopper was taken from
               // https://stackoverflow.com/questions/109086/stop-setinterval-call-in-javascrip
               // t ?answertab=active#tab-top
               if (period > 2) {
                    multiAnswers = []
                    $("input[name='choices']:checked").each(function () {
                         multiAnswers.push($(this).val());
                    });
                    userAnswers[questionIndex] = multiAnswers;
                    localStorage.setItem("userAnswers", userAnswers);
                    calculateScores();

                    clearInterval(intervalTimerId);
                    // alert('move to another page');
               }
          }

          minutes.innerHTML = pad(parseInt(totalSeconds / 60));
          sec.innerHTML = pad(totalSeconds % 60);
     }, 1000);
}

function validate() {
     var user_name = document
          .getElementById('user_name')
          .value
          .trim();
     var user_email = document
          .getElementById('user_email')
          .value
          .trim();

     // username shouldn't be less than 3 letters or more than 15
     var correct_user = /^([a-zA-Z0-9]){3,15}$/;

     // email can have upper/lower case letters, numbers, and underscores domain can
     // only have upper/lower case letters, numbers, and underscores extension can
     // only have 2 or 3 letters
     var correct_email = /^\w+@\w+\.[\w+]{2,3}$/;

     if (!correct_user.test(user_name)) {
          alert('Username should be between 3 and 15 letters/numbers/underscores');
          return false;
     } else if (!correct_email.test(user_email)) {
          alert('Please enter a valid email');
          return false;
     }
     return true;
}

function calculateScores() {
     console.log('entered STAT');
     var quizChosen = localStorage.getItem('quiz_chosen');

     var maxGrade = 0; // maximum possible grade
     var totalGrade = 0; // user's grade

     var maxOnlyCorrectScore = 0; // maximum possible total corrects == 10
     var onlyCorrectScore = 0; // fully correct question answers

     var maxPartialScore_group2 = 0; // maximum possible partials == 4
     var partialScore_group2 = 0; // partially correct questoin answers

     // calculate maximum possible grade
     for (var i = 0; i < 10; i++) {
          correctAnswer = quizes[quizChosen][i].answer; // get the rubric
          maxOnlyCorrectScore++;
          if (i < 6) {
               maxGrade++;
          } else {
               for (var j = 0; j < correctAnswer.length; j++) {
                    maxGrade++;
               }
          }
     }

     // calculate user's grade
     for (var i = 0; i < 10; i++) {
          userAnswer = userAnswers[i];
          correctAnswer = quizes[quizChosen][i].answer; // get the rubric
          console.log(userAnswer);
          console.log(correctAnswer + '\n');
          if (i < 6) { // group one
               if (userAnswer == correctAnswer) {
                    totalGrade++;
                    onlyCorrectScore++;
               }
          } else { // group two
               // if all the correct answers are chosen comparison idea is taken from
               // https://stackoverflow.com/a/15472040/7409519
               userAnswer_string = userAnswer;
               correctAnswer_string = correctAnswer;
               maxPartialScore_group2++;
               if (userAnswer_string.sort().toString() === correctAnswer_string.sort().toString()) {
                    onlyCorrectScore++;
               }
               var once = 0; // if condition is entered only once
               for (var j = 0; j < userAnswer.length; j++) {

                    if ($.inArray(userAnswer[j], correctAnswer) != -1) {
                         if (once == 0) {
                              partialScore_group2++;
                              once++;
                         }
                         totalGrade++;
                    } else {
                         totalGrade--;
                    }
               }
          }
     }

     // console.log('totalGrade: ' + totalGrade);
     // console.log('maxGrade: ' + maxGrade);

     // console.log('maxOnlyCorrectScore: ' + maxOnlyCorrectScore);
     // console.log('onlyCorrectScore: ' + onlyCorrectScore)

     // console.log('maxPartialScore_group2: ' + maxPartialScore_group2);
     // console.log('partialScore_group2: ' + partialScore_group2);

     showStats(maxGrade, totalGrade, maxOnlyCorrectScore,
          onlyCorrectScore, maxPartialScore_group2, partialScore_group2);
}

function showStats(maxGrade, totalGrade, maxOnlyCorrectScore, 
     onlyCorrectScore, maxPartialScore_group2, partialScore_group2) {
     
     $('.timer').hide();
     $('.quiz').hide();

     // This code was built using google chart  API
     // https://developers.google.com/chart/interactive/docs/gallery/piechart#Configuration_Options
     // Load google charts

     google.charts.load('current', {'packages':['corechart']});
     google.charts.setOnLoadCallback(drawChart);
 
      // Draw the chart and set the chart values
     function drawChart() {
          var data_correct = google.visualization.arrayToDataTable([
               ['Answers', 'Score'],
               ['Correct', onlyCorrectScore],
               ['Incorrect', maxOnlyCorrectScore - onlyCorrectScore]
          ]);

          var data_partial = google.visualization.arrayToDataTable([
               ['Task', 'Hours per Day'],
               ['Correct', partialScore_group2],
               ['Incorrect', maxPartialScore_group2 - partialScore_group2]
          ]);
 
          // Optional; add a title and set the width and height of the chart
          
          var options1 = {titleTextStyle: {color: 'white', fontSize: 18}, 'title':'Fully Correct Answers', width: 550, height: 450
      , backgroundColor: 'transparent', legend : { position : 'bottom', textStyle: {color: 'white', fontSize: 12} }};
 
          var options2 = {titleTextStyle: {color: 'white', fontSize: 18}, 'title':'Partially Correct Answers in Group 2', width: 550, height: 450
      , backgroundColor: 'transparent', legend : { position : 'bottom', textStyle: {color: 'white', fontSize: 12} }};
 
          // Display the chart inside the <div> element with id="piechart"
          var chart = new google.visualization.PieChart(document.getElementById('piechart_correct'));
          chart.draw(data_correct, options1);

          var chart = new google.visualization.PieChart(document.getElementById('piechart_partial'));
          chart.draw(data_partial, options2);
     }

     var percentage_grade = parseFloat((totalGrade / maxGrade) * 100).toFixed(2) + '%';
     $('#scores').fadeIn();
     $('#grade').text(percentage_grade)
     $('#name').text(localStorage.getItem('user_name'));
}