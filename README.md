baseball_challenge
==================

This is a group coding project for the Nashville Software School.  Our assignment is to create a one-page app that stores and displays information for a baseball league.

Our app can be viewed live at:<br />
https://baseballchallenge-e5qs2.backliftapp.com/

Our app has met the following project requirements:

Phase 1:<br />

<ul>
  <li>use the Bootstrap framework</li>
  <li>set a minimum of 4 teams</li>
  <li>set a maximum of 8 teams</li>
  <li>allow users to create teams</li>
  <li>collect the following team contact information:
    <ul>
      <li>team name</li>
      <li>manager's first name</li>
      <li>manager's last name</li>
      <li>phone number</li>
      <li>sponsor</li>
      <li>zip code</li>
    </ul>
  </li>
  <li>save team information to the server using Ajax and JSON</li>
  <li>display team details when users hover over team names in the standings table</li>
</ul>

Phase 2:<br />

<ul>
  <li>use pre-defined schedules for varying league sizes</li>
  <li>allow users to submit scores</li>
  <li>store scores on the server and display them in the schedule table</li>
  <li>update team wins and losses on the server and display them in the standings table</li>
  <li>sort the league standings by win percentage</li>
</ul>

Additional technical information:<br />

<ul>
  <li>the bulk of our HTML is a series of form modals that are not displayed on page load; the rest is made up of empty elements that are dynamically injected with content as users create teams</li>
  <li>our JavaScript is divided into two major sections:
    <ol>
      <li>the first half is script that runs on page load, affecting elements that already exist in the DOM; there are instances, though, where we use the jQuery .on() method to assign events to elements not yet present in the DOM</li>
      <li>the second half is comprised of functions, which are referenced in either the first half of the script or in other functions; these functions perform various actions, such as adding or removing objects from the server and updating page content</li>
    </ol>
  <li>we tried to maintain an intuitive naming convention where variables are nouns, functions contain verbs, etc.</li>
  <li>we have dedicated functions that refresh our standings and schedule tables, respectively</li>
  <li>we attempted to structure our script by the order in which elements are loaded into the DOM; when no logical ordering was apparent, we prioritized the sections by which elements users would interact with first</li>
</ul>
