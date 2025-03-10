//server.js

const express = require("express");
const cors = require("cors");
const fs = require("fs");

const colleagueIDs = []; 
const passwords = [];
const dayDates = [];
const times = [];
const types = [];
const mappedDetails = new Map;

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const rawData = fs.readFileSync("schedule.json");
const schedules = JSON.parse(rawData);

function getUserSchedule(colleagueID, month){
  const user = schedules.find(user => user.colleagueID === colleagueID);
  
  if(!user){
    console.log(`couldn't find user ID`);
    return null;
  }

  if(!user[month]){
    console.log(`Couldn't find month specified`);
    return null;
  }

  return user[month];
}

function getScheduleDetails(userSchedule) {
  userSchedule.forEach((entry) => {  

    if (entry.date) { 
      dayDates.push(entry.date);
    }

    if (entry.time) { 
      times.push(entry.time);
    }

    if (entry.type) { 
      types.push(entry.type);
    }
  });
}

const userSchedule = getUserSchedule("#123456", "February");

getScheduleDetails(userSchedule);

function readDatabase(){
  try {
    const data = fs.readFileSync("dataBase.txt", "utf8"); 
    const lines = data.split("\n"); 

    lines.forEach((line) => {
      if (line.includes("colleagueID")) { 
        const colleagueID = line.split(":")[1]?.trim(); 
        if (colleagueID) {
          colleagueIDs.push(colleagueID);
        }
      }

      if (line.includes("password:")){
        const password = line.split(":")[1]?.trim();
        if (password){
          passwords.push(password);
        }
      }
    });

  } catch (err) {
    console.error("Error reading file:", err);
  }
}

function setMap(){
  for(i = 0; i < colleagueIDs.length; i++){
    mappedDetails.set(colleagueIDs[i], passwords[i])
  }
}

readDatabase();
setMap();

//allows a user to log in
app.post("/api/receive", (req, res) => {
  const { text1, text2 } = req.body; 

   if (mappedDetails.has(text1) && mappedDetails.get(text1) === text2) {
    console.log("User ID and password match");
    res.json({ success: true }); 
  } else {
    console.log("Incorrect user ID or password");
    res.json({ success: false, message: "Incorrect username or password" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});