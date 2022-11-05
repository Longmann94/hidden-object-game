import React, { useState, useEffect, useRef } from 'react';
import './style.css';
import { db, storage } from './firebase';
import { collection, addDoc, doc, query, where, getDoc, getDocs, Timestamp } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import uniqid from 'uniqid';

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const App = () => {

  const isMounted = useRef(false);
  const year = new Date().getFullYear();

  const [ coords, setCoords ] = useState({x: 0, y: 0});
  const [ hiddenObjectArr, setHiddenObjectArr ] = useState([]);
  const [ scoreboardArr, setScoreboardArr ] = useState([]);
  const [ imgUrl, setImgUrl ] = useState('https://firebasestorage.googleapis.com/v0/b/hidden-object-game-4771e.appspot.com/o/image.webp?alt=media&token=f94ce310-f78c-42b7-9b80-0973d5fd3044');
  const [ playerName, setPlayerName ] = useState('');

  //timer state and useeffet
  const [second, setSecond] = useState("00");
  const [minute, setMinute] = useState("00");
  const [isActive, setIsActive] = useState(true);
  const [counter, setCounter] = useState(0);

//function to use for state that requires an initial render


useEffect(() => {
  let intervalId;

  if (isActive) {
    intervalId = setInterval(() => {
      const secondCounter = counter % 60;
      const minuteCounter = Math.floor(counter / 60);

      let computedSecond =
        String(secondCounter).length === 1
          ? `0${secondCounter}`
          : secondCounter;
      let computedMinute =
        String(minuteCounter).length === 1
          ? `0${minuteCounter}`
          : minuteCounter;

      setSecond(computedSecond);
      setMinute(computedMinute);

      setCounter((counter) => counter + 1);
    }, 1000);
  }

  return () => clearInterval(intervalId);
}, [isActive, counter]);

function stopTimer() {
  console.log(minute, second);
  setIsActive(false);
  setCounter(0);
}

//access storage for img (using links from storage instead)
// useEffect(() =>{
//
//   const storage = getStorage();
//   getDownloadURL(ref(storage, 'image.webp'))
//   .then((url) => {
//     setImgUrl(url);
//   })
//   .catch((error) => {
//     console.log(error);
//   });
//
// }, []);

// read from DB for hidden objects coords
async function readDb() {

  try{
  const q = query(collection(db, "hidden-object"), where('found', '==', false));
  const qSnap = await getDocs(q);
  const tempArr = [];
  qSnap.forEach((doc) => {
    tempArr.push(doc.data());
    setHiddenObjectArr([...tempArr]);
  });
}catch(e) {
  console.error(e);
}
}

// read from players db for player score
async function readPlayerDb() {

  try{
  const q = query(collection(db, "players"));
  const qSnap = await getDocs(q);
  const tempArr = [];
  qSnap.forEach((doc) => {
    tempArr.push(doc.data());
    setScoreboardArr([...tempArr]);
  });
}catch(e) {
  console.error(e);
}
}

//Write to db use for recording winner and time
async function writePlayerDb() {
  try {
    const docRef = await addDoc(collection(db, 'players'), {
      key: uniqid(),
      name: playerName,
      time: `${minute}: `+`${second}`,
    });
    console.log('document written with ID: ', docRef.id);
  }catch (e) {
    console.error('errpr adding document: ', e);
  }
}


// // initial loading hidden objects coords
useEffect(() => {

readDb();
readPlayerDb();

}, []);

//use to check if x/y coords is within range...if user clicked at the right spot.
const between = (x, min, max) => {
  return x >= min && x <= max;
}

//handle when user click on image to find object
const handleClick = (e) => {
  //do nothing if all items has been found
  if(hiddenObjectArr.length === 0) return;

  const x = e.clientX - e.target.offsetLeft - 40;
  const y = e.clientY - e.target.offsetTop - 40;

  const minX = x;
  const maxX = x + 80;
  const minY = y;
  const maxY = y + 80;

  for(let i = 0; i < hiddenObjectArr.length; i++){
    if(between(hiddenObjectArr[i].coordX, minX, maxX) && between(hiddenObjectArr[i].coordY, minY, maxY) ){
      setHiddenObjectArr(
        hiddenObjectArr.filter(
          item =>
          item.name !== hiddenObjectArr[i].name
        )
      );
    }
  }

  setCoords({
  x: x,
  y: y
});

}


// //check after every update to dom to check if all objects are found
useEffect(() => {

  if(isMounted.current){
    if(hiddenObjectArr.length === 0){
      //stop timer
      stopTimer();
    }
  }else{
    isMounted.current = true;
  }
});


const handleSubmit = () =>{


  writePlayerDb();
  readDb();
  //wait 1sec then reload page to update db
  setTimeout(function () {
        window.location.reload(false);
    }, 1000);
}

const handleChange = (e) => {
  setPlayerName(e.target.value);
  console.log(playerName);
}


  return (
    <div className='main-container'>
      <div className='game-title'>Find the hidden Objects!</div>
      <div className='find-container'>

        {hiddenObjectArr.map(object => {
          return (
            <div className='hidden-object' style={{backgroundImage: `url(${object.imgUrl})`}} key={object.name}>
            </div>
          )
        })
        }

        {
          hiddenObjectArr.length === 0 &&
          <div className='player-input'>
            <label htmlFor='playerName'>You found all the items! enter your name to record your time:</label>
            <input id='playerName' type='text' onChange={handleChange}/>
            <button onClick={handleSubmit}>submit </button>
          </div>
        }

      </div>
      <div className='img-container' style={{backgroundImage: `url(${imgUrl})`}} onClick={handleClick}>
        <div className='box' style={{top: `${coords.y}px`, left: `${coords.x}px`}}></div>
      </div>
      <div className="timer-container">
        <div className="time">
          <span className="minute">{minute}</span>
          <span>:</span>
          <span className="second">{second}</span>
        </div>
      </div>
      <div className="score-title">
        <b>Last 10 players:</b>
      </div>
      <div className='player-scoreboard'>
        {
          scoreboardArr.map(player => {
            return (
              <div key={player.key}>
                <b>Player Name:</b> {player.name}  <b>Time:</b> {player.time}
              </div>
            )
          })
        }
      </div>
      <div className='footer'><p>I do not own any of the images used in this website, created for educational purpose only (c){year} <a href='https://github.com/Longmann94'>Long Mann</a></p></div>
    </div>
  );
}

export default App;
