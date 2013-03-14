$(document).ready(function() {

// ******************** declare variables ***********************

  // define min and max number of teams
  var minTeams = 4;
  var maxTeams = 8;

  // create empty arrays
  var league, schedule, scores = new Array();

// *************** restore game and league data *****************

  loadPage();

// ****************** max teams alert message *******************

  // insert maximum teams into alert
  $("#maxTeams").text(maxTeams);

  // click event on create team link
  $("a[href='#teamModal']").on("click", function() {

    // show alert message if too many teams
    if (league.length == maxTeams) {
      $("#maxTeamsAlert").show();
    } else {
      $("#teamModal").modal("show");        
    };

  }); // end click

  // hide alert when dismissed
  $("#alertClose").click(function() {
    $("#maxTeamsAlert").hide();
  });

// **************** create teams alert message *****************

  // insert minimum teams into alert
  $("#minTeams").text(minTeams);

// ******************** initialize popovers ********************

  // standings table team information
  $("#standings").popover({
    selector: ".teamInfo",
    html: true,
    placement: "right",
    trigger: "hover"
  });

  // create team form instructions
  $("#teamForm input").popover({
    placement: "bottom",
    trigger: "hover"
  });

// **************** initialize form validation ****************

  // create team form validation
  $("#teamForm").validatr({
    showall: true,
    template: "<div>Please try again.</div>"
  });

  // report score form validation
  $("#scoreForm").validatr({
    showall: true,
    template: "<div>&times;</div>"
  });

// ********************* create new team ***********************

  // click event on team form submit button
  $("#createTeam").click(function() {

    // exit function if form is invalid
    if ($.validatr.validateForm(teamForm) == false) {
      return;
    } else {
      $("#teamModal").modal("hide");
    };

    // send team data to server
    $.ajax({
      url: "/backliftapp/team",
      type: "POST",
      dataType: "JSON",
      data: {
      teamName: $("#teamName").val(),
      firstName: $("#firstName").val(),
      lastName: $("#lastName").val(),
      phone: $("#phone").val(),
      sponsor: $("#sponsor").val(),
      zip: $("#zip").val(),
      wins: 0,
      losses: 0,
      percentage: 0
      },
      success: function (data) {

        // update league array
        league.push(data);

        // update standings table
        updateStandings();

        // click event on delete buttons
        $("#standings").on("click", ".delete", function() {
          var teamID = $(this).attr("id");
          deleteTeam(teamID);
        });

        // update schedule table
        updateSchedule();

        // hide create team alert
        $("#createTeamAlert").hide();

        // check if season can start
        startSeason();

      }
    }); // end POST

    // clear team form inputs
    $("#teamForm input").val("");

    // clear form validation errors
    return false;

  }); // end click

// *********************** reset season ************************

  // click event on reset season link
  $("#resetSeason").click(function() {

    // delete all game data from server
    for (var i = 0; i < scores.length; i ++) {
      $.ajax({
        url: "/backliftapp/game/" + scores[i].id,
        type: "DELETE",
        dataType: "JSON"
      });
    };

    // delete all league data from server
    for (var i = 0; i < league.length; i ++) {
      $.ajax({
        url: "/backliftapp/team/" + league[i].id,
        type: "DELETE",
        dataType: "JSON"
      });
    };

    // update lock status on server
    $.ajax({
      url: "/backliftapp/season/cc55261d-117a-4efc-99ff-bb81e80bab43",
      type: "PUT",
      dataType: "JSON",
      data: {
        lock: "N"
      },
      success: function (data) {

        // restore game and league data
        loadPage();

      }
    }); // end PUT

  }); // end click

// ************ make report score links functional *************

  // create empty variables
  var homeTeam, awayTeam, week, game;

  // click event on report score links
  $(".tab-content").on("click", ".score", function() {

    // fill variables with schedule index values
    week = $(this).attr("data-week");
    game = $(this).attr("data-game");

    // fill variables with team objects
    if (league.length % 2 == 0) { // even number of teams
      homeTeam = league[schedule[week][game][0] - 1];
      awayTeam = league[schedule[week][game][1] - 1];
    } else { // odd number of teams
      homeTeam = league[schedule[week][game][0] - 2];
      awayTeam = league[schedule[week][game][1] - 2];
    };

    // write team names to score form
    $("#marquee").html("<span id='homeTeam'>" + homeTeam.teamName + "</span>vs.<span id='awayTeam'>" + awayTeam.teamName + "</span>");

  }); // end click

// ********** make score form submit button functional **********

  // click event on score form submit button
  $("#reportScore").click(function() {

    // exit function if form is invalid
    if ($.validatr.validateForm(scoreForm) == false) {
      return;
    };

    // fill variables with scores
    var homeScore = $("#homeScore").val();
    var awayScore = $("#awayScore").val();

    // show alert message if scores are equal
    if (homeScore == awayScore) {
      $("#tieErrorAlert").show();
      return false;
    } else {
      $("#tieErrorAlert").hide();
      $("#scoreModal").modal("hide");
    };

    // send game data to server
    reportScore(homeTeam, awayTeam, homeScore, awayScore, week);

    // clear form validation errors
    return false;

  }); // end click

// *********************** start season ************************

  // click event on start season button
  $("#seasonSubmit").click(function() {

    // hide start season button
    $("#startSeason").hide();

    // hide create team link
    $("#launchTeamModal").hide();

    // hide delete buttons
    $(".delete").hide();

    // show report score links
    $(".score").show();

    // update lock status on server
    $.ajax({
      url: "/backliftapp/season/cc55261d-117a-4efc-99ff-bb81e80bab43",
      type: "PUT",
      dataType: "JSON",
      data: {
        lock: "Y"
      }
    }); // end PUT

  }); // end click

// ********************* animate baseball *********************

  $("#logo").hover(function() {
      $(this).stop().animate({top: 8}, 100);
    },function() {
      $(this).stop().animate({top: 3}, 75);
    }
  );

// *********** load page with game and league data *************
// Game data is retrieved before league data so that scores will
// be available to the updateSchedule function.

  function loadPage() {

    // retrieve game data from server
    $.ajax({
      url: "/backliftapp/game",
      type: "GET",
      dataType: "JSON",
      success: function (data) {

        // fill scores array with data
        scores = data;

        // retrieve league data from server
        $.ajax({
          url: "/backliftapp/team",
          type: "GET",
          dataType: "JSON",
          success: function (data) {

            // fill league array with data
            league = data;

            // populate standings table
            updateStandings();

            // click event on delete buttons
            $("#standings").on("click", ".delete", function() {
              var teamID = $(this).attr("id");
              deleteTeam(teamID);
            });

            // populate schedule table
            updateSchedule();

            // show create team alert if league is empty
            if (league.length == 0) {
              $("#createTeamAlert").show();
            };

            // check if season can start
            startSeason();

          }
        }); // end GET

      }
    }); // end GET

  }; // end loadPage

// ******************** update standings ************************

  function updateStandings() {

    // create empty array
    var sort = new Array();

    // fill array with league data
    for (var i = 0; i < league.length; i++) {
      sort.push(league[i]);
    };

    // sort array by win percentage using bubble sort
    for (var j = 0; j < (sort.length - 1); j++) {
      var swapping = false;
      for (var k = 0; k < ((sort.length - 1) - j); k++) {
        if (sort[k].percentage < sort[k + 1].percentage) {
          var temp = sort[k];
          sort[k] = sort[k + 1];
          sort[k + 1] = temp;
          swapping = true;
        };
      };
      if (!swapping) {
      break;
      };
    };

    // clear standings table
    $("#standings tbody").html("");

    // populate standings table
    for (var l = 0; l < sort.length; l++) {

      // fill variables with popover content
      var popoverTitle = "<h4 class=\"infoTitle\">" + sort[l].teamName + "</h4>";
      var popoverContent = "<b>Manager:</b> " + sort[l].firstName + " " + sort[l].lastName + "<br /><b>Phone Number:</b> " + sort[l].phone + "<br /><b>Team Sponsor:</b> " + sort[l].sponsor + "<br /><b>Zip Code:</b> " + sort[l].zip;

      // format win percentage
      var winPercentage = Number(sort[l].percentage).toFixed(3);

      // write data to standings table
      $("#standings tbody").append("<tr><th class='rank'>" + (l + 1) + ".</th><td class='name'><a class='teamInfo' href='#' title='" + popoverTitle + "' data-content='" + popoverContent + "'>" + sort[l].teamName + "</a></td><td class='record'>" + sort[l].wins + "</td><td class='record'>" + sort[l].losses + "</td><td class='record'>" + winPercentage + "</td><td class='deleteColumn'><button id='" + sort[l].id + "' class='btn btn-danger btn-mini delete' type='button'>Delete</button></td></tr>");

    }; // end for loop

  }; // end updateStandings

// ************************ delete team **************************

  function deleteTeam(teamID) {

    // delete team data from server
    $.ajax({
      url: "/backliftapp/team/" + teamID,
      type: "DELETE",
      dataType: "JSON",
      success: function () {

        // retrieve league data from server
        $.ajax({
          url: '/backliftapp/team',
          type: "GET",
          dataType: "JSON",
          success: function (data) {

            // update league array
            league = data;

            // update standings table
            updateStandings();

            // click event on delete buttons
            $("#standings").on("click", ".delete", function() {
              var teamID = $(this).attr("id");
              deleteTeam(teamID);
            });

            // update schedule table
            updateSchedule();

            // show create team alert if league is empty
            if (league.length == 0) {
              $("#createTeamAlert").show();
            };

            // check if season can start
            startSeason();

          }
        }); // end GET

      }
    }); // end DELETE

  }; // end deleteTeam

// ******************** update schedule *************************

  function updateSchedule(activePane) {

    // determine schedule length
    if (league.length < minTeams) {
        $("#schedule ul").html("<li class='active'><a href='#pane0' data-toggle='tab'>Week 1</a></li>");
        $("#schedule .tab-content").html("<div id='pane0' class='tab-pane active'><table class='table table-striped'><thead><tr><th class='teams'>Teams</th><th class='final'>Final Score</th><th class='report'></th></tr></thead><tbody></tbody></table></div>");
    } else if (league.length == 4) {
      schedule = sched4;
    } else if (league.length == 5 || league.length == 6) {
      schedule = sched6;
    } else if (league.length == 7 || league.length == 8) {
      schedule = sched8;
    };

    // verify league has enough teams
    if (league.length >= minTeams) {

      // clear schedule table
      $("#schedule ul").html("");
      $("#schedule .tab-content").html("");

      // create tabs and panes
      for (var i = 0; i < schedule.length; i++) {
        $("#schedule ul").append("<li id='tab" + i + "'><a href='#pane" + i + "' " + "data-toggle='tab'>Week " + (i + 1) + "</a></li>");
        $("#schedule .tab-content").append("<div id='pane" + i + "' " + "class='tab-pane'><table class='table table-striped'><thead><tr><th class='teams'>Teams</th><th class='final'>Final Score</th><th class='report'></th></tr></thead><tbody></tbody></table></div>");

        // initialize counter and write bye weeks
        if (league.length % 2 == 0) { // even number of teams
          var j = 0;
        } else { // odd number of teams
          // Team 1 on the schedule becomes a ghost team,
          // and whichever team plays them has a bye week.
          var j = 1;
          $("#pane" + i + " tbody").append("<tr><td class='teams'>" + league[schedule[i][0][1] - 2].teamName + "</td><td class='final'>Bye</td><td class='report'></td></tr>");
        }; // end if statement

        // populate schedule with game data
        while (j < schedule[i].length) {
          
          // fill variables with initial values
          if (league.length % 2 == 0) { // even number of teams
            var home = league[schedule[i][j][0] - 1].teamName;
            var away = league[schedule[i][j][1] - 1].teamName;                
          } else { // odd number of teams
            var home = league[schedule[i][j][0] - 2].teamName;
            var away = league[schedule[i][j][1] - 2].teamName;
          };
          var homeFinal = 0;
          var awayFinal = 0;

          // find correct scores in scores array
          for (var k = 0; k < scores.length; k++) {
            if (scores[k].homeName == home && scores[k].awayName == away) {
              homeFinal = scores[k].homeScore;
              awayFinal = scores[k].awayScore;
            };
          };

          // write game data to panes
          $("#pane" + i + " tbody").append("<tr><td class='teams'>" + home + " vs. " + away + "</td><td class='final'>" + homeFinal + " - " + awayFinal + "</td><td class='report'><a class='score' data-week='" + i + "' data-game='" + j + "' href='#scoreModal' data-toggle='modal'>Report Score</a></td></tr>");

          // increment counter
          j++;

        }; // end while loop

      }; // end for loop

      // set active pane
      if (activePane) { // maintain active pane
        $("#tab" + activePane).addClass("active");
        $("#pane" + activePane).addClass("active");
      } else { // make week 1 pane active
        $("#tab0").addClass("active");
        $("#pane0").addClass("active");
      };

    }; // end if statment

  }; // end updateSchedule

// ********************** report score ************************

  function reportScore(homeTeam, awayTeam, homeScore, awayScore, activePane) {

    // send game data to server
    $.ajax({
      url: "/backliftapp/game",
      type: "POST",
      dataType: "JSON",
      data: {
      homeName: homeTeam.teamName,
      awayName: awayTeam.teamName,
      homeScore: homeScore,
      awayScore: awayScore
      },
      success: function (data) {

        // update scores array
        scores.push(data);

        // update schedule table
        updateSchedule(activePane);

        // show report score links
        $("td.final").each(function() {
          var contents = $(this).text();
          if (contents == "0 - 0") {
            $(this).next(".report").children(".score").show();
          };
        });

      }
    }); // end POST

    // update wins and losses
    updateRecord(homeTeam, awayTeam, homeScore, awayScore);

  }; // end reportScore

// ****************** update wins and losses ******************

  function updateRecord(homeTeam, awayTeam, homeScore, awayScore) {

    // determine winner and loser
    if (+homeScore > +awayScore) {

      // increment home team wins
      $.ajax({
        url: "/backliftapp/team/" + homeTeam.id,
        type: "PUT",
        dataType: "JSON",
        data: {
          wins: +homeTeam.wins + 1,
          percentage: (+homeTeam.wins + 1) / (+homeTeam.wins + 1 + +homeTeam.losses)
        },
        success: function (data) {

        // increment away team losses
        $.ajax({
          url: "/backliftapp/team/" + awayTeam.id,
          type: "PUT",
          dataType: "JSON",
          data: {
            losses: +awayTeam.losses + 1,
            percentage: (+awayTeam.wins) / (+awayTeam.wins + +awayTeam.losses + 1)
          },
          success: function (data) {

          // retrieve league data from server
          $.ajax({
            url: "/backliftapp/team",
            type: "GET",
            dataType: "JSON",
            success: function (data) {

              // fill league array with data
              league = data;

              // populate standings table
              updateStandings();

            }
          }); // end GET

          }
        }); // end PUT

        }
      }); // end PUT

    } else {

      // increment home team losses
      $.ajax({
        url: "/backliftapp/team/" + homeTeam.id,
        type: "PUT",
        dataType: "JSON",
        data: {
          losses: +homeTeam.losses + 1,
          percentage: (+homeTeam.wins) / (+homeTeam.wins + +homeTeam.losses + 1)
        },
        success: function (data) {

        // increment away team wins
        $.ajax({
          url: "/backliftapp/team/" + awayTeam.id,
          type: "PUT",
          dataType: "JSON",
          data: {
            wins: +awayTeam.wins + 1,
            percentage: (+awayTeam.wins + 1) / (+awayTeam.wins + 1 + +awayTeam.losses)
          },
          success: function (data) {

          // retrieve league data from server
          $.ajax({
            url: "/backliftapp/team",
            type: "GET",
            dataType: "JSON",
            success: function (data) {

              // fill league array with data
              league = data;

              // populate standings table
              updateStandings();

            }
          }); // end GET

          }
        }); // end PUT

        }
      }); // end PUT

    }; // end if statement

    // clear score form inputs
    $("#scoreForm input").val("");

  }; // end updateRecord

// **************** check if season can start *****************

  function startSeason() {

    // retrieve season data from server
    $.ajax({
      url: "/backliftapp/season/cc55261d-117a-4efc-99ff-bb81e80bab43",
      type: "GET",
      dataType: "JSON",
      success: function (data) {

        // determine if season is in progress
        if (data.lock == "N") {

          // show create team link
          $("#launchTeamModal").css("display", "block");

          // show delete buttons
          $(".delete").show();

          // show start season button if enough teams
          if (league.length >= minTeams) {
            $("#startSeason").show();
          } else {
            $("#startSeason").hide();
          };

        } else {

          // show report score links
          $("td.final").each(function() {
            var contents = $(this).text();
            if (contents == "0 - 0") {
              $(this).next(".report").children(".score").show();
            };
          });

        }; // end if statement

      }
    }); // end POST

  }; // end startSeason

// ************************ end script ************************

}); // end ready