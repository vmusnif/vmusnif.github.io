///////////////////////////////////////////////////////
// Global BGM Namespace (Playlist, Titles, Paths, Index)

  // Script Path
  const SCRIPT_PATH = (() => {
    const scripts = document.getElementsByTagName("script");
    const current = scripts[scripts.length - 1]; // <-- safe alternative
    const src = current.src;
    return src.substring(0, src.lastIndexOf('/') + 1);
  })();

  // Playlist
  const playlist = [
    "MOODSWING.mp3",
    "TheThirdSanctuary.mp3",
    "HometownReprise.mp3"
  ].map(file => SCRIPT_PATH + "media/audio/" + file);

  // Titles
  const titles = {
    "MOODSWING.mp3": "MOODSWING - gronnblade",
    "TheThirdSanctuary.mp3": "The Third Sanctuary - Toby Fox",
    "HometownReprise.mp3": "Another day in Hometown - Toby Fox"
  };

  // Shared Index
  let index = 0;


///////////////////////////////////////////////////////
// Collapsible Content

  // Collapsible Functionality
  document.querySelectorAll('.collapsible').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const content = btn.nextElementSibling;
      if (!content) return;
      if (content.style.maxHeight && content.style.maxHeight !== '0px') {
        content.style.maxHeight = '0';
      } else {
        content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  }); 

  // .content maxHeight resetter
  window.addEventListener('resize', () => {
    document.querySelectorAll('.content').forEach(c => {
      if (c.style.maxHeight && c.style.maxHeight !== '0px') {
        c.style.maxHeight = c.scrollHeight + 'px';
      }
    });
  });

///////////////////////////////////////////////////////////
// Navbar Spacer Height Adjuster
document.addEventListener("DOMContentLoaded", () => {
    const brnav = document.getElementById("brnav");
    const navbar = document.querySelector(".navbar");

    if (brnav && navbar) {
        brnav.style.height = navbar.offsetHeight + 10 + "px";
    }
});

///////////////////////////////////////////////////////
// Background Music Player Functionality
document.addEventListener('DOMContentLoaded', () => {
  const bgmText = document.getElementById('bgm-text');
  const bgmAudio = document.getElementById('bgm-audio');
  const nextBtn = document.getElementById('next-btn');
  const prevBtn = document.getElementById('prev-btn');
  
  // Script Path
  const SCRIPT_PATH = (() => {
    const scripts = document.getElementsByTagName("script");
    const current = scripts[scripts.length - 1];
    const src = current.src;
    return src.substring(0, src.lastIndexOf('/') + 1);
  })();

  // Track Loader
  function loadTrack(i) {
    index = (i + playlist.length) % playlist.length;
    bgmAudio.src = playlist[index];
    bgmAudio.load();
    updateText();
  }
  // Now Playing Text Updater
  function updateText() {
    const fullPath = playlist[index];
    const filename = fullPath.substring(fullPath.lastIndexOf("/") + 1);
    bgmText.textContent = "NOW PLAYING: " + (titles[filename] || "Unknown Track");
  }

  // Next Track
  nextBtn.addEventListener('click', () => {
    loadTrack(index + 1);
    bgmAudio.play().catch(() => {});
  });
  // Previous Track
  prevBtn.addEventListener('click', () => {
    loadTrack(index - 1);
    bgmAudio.play().catch(() => {});
  });
  // Paused Text Updater
  bgmAudio.addEventListener('play', updateText);
  bgmAudio.addEventListener('pause', () => {
    bgmText.textContent = 'AUDITORY HALT; IT AWAITS YOUR RESUMPTION.';
  });
  // Auto Next Track
  bgmAudio.addEventListener('ended', () => {
    loadTrack(index + 1);
    bgmAudio.play().catch(() => {});
  });

  // Load first track initially
  loadTrack(index);
});

