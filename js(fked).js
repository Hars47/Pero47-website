let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds){
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
        
    }

    const minutes = Math.floor(seconds/60);
    const remainingSeconds = Math.floor(seconds%60);
    const formattedMinutes = String(minutes).padStart(2,'0');
    const formattedSeconds = String(remainingSeconds).padStart(2,'0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder){
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1])
        }
        
    }

  //Show all the songs in the playlist
  let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
  songUL.innerHTML = ""
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

  //Attach an event listener to each song
  Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
      e.addEventListener("click", element => {
          playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim()) 
          //trim() is used to remove space from front and back in the directory/link or it gives song not found error
      
      })
  })

}

const playMusic = (track, pause=false)=>{
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "pause.svg"      // This line is used to auto change the button form play to pause 
        
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)    // decodeURI is used to decode the encoded url(%20name%20) 
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"

}


 async function displayAlbums(){
     let a = await fetch(`http://127.0.0.1:5500/songs/`)
     let response = await a.text();
     let div = document.createElement("div")
     div.innerHTML = response;
     let anchors = div.getElementsByTagName("a")
     Array.from(anchors).forEach(async e=>{
         if (e.href.includes("/songs")) {
             console.log(e.href.split("/").slice(-1)[0])
             let folder = e.href.split("/").slice(-1)[0];
             // To get the metadata of the folder
             
            //  a = await fetch(`http://127.0.0.1:5500/${folder.replaceAll("%20", " ", "B", "D")}/info.json`)
            //  let response = await a.text();
            //  console.log(response) 
         }
     })
     
     
    }

async function main(){

    
    // To get the list of all the songs
    await getSongs("songs/ncs")
    playMusic(songs[0], true)

    //Display all the albums on the page.
    displayAlbums();

      

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
        //console.log(currentSong.currentTime, currentSong.duration); --> to show the duration in console window of the browser.
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`

        //This is used to update the progress of the current song.
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration) * 100 + "%";
    })

    //Adding an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%"; //To change the location of the circle in the seekbar.
        currentSong.currentTime = ((currentSong.duration)* percent)/100     //To update the duration/time of the song when you move the circle in the seekbar.

    })

    //To toggle the hamburger.
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left ="0"
    })

    //To close the hamburger.
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left ="-120%"
    })

    //Adding event listeners to prev buttons
    previous.addEventListener("click", ()=>{
        console.log("Previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0])
        if((index-1) >= 0){
            playMusic(songs[index-1])
        }
    })

    //Adding event listeners to next buttons
    next.addEventListener("click", ()=>{
        currentSong.pause()
        console.log("Next clicked")

        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0])
        if((index+1) < songs.length){
            playMusic(songs[index+1])
        }
    })

    //Add an event to volume button.
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        console.log("Setting value to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value)/100
    })

    //To Load the playlists when clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            
        })
    })

}

main()

