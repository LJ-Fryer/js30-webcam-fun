const video = document.querySelector(".player");
const canvas = document.querySelector(".photo");
const ctx = canvas.getContext("2d");
const strip = document.querySelector(".strip");
const snap = document.querySelector(".snap");

function getVideo() {
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then((localMediaStream) => {
      video.srcObject = localMediaStream;
      video.play();
    })
    .catch((err) => {
      console.error("Not today 🙁", err); // for when access to camera is denied
      alert("Access to WebCam denied");
    });
}

function renderToCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;

  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);
    let pixels = ctx.getImageData(0, 0, width, height); // extract pixels
    // pixels = redEffect(pixels);
    // pixels = rgbSplit(pixels); // add effects
    // ctx.globalAlpha = 0.7;
    pixels = greenScreen(pixels);
    ctx.putImageData(pixels, 0, 0); // return new pixels values
  }, 16);
}

function takePhoto() {
  snap.currentTime = 0;
  snap.play();
  // take data from canvas
  const data = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = data;
  link.setAttribute("download", "cheese");
  link.innerHTML = `<img src="${data}" alt="Cheese 📸">`;
  strip.insertBefore(link, strip.firstChild);
}

// alters rgb values
function redEffect(pixels) {
  for (i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i + 0] = pixels.data[i + 0] * 1.5; // r
    pixels.data[i + 1] = pixels.data[i + 1] - 75; //g
    pixels.data[i + 2] = pixels.data[i + 2] * 0.75; //b
  }
  return pixels;
}
// separate rgb layers and displace them - doesn't alter the rgb values
function rgbSplit(pixels) {
  for (i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i - 150] = pixels.data[i + 0]; // r
    pixels.data[i + 500] = pixels.data[i + 1]; //g
    pixels.data[i - 550] = pixels.data[i + 2]; //b
  }
  return pixels;
}

function greenScreen(pixels) {
  const levels = {};
  document.querySelectorAll(".rgb input").forEach((input) => {
    levels[input.name] = input.value;
  });

  for (i = 0; i < pixels.data.length; i += 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];

    if (
      red >= levels.rmin &&
      green >= levels.gmin &&
      blue >= levels.bmin &&
      red <= levels.rmax &&
      green <= levels.gmax &&
      blue <= levels.bmax
    ) {
      // remove pixels out of range
      pixels.data[i + 3] = 0; // sets alpha value (transparency) to 0
    }
  }
  return pixels;
}

getVideo();

video.addEventListener("canplay", renderToCanvas);