///////////////////////////////////////////////////////
// Background Music Player Drag&Drop Mechanism
document.addEventListener("DOMContentLoaded", () => {
  const box = document.querySelector(".bgm");
  const navbar = document.querySelector(".navbar");
  let dragging = false;
  let offsetX = 0, offsetY = 0;
  const MARGIN = 20;
  const navHeight = () => navbar.offsetHeight + MARGIN;
  // Box Snap Function
  const snapBox = () => {
    // Window Dimensions
    const W = window.innerWidth;
    const H = window.innerHeight;
    const rect = box.getBoundingClientRect();
    // Center
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2; 
    // Snap Calculation
    const snapX = (centerX < W / 2 ? MARGIN : W - rect.width - MARGIN) - 5;
    const snapY = centerY < H / 2 ? navHeight() : H - rect.height - MARGIN;
    // Snap Action
    box.style.left = snapX + "px";
    box.style.top = snapY + "px";
  };
  // Click (MouseDown)
  box.addEventListener("mousedown", (e) => {
    dragging = true;
    offsetX = e.clientX - box.offsetLeft;
    offsetY = e.clientY - box.offsetTop;
    box.style.transition = "none"; // disable animation while dragging
  });
  // Drag (MouseMove)
  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    // Position Update
    let x = e.clientX - offsetX;
    let y = e.clientY - offsetY;
    // Navbar Collision Prevention
    if (y < navHeight()) y = navHeight();
    box.style.left = x + "px";
    box.style.top = y + "px";
  });
  // Drop (MouseUp)
  document.addEventListener("mouseup", () => {
    if (!dragging) return;
    dragging = false;
    box.style.transition = "all 0.3s ease";
    snapBox();
  });
  // Resize Handling
  window.addEventListener("resize", snapBox);
  // Content Change Handling
  const observer = new MutationObserver(() => {
      snapBox();
  });
  observer.observe(box, { childList: true, subtree: true, characterData: true });
  // Load Handling
  snapBox();
});

///////////////////////////////////////////////////////
// Background Music Player Persistence (SessionStorage, Index-Based)
document.addEventListener("DOMContentLoaded", () => {
  const box = document.querySelector(".bgm");
  const audio = document.getElementById("bgm-audio");

  if (!box || !audio) return;

  // Saved State Retriever
  const left = sessionStorage.getItem("bgm-left");
  const top = sessionStorage.getItem("bgm-top");
  const time = parseFloat(sessionStorage.getItem("bgm-time") || 0);
  const storedIndex = parseInt(sessionStorage.getItem("bgm-index"), 10);
  const playing = sessionStorage.getItem("bgm-playing") === "true";
  const userPlayed = sessionStorage.getItem("bgm-user-played") === "true";

  // Position Restorer
  if (left) box.style.left = left;         // <-- fixed: check left, not left&&top  
  if (top) box.style.top = top;

  // Track Restorer (Index-Based) — USE GLOBAL INDEX
  if (!isNaN(storedIndex) && storedIndex >= 0 && storedIndex < playlist.length) {
    index = storedIndex;
  }
  audio.src = playlist[index];
  audio.currentTime = time;

  // Update Now Playing Text
  const fullPath = playlist[index];
  const filename = fullPath.substring(fullPath.lastIndexOf("/") + 1);
  document.getElementById("bgm-text").textContent =
    "NOW PLAYING: " + (titles[filename] || "Unknown Track");

  // Autoplay if previously playing and user has interacted
  if (playing && userPlayed) {
    audio.play().catch(() => {
      console.log("Autoplay blocked, waiting for user interaction");
    });
  }

  // Track user interaction (Play Event)
  audio.addEventListener("play", () => {
    sessionStorage.setItem("bgm-user-played", "true");
    audio.dataset.userPlayed = "true";      // <-- fixed: set dataset so saveState reads it
  });

  // State Saver Function
  const saveState = () => {
    sessionStorage.setItem("bgm-left", box.style.left);
    sessionStorage.setItem("bgm-top", box.style.top);
    sessionStorage.setItem("bgm-time", audio.currentTime);
    sessionStorage.setItem("bgm-index", index);
    sessionStorage.setItem("bgm-playing", (!audio.paused).toString());
    sessionStorage.setItem("bgm-user-played", (audio.dataset.userPlayed === "true").toString());
  };

  // Periodic State Save + Unload Handling
  const interval = setInterval(saveState, 2000);
  window.addEventListener("beforeunload", saveState);
  window.addEventListener("unload", () => clearInterval(interval));
});

