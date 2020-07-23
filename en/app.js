
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
var mic;
var enviado = false;
var permissaolocalizacao;

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
	
	var msgstart = document.getElementById("msgstart");
	var msgstop = document.getElementById("msgstop");

	//Alterna instruições para iniciar e parar gravação
	msgstart.hidden = true;
	msgstop.hidden = false;
	
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
		rec.record();

		console.log("Recording started");

		//Zera e inicia o cronômetro na sequencia
		stop();
		start();
		closeButton = document.getElementById("closeButton");
		closeButton.hidden = true;

	}).catch(function (err) {
		//enable the record button if getUserMedia() fails
		console.log("Permissão negada microfone");
		permissaomicrofone.hidden = false;//exibe msg caso a pessoa bloqueie o microfone
		recorderinstructions.hidden = true;//Exibe gravador e demais elementos vinculados a ele
		mic = false;
	});
}

function stopRecording() {
	console.log("stopButton clicked");

	//reset button just in case the recording is stopped while paused
	//pauseButton.innerHTML="Pause";

	//tell the recorder to stop the recording
	rec.stop();

	//zera o cronômetro
	stop();

	//Esconde o cronometro
	var counter = document.getElementById("counter");
	counter.hidden = true;

	//stop microphone access
	gumStream.getAudioTracks()[0].stop();

	//create the wav blob and pass it on to createDownloadLink
	rec.exportWAV(createDownloadLink);

	//Ocultar botões
	recordButton.hidden = true;
	stopButton.hidden = true;
	msgmax.hidden = true;
	msgstop.hidden = true;
	closeButton.hidden = false;
}

function createDownloadLink(blob) {
	audio = blob;
	var url = URL.createObjectURL(blob);
	var au = document.createElement('audio');
	var li = document.createElement('li');
	var link = document.createElement('a');

	//name of .wav file to use during upload and download (without extendion)
	filename = new Date().toISOString();

	//add controls to the <audio> element
	au.controls = true;
	au.src = url;
 	au.style.width = "80%";
 	au.style.textAlign = "center";

	//save to disk link
	//link.href = url;
	//link.download = filename+".wav"; //download forces the browser to donwload the file using the  filename
	//link.innerHTML = "Save to disk";

	//Define id para o elemento da lista. 
 	 li.id = "elemento_audio";

	//add the new audio element to li
	li.appendChild(au);

	//add the filename to the li
	//li.appendChild(document.createTextNode(filename+".wav "))

	//add the save to disk link to li
	//li.appendChild(link);

	mensagem.innerHTML = "<br>LISTEN TO YOUR TESTIMONIAL";
	mensagem.hidden = false;

	//Regravar áudio
	var reset = document.createElement('button');
	reset.innerHTML = "<img src=\"media/again.png\"/ style='width:80%;  display:inline;'>";
	//reset.innerHTML = "Gravar Novamente";
	reset.id = "reset";
	reset.addEventListener("click", function (event) {
		li.removeChild(au);
		li.removeChild(reset);
		li.removeChild(upload);
		recordButton.hidden = false;
		stopButton.hidden = true;
		counter.hidden = false;
		msgstart.hidden = false;
		msgstop.hidden = true;
		msgmax.hidden = false;
		mensagem.hidden = true;
		//window.location.href = '#';
	})

	//add reset to the li
	li.appendChild(reset);


	//upload link
	var upload = document.createElement('button');
	//upload.href="#";
	upload.innerHTML = "<img src=\"media/send.png\"/  style='width:90%; display:inline'>";
	upload.id = "upload";
	upload.addEventListener("click", function (event) {
		enviar();
	})

	li.appendChild(document.createTextNode(" "))//add a space in between
	li.appendChild(upload)//add the upload link to li

	//add the li element to the ol
	recordingsList.appendChild(li);
	reset.hidden = false;
	upload.hidden = false;
	recordingsList.hidden = false;

}

