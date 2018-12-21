//Current Train Schedules Data Using Firebase

//Copied Firebase Config Inforation
var config = {
    apiKey: "AIzaSyA_NOWIar1aUvw56h6pT6cBlrcaZjldG04",
    authDomain: "aslhwassign7-trains.firebaseapp.com",
    databaseURL: "https://aslhwassign7-trains.firebaseio.com",
    projectId: "aslhwassign7-trains",
    storageBucket: "aslhwassign7-trains.appspot.com",
    messagingSenderId: "979550240106"
};

//Initialize Firebase Appliction
firebase.initializeApp(config);

//Create database reference variable
var db = firebase.database();


//Shows timer in main header that updates every second
function getTime() {
    var curTime = moment().format('MMMM Do YYYY, h:mm:ss a');
    $(".timeDisplay").text(curTime);
}


//Function that refreshes current train data every minute
function refreshData() {
    //Clear current details
    $("#train-details").empty();

    //Create query to read the database data
    var query = db.ref();
    query.once("value")
      .then(function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
          var childData = childSnapshot.val();

          //Use childData to assign values for each record
          var trainName = childData.trainName;
          var trainDestination = childData.trainDestination;
          var trainFrequency = childData.trainFrequency;
          var trainFirstTime = childData.trainFirstTime;

          //Call function to determine train arrival time and minutes away
          var times = calcTrainTime(trainFirstTime,trainFrequency);

          var trainNextArrival = times[0];
          var trainMinutesAway = times[1];

          //Create a new TR element for table row then add data to new row
          var row = $("<tr>").append(
              $("<td>").text(trainName),
              $("<td>").text(trainDestination),
              $("<td>").text(trainFrequency),
              $("<td>").text(trainNextArrival),
              $("<td>").text(trainMinutesAway)
          )

          //Append row record to current trains table
          $("#train-details").append(row);

      });
    });
}


//Calculates train's next arrival time and minutes away from train
//first time and train frequency information
 function calcTrainTime(ftime,freq) {

     // First Time (pushed back 1 year to make sure it comes before current time)
     var ftimeConverted = moment(ftime, "HH:mm").subtract(1, "years");

     // Difference between the times
     var diffTime = moment().diff(moment(ftimeConverted), "minutes");

     // Time apart (remainder)
     var remainder = diffTime % freq;

     // Minutes Until Train Arrives
     var minToTrain = freq - remainder;

     // Next Train Arrival Time
     var nextTrain = moment().add(minToTrain, "minutes");
     nextTrain = moment(nextTrain).format("LT");

     return [nextTrain,minToTrain];

 } //End Calc Train Time


//Main Function
 function main() {

     //When Add Train Button Clicked
     $("#btnAddTrain").click(function (event) {
         event.preventDefault();

         //Flag to track user input as good or bad data
         var goodData = 'Y';

         //Get values from input form

         var trainName = $("#inputTrainName").val().trim();
         if (trainName === '') {
             alert('Please enter a name for the train!');
             goodData = 'N';
         }

         var trainDestination = $("#inputDestination").val().trim();
         if (trainDestination === '') {
             alert('Please enter a destination for the train!');
             goodData = 'N';
         }

         var trainFirstTime = $("#inputTrainFirstTime").val().trim();
         if (trainFirstTime === '') {
             alert('Please enter a first train time for the train!');
             goodData = 'N';
         }

         var trainFrequency = parseInt($("#inputFrequency").val().trim());
         var trainFrequency1 = $("#inputFrequency").val().trim()
         if (trainFrequency1 === '' ) {
             alert('Please enter a frequency for the train!');
             goodData = 'N';
         }

         //Update database with train added information
         if (goodData === 'Y') {
            db.ref().push({
                 trainName: trainName,
                 trainDestination: trainDestination,
                 trainFirstTime: trainFirstTime,
                 trainFrequency: trainFrequency
            })
        }

         //Clear Input Form Values
         $("#inputTrainName").val('');
         $("#inputDestination").val('');
         $("#inputTrainFirstTime").val('');
         $("#inputFrequency").val('');

    })  //End of Add Train Button Click


    //Get refreshed data back from database and update current trains table
    db.ref().on("child_added", function(snapshot) {

        var trainName = snapshot.val().trainName;
        var trainDestination = snapshot.val().trainDestination;
        var trainFrequency = snapshot.val().trainFrequency;
        var trainFirstTime = snapshot.val().trainFirstTime;

        //Call function to determine train arrival time and minutes away
        var times = calcTrainTime(trainFirstTime,trainFrequency);

        var trainNextArrival = times[0];
        var trainMinutesAway = times[1];

        //Create a new TR element for table row then add data to new row
        var row = $("<tr>").append(
            $("<td>").text(trainName),
            $("<td>").text(trainDestination),
            $("<td>").text(trainFrequency),
            $("<td>").text(trainNextArrival),
            $("<td>").text(trainMinutesAway)
        )

        //Append row record to current trains table
        $("#train-table").append(row);

    })

    //Timer to show time in header section
    var timer = setInterval(getTime, 1000);

    //Timer to refresh train details every minute
    var refresh = setInterval(refreshData, 1000 * 60);

}  // End Main Function


//Document Ready Function
$(document).ready(function() {
    main();
})
