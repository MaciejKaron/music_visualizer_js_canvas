const container = document.getElementById('container');
const audio1 = document.getElementById('audio1');
const audio = document.getElementById('audio');
const file = document.getElementById('fileUpload');
const starter = document.getElementById('starter');
var checkbox = document.querySelector("input[name=microphone]");

const canvas = document.getElementById('canvas1');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

let audioSource;
let analyser;
// Kot gif
starter.addEventListener('click', function () {
    audio1.src = 'sounds/cat.wav'
    //Web audio api
    const audioContext = new AudioContext();
    audio1.play();
    if (audioSource == undefined) {
        audioSource = audioContext.createMediaElementSource(audio1);
        analyser = audioContext.createAnalyser();
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
    }
    analyser.fftSize = 256;  //liczba sampli(próbek audio) które chcemy umieścić w pliku danych analizatora
    const bufferLength = analyser.frequencyBinCount; //liczba słupków, zawsze połowa z fftSize
    const dataArray = new Uint8Array(bufferLength); //convert to unassigned 8-bit integers

    const barWidth = canvas.width / bufferLength;
    let barHeight;
    let x;

    function animate() {
        x = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray);

        optionChanges(bufferLength, x, barWidth, barHeight, dataArray);
        requestAnimationFrame(animate);
    }
    animate();
    
});
/////////////////////////////////////////////////////////////////////////////////////////////
// wybor pliku
file.addEventListener('change', function () {
    const files = this.files;
    audio1.src = URL.createObjectURL(files[0]);
    audio1.load();
    audio1.play();

    const audioContext = new AudioContext();
    if (audioSource == undefined) {
        audioSource = audioContext.createMediaElementSource(audio1);
        analyser = audioContext.createAnalyser();
        audioSource.connect(analyser);
        analyser.connect(audioContext.destination);
    }
    analyser.fftSize = 256;  //liczba sampli(próbek audio) które chcemy umieścić w pliku danych analizatora
    const bufferLength = analyser.frequencyBinCount; //liczba słupków, zawsze połowa z fftSize
    const dataArray = new Uint8Array(bufferLength); //convert to unassigned 8-bit integers

    const barWidth = canvas.width / bufferLength;
    let barHeight;
    let x;

    function animate() {
        x = 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        analyser.getByteFrequencyData(dataArray);

        optionChanges(bufferLength, x, barWidth, barHeight, dataArray);
        
        requestAnimationFrame(animate);
    }
    animate();
})

//////////////////////////////////////////////////////////////////////////////////////////////////////
//mikrofon
checkbox.addEventListener('change', function () {
    if (this.checked) {
    let freqs;
    navigator.mediaDevices.enumerateDevices().then(devices => {
        navigator.mediaDevices
            .getUserMedia({
                audio: true
            })
            .then(stream => {
                window.localStream = stream;
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const analyser = audioContext.createAnalyser();
                const audioSource = audioContext.createMediaStreamSource(stream);
                audioSource.connect(analyser);
                analyser.connect(audioContext.destination);
    
                freqs = new Uint8Array(analyser.frequencyBinCount);
    
                function draw() {
                    let radius = 150;
                    let bars = 200;
    
                    // Draw Background
                    
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
                    // Draw circle
                    ctx.beginPath();
                    ctx.arc(
                        canvas.width / 2,
                        canvas.height / 2,
                        radius,
                        0,
                        2 * Math.PI
                    );
                    ctx.stroke();
                    analyser.getByteFrequencyData(freqs);
    
                    // Draw label
                    ctx.font = "800 64px Helvetica Neue";
                    const avg =
                        [...Array(255).keys()].reduce((acc, curr) => acc + freqs[curr], 0) /
                        255;
                    ctx.fillStyle = "rgb(" + 200 + ", " + (200 - avg) + ", " + avg + ")";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "top";
                    ctx.fillText("d^-_-^b", canvas.width / 2, canvas.height / 2 - 22);
                    // Draw bars
                    for (var i = 0; i < bars; i++) {
                        let radians = (Math.PI * 2) / bars; //Odstęp między paskami
                        let bar_height = freqs[i] * 1.5; // długość pasków
    
                        let xa = canvas.width / 2 + Math.cos(radians * i) * radius;
                        let ya = canvas.height / 2 + Math.sin(radians * i) * radius;
                        let x_end =
                            canvas.width / 2 + Math.cos(radians * i) * (radius + bar_height);
                        let y_end =
                            canvas.height / 2 + Math.sin(radians * i) * (radius + bar_height);
                        let color =
                            "rgb(" + 200 + ", " + (100 - freqs[i]) + ", " + freqs[i] + ")";
                        ctx.strokeStyle = color;
                        ctx.lineWidth = 8; // gruboś pasków
                        ctx.beginPath();
                        ctx.moveTo(xa, ya);
                        ctx.lineTo(x_end, y_end);
                        ctx.stroke();
                    }
    
                    requestAnimationFrame(draw);
                }
    
                requestAnimationFrame(draw);
            });
    });
    } else {
        localStream.getTracks().forEach( (track) => {
            track.stop();
            });
    }
   
})

