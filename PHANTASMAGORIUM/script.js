///////////////////////////////////////////////////////
// Global BGM Namespace (Playlist, Titles, Paths, Index)

  // Resolve script URL robustly and build absolute playlist URLs
  const { playlist, titles, index: __initialIndex } = (() => {
    const scripts = document.getElementsByTagName("script");
    // FIND: script element
    let current = Array.from(scripts).reverse().find(s => s.src && s.src.includes("script.js")) || scripts[scripts.length - 1];
    const scriptUrl = current && current.src ? new URL(current.src, location.href) : new URL('./', location.href);
    const files = ["phantasmagoria.mp3", "WINTERWATER.mp3"];
    const pl = files.map(f => new URL(`media/audio/${f}`, scriptUrl.href).href);
    const t = {
      "phantasmagoria.mp3": "phantasmagoria - VMN",
      "WINTERWATER.mp3": "WINTERWATER - VMN"
    };
    return { playlist: pl, titles: t, index: 0 };
  })();

  // Shared Index
  let index = __initialIndex;

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
  const autoBtn = document.getElementById('auto-btn');
  
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
  // Audio Autoplay Toggle
  autoBtn.addEventListener('click', () => {
    if (bgmAudio.autoplay) {
      bgmAudio.autoplay = false;
      autoBtn.textContent = 'Autoplay: OFF';
    } else {
      bgmAudio.autoplay = true;
      autoBtn.textContent = 'Autoplay: ON';
    }
  });
  // Paused Text Updater
  bgmAudio.addEventListener('play', updateText);
  bgmAudio.addEventListener('pause', () => {
    bgmText.textContent = 'Paused.';
  });
  // Autoplay Button Text Updater
  if (bgmAudio.autoplay) {
      bgmAudio.autoplay = false;
      autoBtn.textContent = 'Autoplay: OFF';
    } else {
      bgmAudio.autoplay = true;
      autoBtn.textContent = 'Autoplay: ON';
    }

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
  const autoPlaySetting = sessionStorage.getItem("bgm-autoplay") === "true";

  // Autoplay Setting Restorer
  audio.autoplay = autoPlaySetting;

  // Position Restorer
  if (left) box.style.left = left;
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
    audio.dataset.userPlayed = "true";
  });

  // State Saver Function
  const saveState = () => {
    sessionStorage.setItem("bgm-left", box.style.left);
    sessionStorage.setItem("bgm-top", box.style.top);
    sessionStorage.setItem("bgm-time", audio.currentTime);
    sessionStorage.setItem("bgm-index", index);
    sessionStorage.setItem("bgm-playing", (!audio.paused).toString());
    sessionStorage.setItem("bgm-user-played", (audio.dataset.userPlayed === "true").toString());
    sessionStorage.setItem("bgm-autoplay", audio.autoplay.toString());
  };

  // Periodic State Save + Unload Handling
  const interval = setInterval(saveState, 2000);
  window.addEventListener("beforeunload", saveState);
  window.addEventListener("unload", () => clearInterval(interval));
});
