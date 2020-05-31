
//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var rec; 							//Recorder.js object
var input; 							//MediaStreamAudioSourceNode we'll be recording

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext //audio context to help us record
var filename;
var audio;
var position;

var recordButton = document.getElementById("recordButton");
var stopButton = document.getElementById("stopButton");

//add events to those 2 buttons
recordButton.addEventListener("click", startRecording);
stopButton.addEventListener("click", stopRecording);

function startRecording() {
	console.log("recordButton clicked");

	/*
		Simple constraints object, for more advanced audio features see
		https://addpipe.com/blog/audio-constraints-getusermedia/
	*/

	var constraints = { audio: true, video: false }

	recordButton.hidden = true;
	stopButton.hidden = false;


	/*
    	We're using the standard promise based getUserMedia() 
    	https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	*/

	navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
		console.log("getUserMedia() success, stream created, initializing Recorder.js ...");

		/*
			create an audio context after getUserMedia is called
			sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
			the sampleRate defaults to the one set in your OS for your playback device

		*/
		audioContext = new AudioContext();

		/*  assign to gumStream for later use  */
		gumStream = stream;

		/* use the stream */
		input = audioContext.createMediaStreamSource(stream);

		/* 
			Create the Recorder object and configure to record mono sound (1 channel)
			Recording 2 channels  will double the file size
		*/
		rec = new Recorder(input, { numChannels: 1 })

		//start the recording process
		rec.record()

		console.log("Recording started");

	}).catch(function (err) {
		//enable the record button if getUserMedia() fails
		recordButton.disabled = false;
		stopButton.disabled = true;
	});
}

function stopRecording() {
	console.log("stopButton clicked");

	//reset button just in case the recording is stopped while paused
	//pauseButton.innerHTML="Pause";

	//tell the recorder to stop the recording
	rec.stop();

	//stop microphone access
	gumStream.getAudioTracks()[0].stop();

	//create the wav blob and pass it on to createDownloadLink
	rec.exportWAV(createDownloadLink);

	//Ocultar botões
	recordButton.hidden = true;
	stopButton.hidden = true;
}

function createDownloadLink(blob) {
	audio = blob;
	var modal = document.getElementById("myModal");
	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');
	var li = document.createElement('li');
	var link = document.createElement('a');

	//name of .wav file to use during upload and download (without extendion)
	filename = new Date().toISOString();

	//add controls to the <audio> element
	au.controls = true;
	au.src = url;

	//save to disk link
	//link.href = url;
	//link.download = filename+".wav"; //download forces the browser to donwload the file using the  filename
	//link.innerHTML = "Save to disk";

	//add the new audio element to li
	li.appendChild(au);

	//add the filename to the li
	//li.appendChild(document.createTextNode(filename+".wav "))

	//add the save to disk link to li
	//li.appendChild(link);

	//Regravar áudio
	var reset = document.createElement('button');
	reset.innerHTML = "Gravar Novamente";
	reset.id = "reset";
	reset.addEventListener("click", function (event) {
		window.location.href = 'index.html';
	})

	//add reset to the li
	li.appendChild(reset);


	//upload link
	var upload = document.createElement('button');
	//upload.href="#";
	upload.innerHTML = "Enviar !";
	upload.id = "upload";
	upload.addEventListener("click", async (event) => {
		const x = await this.getLocation();
	})

	li.appendChild(document.createTextNode(" "))//add a space in between
	li.appendChild(upload)//add the upload link to li

	//add the li element to the ol
	recordingsList.appendChild(li);

}

// When the user clicks on <span> (x), close the modal
function fechar() {
	var modal = document.getElementById("myModal");
	modal.style.display = "none";
}

function confirmacao() {

}

function enviar() {
	var bairro = document.getElementById("bairro");
	var cidade = document.getElementById("cidade");

	var xhr = new XMLHttpRequest();
	xhr.onload = function (e) {
		if (this.readyState === 4) {
			console.log("Server returned: ", e.target.responseText);
		}
	};
	var fd = new FormData();
	fd.append("audio_data", audio, filename);
	if (this.position) {
		console.log(this.position.coords.latitude)
		fd.append("permission", true);
		fd.append("latitude", this.position.coords.latitude);
		fd.append("longitude", this.position.coords.longitude);
	}else {
		fd.append("permission", false);
		fd.append("bairro", bairro.value);
		fd.append("cidade", cidade.value);
	}
	xhr.open("POST", "upload.php", true);
	xhr.send(fd);
	fechar();

	//Esconde todos os botões para em seguida exibir mensagem de confirmação de upload
	reset.hidden = true;
	upload.hidden = true;
	recordingsList.hidden = true;	
}

function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(getPosition, showError);
	}
}

function getPosition(position) {
	console.log("Latitude: " + position.coords.latitude +
		"<br>Longitude: " + position.coords.longitude);

	this.position = position;
	this.enviar();
}

function showError(error) {
	var modal = document.getElementById("myModal");
	switch (error.code) {
		case error.PERMISSION_DENIED:
			console.log("Usuário rejeitou a solicitação de Geolocalização.");
			break;
		case error.POSITION_UNAVAILABLE:
			console.log("Localização indisponível.");
			break;
		case error.TIMEOUT:
			console.log("A requisição expirou.");
			break;
		case error.UNKNOWN_ERROR:
			console.log("Algum erro desconhecido aconteceu.");
			break;
	}

	modal.style.display = "block";
}