//////////////////////////////////////////////////////////////////////////////////////////////////

function drawVisualiser(bufferLength, x, barWidth, barHeight, dataArray) {
    for (let i = 0; i < bufferLength; i++){
        barHeight = dataArray[i] * 2;
        const red = i * barHeight/20;
        const green = i * 4;
        const blue = barHeight / 2;
        ctx.fillStyle = 'rgb(' + red + ',' + green + ',' + blue + ')';
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth;
        ctx.lineWidth = 1;
    }
}

function drawVisualiser2(bufferLength, x, barWidth, barHeight, dataArray) {
     barWidth = (canvas.width/2) / bufferLength;
    for (let i = 0; i < bufferLength; i++){
        barHeight = dataArray[i] * 2;
        const red = i * barHeight/10;
        const green = i * 2;
        const blue = barHeight/16;
        ctx.fillStyle = 'rgb(' + red + ',' + green + ',' + blue + ')';
        ctx.fillRect(canvas.width/2-x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth;
        ctx.lineWidth = 1;
    }
    for (let i = 0; i < bufferLength; i++){
        barHeight = dataArray[i] * 2;
        const red = i * barHeight/10;
        const green = i * 2;
        const blue = barHeight/16;
        ctx.fillStyle = 'rgb(' + red + ',' + green + ',' + blue + ')';
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth;
        ctx.lineWidth = 1;
    }
}

function drawVisualiser3(bufferLength, x, barWidth, barHeight, dataArray) {
    for (let i = 0; i < bufferLength; i++){
        barHeight = dataArray[i] * 2;
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(i * 8.184);
        const color = 230 + i * 0.65;
        ctx.fillStyle = 'hsl(' + color + ',80%,' + barHeight / 8 + '%)';
        ctx.beginPath();
        ctx.arc(0, barHeight / 2, barHeight / 2, 0, Math.PI / 4);
        ctx.fill();
        ctx.stroke();
        x += barWidth;
        ctx.restore();
        ctx.lineWidth = 1;
    }
}

function drawVisualiser4(bufferLength, x, barWidth, barHeight, dataArray) {
    for (let i = 0; i < bufferLength; i++){
        barHeight = dataArray[i] * 2;
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(i * 1.2);
        const color = i * 5;
        ctx.strokeStyle = 'hsl(' + color + ',50%,' + barHeight / 4 + '%)';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, barHeight);
        ctx.stroke();
        x += barWidth;

        if (i > bufferLength * 0.5) {
            ctx.beginPath();
            ctx.arc(0, 0, barHeight / 2.5, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
        ctx.lineWidth = 2;
    }
}


const update = function(){ 
    var select = document.getElementById('select');
    var option = select.options[select.selectedIndex];
    var result = document.getElementById('menu_result');

    select.addEventListener('click', function () {
        result.innerHTML ='🔥 '+ option.value + ' 🔥';
    })

    document.getElementById('select').value = option.value;
    return option.value
}

function optionChanges(bufferLength, x, barWidth, barHeight, dataArray) {
    const option = update();

        if (option === "opcja 1") {
            drawVisualiser(bufferLength, x, barWidth, barHeight, dataArray);
        } else if (option === "opcja 2") {
            drawVisualiser2(bufferLength, x, barWidth, barHeight, dataArray);
        } else if (option === "opcja 3") {
            drawVisualiser3(bufferLength, x, barWidth, barHeight, dataArray);
        } else if (option === "opcja 4") {
            drawVisualiser4(bufferLength, x, barWidth, barHeight, dataArray);
        } 
}





