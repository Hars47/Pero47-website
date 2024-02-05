
let currentSong = new Audio();

function secondsToMinutesSeconds(seconds){
    if (isNaN(seconds) || seconds < 0) {
        return "Invalid input";
        
    }

    const minutes = Math.floor(seconds/60);
    const remainingSeconds = Math.floor(seconds%60);
    const formattedMinutes = String(minutes).padStart(2,'0');
    const formattedSeconds = String(remainingSeconds).padStart(2,'0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(){
    let a = await fetch("http://127.0.0.1:5500/songs/")
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    let songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split("/songs/")[1])
        }
        
    }
    return(songs)
}

const playMusic = (track, pause=false)=>{
    currentSong.src = "/songs/" + track
    if (!pause) {
        currentSong.play()
        play.src = "pause.svg"      // This line is used to auto change the button form play to pause 
        
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)    // decodeURI is used to decode the encoded url(%20name%20) 
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function main(){

    
    // To get the list of all the songs
    let songs = await getSongs()
    playMusic(songs[0], true)

    //Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> <img class="invert" src="music.svg" alt="">
                <div class="info">
                  <div> ${song.replaceAll("%20", " ")} </div>
                  <div>Pero</div>
                </div>
                <div class="playnow">
                  <span>Play Now</span>
                  <img class="invert" src="play.svg" alt="">
                </div> </li>`;    
    }

    // This only updates the player once

    // audio.addEventListener("loadeddata", () => {
    //     let duration = audio.duration;
    //     console.log(duration)   //this gives the duration of the song in seconds
    // })


    //Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)   //gives name of the songs
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim()) 
            //trim() is used to remove space from front and back in the directory/link or it gives song not found error
        
        })
    })

    //Attach an event listener to play next and previous
    play.addEventListener("click", () => {
        if(currentSong.paused){
            currentSong.play()
            play.src = "pause.svg"
        }
        else{
            currentSong.pause()
            play.src = "play.svg"
        }
    })

    //Listen for time update event
    //Read the song time and converts to this format -> 00:00 using secondsToMinutesSeconds func
    currentSong.addEventListener("timeupdate", ()=>{
        console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/
        ${secondsToMinutesSeconds(currentSong.duration)}`

        //This is used to update the progress of the current song.
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration) * 100 + "%";
    })

    //Adding an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%"; //To change the location of the circle in the seekbar.
        currentSong.currentTime = ((currentSong.duration)* percent)/100     //To update the duration/time of the song when you move the circle in the seekbar.

    })

}

main()