///////////////////////////////////////////////////////
// 1225 & Hell
document.addEventListener("DOMContentLoaded", () => {
  const bgmAudio = document.getElementById("bgm-audio");
  const bgmText = document.getElementById("bgm-text");
  const audioLabel = document.querySelector(".bgm > div"); // the container with the "AUDITORY EXPERIENCE" text
  const logo = document.getElementById("fulllogo");
  const h12 = 11;
  const m25 = 24;

  if (!bgmAudio || !bgmText || !audioLabel || !logo) return;

  let in1225 = false;
  let is1225Mode = false;   // exported state for other code
  const specialTrack = SCRIPT_PATH + "media/audio/findher.mp3";

  // build hell.html path relative to where script.js lives
  function openHellRelativeToScript() {
    const hellPath = SCRIPT_PATH + "forest/hell.html";
    const logoBox = document.querySelector(".logobox");
    if (!logoBox) return;
    const parent = logoBox.parentElement;
    if (parent && parent.tagName === "A") {
        parent.href = hellPath;
    }
}


  // Logo click → secret path only if special track + playing
  logo.addEventListener("click", () => {
    if (is1225Mode && !bgmAudio.paused) {
      openHellRelativeToScript();
    }
  }); 

  function enter1225() {
    in1225 = true;
    is1225Mode = true;

    // interrupt normal player
    bgmAudio.pause();
    bgmAudio.src = specialTrack;
    bgmAudio.loop = true;        // loop ONLY during 12:25
    bgmAudio.load();
    bgmAudio.play().catch(() => {});

    // change UI text
    function findher() {
      bgmText.textContent = "find her";
    }
    findher();
    let find = setInterval(findher, 50);

    // Hell
    let child = document.querySelector(".logobox");
    let parent = child.parentElement;
    document.getElementById(parent).setAttribute("href", hellPath);
    
  }
  function exit1225() {
    in1225 = false;
    is1225Mode = false;

    // stop loop, finish once, don't skip to next playlist
    bgmAudio.loop = false;

    // restore normal UI text
    audioLabel.firstChild.textContent = "AUDITORY EXPERIENCE:";
  }

  function check1225() {
    const now = new Date();
    const hr = now.getHours();
    const min = now.getMinutes();

    // ENTER
    if (hr === h12 && min === m25) {
      if (!in1225) {enter1225()};
      return;
    }

    // EXIT
    if (in1225 && !(hr === h12 && min === m25)) {
      exit1225();
    }
  }

  check1225();
  setInterval(check1225, 60000);
});

///////////////////////////////////////////////////////
// THIS IS                                           //
// THE WORLDS EDGE.                                  //
//                                                   //
// HERE LIES                                         //
// THE CODE YOU SEEK.                                //
//                                                   //
// PROCEED NO FURTHER                                //
// FOR BEYOND THIS POINT                             //
// LIES THE A PLACE                                  //
// MUCH, MUCH DARKER.                                //
//                                                   //
// DARKER THAN                                       //
// DARK.                                             //       
//                                                   //
// ENTRY NUMBER                                      //
// 18                                                //              
//                                                   //
// ABANDON ALL HOPE                                  //    
// YE WHO ENTER HERE.                                // 
//                                                   //
// ONE DAY                                           //
// YOU MAY RETURN                                    //
// TO FINISH THIS                                    //
//  PROJECT,                                         //
// BUT NOT TODAY.                                    //
///////////////////////////////////////////////////////