function enviar() {
	recorderinstructions.hidden = true;//Esconde as instrucoes de gravação para que apenas o retorno do envio seja exibido
	mensagem.hidden = true;//Exibe mensagem de agradecimento/confirmacao

	var bairro = document.getElementById("bairro");
	var cidade = document.getElementById("cidade");
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function (e) {
		var msgConfirm = document.getElementById("msgConfirm");
		var msgError = document.getElementById("msgError");
		var msgLoading = document.getElementById("msgLoading");
		var socialMedia = document.getElementById("socialMedia");

		if (e.target.readyState === 4 && e.target.status === 200) {
			//msgConfirm.innerHTML = e.target.statusText;
			msgConfirm.hidden = false;
			socialMedia.hidden = false;
			msgLoading.hidden = true;
		} else {
			msgLoading.hidden = false;
			msgConfirm.hidden = true;
			socialMedia.hidden = true;
		}
	};
	var fd = new FormData();
	fd.append("audio_data", audio, filename);
	if (this.position) {
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

	//Esconde todos os botões para em seguida exibir mensagem de confirmação de upload
	reset.hidden = true;
	upload.hidden = true;
	recordingsList.hidden = true;
	enviado = true;

	//Limpa a recordingsList
	var li = document.getElementById("recordingsList");

	while (li.firstChild) {
		li.removeChild(li.firstChild);
	}
}

function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(getPosition, showError);
	}
}

function getPosition(position) {
	console.log("Latitude: " + position.coords.latitude +
		"\n Longitude: " + position.coords.longitude);

	this.position = position;
	//Após coletar as coordenadas segue para a tela do gravador
	permissaolocalizacao = true;
	step(2);
}

function step(param){
	var bairro = document.getElementById("bairro");
	var cidade = document.getElementById("cidade");
	var emptylocationmsg = document.getElementById("emptylocationmsg");

	if (param == 1){
		const x =  this.getLocation();
	} else if (param == 2){
		if ((cidade.value == '' || cidade.value == null || bairro.value == '' || bairro.value == null) && permissaolocalizacao == false){ 
			emptylocationmsg.innerHTML = "(Please, fill out the fields below!)";
			console.log("Input localização vazio");
		}else {
			console.log("Input localização com conteúdo");
			resetRecorder();
			recorderlocation.hidden = true; //esconde formulario cidade-bairro
			recorderinitinstructions.hidden = true;
		}
		
	}
}

// When the user clicks on <span> (x), close the modal
function fechar() {
	if (mic != false) {
		//Limpa a recordingsList
		var li = document.getElementById("recordingsList");

		while (li.firstChild) {
			li.removeChild(li.firstChild);
		}

		recorderinitinstructions.hidden = false;
		recorderinstructions.hidden = true;
		permissaomicrofone.hidden = true;
		mensagem.hidden = true;
		recorderlocation.hidden = true;
		msgError.hidden = true;
		msgConfirm.hidden = true;
		socialMedia.hidden = true;
	}
}

function resetRecorder(){
	recorderinstructions.hidden = false;
	msgstart.hidden = false;
	recordButton.hidden = false;
	counter.hidden = false;
	msgmax.hidden = false;
}

function showError(error) {
	permissaolocalizacao = false;
	var loc = document.getElementById("recorderlocation");
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

	loc.hidden = false;
	recorderinitinstructions.hidden = true;
	var bairro = document.getElementById("bairro");
	var cidade = document.getElementById("cidade");
}

"use strict"

var mm = 0;
var ss = 0;

var tempo = 1000;//Quantos milésimos valem 1 segundo?
var cron;

//Inicia o temporizador
function start() {
    cron = setInterval(() => { timer(); }, tempo);
}

//Para o temporizador mas não limpa as variáveis
function pause() {
    clearInterval(cron);
}

//Para o temporizador e limpa as variáveis
function stop() {
    clearInterval(cron);
    mm = 0;
    ss = 0;

    document.getElementById('counter').innerText = '00:00';
}

//Faz a contagem do tempo e exibição
function timer() {
    ss++; //Incrementa +1 na variável ss

    if (ss == 59) { //Verifica se deu 59 segundos
        ss = 0; //Volta os segundos para 0
        mm++; //Adiciona +1 na variável mm
    }

    //Cria uma variável com o valor tratado HH:MM:SS
    var format = (mm < 10 ? '0' + mm : mm) + ':' + (ss < 10 ? '0' + ss : ss);
    
    //Insere o valor tratado no elemento counter
    document.getElementById('counter').innerText = format;

    //Retorna o valor tratado
    return format;
}