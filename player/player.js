var stepped = 0, chunks = 0, rows = 0;
var start, end;
var parser;
var pauseChecked = false;
var printStepChecked = false;
var uri;

$(function()
{
	$('#submit-parse').click(function()
	{
		stepped = 0;
		chunks = 0;
		rows = 0;

		var txt = $('#input').val();
		var localChunkSize = $('#localChunkSize').val();
		var remoteChunkSize = $('#remoteChunkSize').val();
		var files = $('#files')[0].files;
		var config = buildConfig();

		// NOTE: Chunk size does not get reset if changed and then set back to empty/default value
		if (localChunkSize)
			Papa.LocalChunkSize = localChunkSize;
		if (remoteChunkSize)
			Papa.RemoteChunkSize = remoteChunkSize;

		pauseChecked = $('#step-pause').prop('checked');
		printStepChecked = $('#print-steps').prop('checked');


		if (files.length > 0)
		{
			if (!$('#stream').prop('checked') && !$('#chunk').prop('checked'))
			{
				for (var i = 0; i < files.length; i++)
				{
					if (files[i].size > 1024 * 1024 * 10)
					{
						alert("A file you've selected is larger than 10 MB; please choose to stream or chunk the input to prevent the browser from crashing.");
						return;
					}
				}
			}

			start = performance.now();

			$('#files').parse({
				config: config,
				before: function(file, inputElem)
				{
					console.log("Parsing file:", file);
				},
				complete: function()
				{
					console.log("Done with all files.");
				}
			});
		}
		else
		{
			start = performance.now();
			var results = Papa.parse(txt, config);
			console.log("Synchronous parse results:", results);
		}
	});

	$('#submit-unparse').click(function()
	{
		var input = $('#input').val();
		var delim = $('#delimiter').val();

		var results = Papa.unparse(input, {
			delimiter: delim
		});

		console.log("Unparse complete!");
		console.log("--------------------------------------");
		console.log(results);
		console.log("--------------------------------------");
	});

	$('#insert-tab').click(function()
	{
		$('#delimiter').val('\t');
	});
});

function buildConfig()
{
	return {
		delimiter: $('#delimiter').val(),
		newline: getLineEnding(),
		header: $('#header').prop('checked'),
		dynamicTyping: $('#dynamicTyping').prop('checked'),
		preview: parseInt($('#preview').val() || 0),
		step: $('#stream').prop('checked') ? stepFn : undefined,
		encoding: $('#encoding').val(),
		worker: $('#worker').prop('checked'),
		comments: $('#comments').val(),
		complete: completeFn,
		error: errorFn,
		download: $('#download').prop('checked'),
		fastMode: $('#fastmode').prop('checked'),
		skipEmptyLines: $('#skipEmptyLines').prop('checked'),
		chunk: $('#chunk').prop('checked') ? chunkFn : undefined,
		beforeFirstChunk: undefined,
	};

	function getLineEnding()
	{
		if ($('#newline-n').is(':checked'))
			return "\n";
		else if ($('#newline-r').is(':checked'))
			return "\r";
		else if ($('#newline-rn').is(':checked'))
			return "\r\n";
		else
			return "";
	}
}

/*Currently not using this function. Had added this to hopefully 
make s2s calls from this script, but the remote server won't accept 
calls from localhost*/
function httpGet(s2sUri, callback)
{
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function () {
		if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
		callback(xmlHttp.responseText);
	}
	xmlHttp.open("GET", s2sUri, true);
	xmlHttp.setRequestHeader("Origin","https://emjcd.com");
	xmlHttp.send(null);
}

function stepFn(results, parserHandle)
{
	stepped++;
	rows += results.data.length;

	parser = parserHandle;

	if (pauseChecked)
	{
		console.log(results, results.data[0]);
		parserHandle.pause();
		return;
	}

	if (printStepChecked)
		console.log(results, results.data[0]);
}

function chunkFn(results, streamer, file)
{
	if (!results)
		return;
	chunks++;
	rows += results.data.length;

	parser = streamer;

	if (printStepChecked)
		console.log("Chunk data:", results.data.length, results);

	if (pauseChecked)
	{
		console.log("Pausing; " + results.data.length + " rows in chunk; file:", file);
		streamer.pause();
		return;
	}
}

function errorFn(error, file)
{
	console.log("ERROR:", error, file);
}

function completeFn()
{
	end = performance.now();
	if (!$('#stream').prop('checked')
			&& !$('#chunk').prop('checked')
			&& arguments[0]
			&& arguments[0].data)
		rows = arguments[0].data.length;

	console.log("Finished input (async). Time:", end-start, arguments);
	console.log("Rows:", rows, "Stepped:", stepped, "Chunks:", chunks);

	/*All code from here below was added by eernst 2017-12/29*/			
	var pRes = arguments[0].data;
	var pixels = [];
	var uriPrefix = "https://www.emjcd.com/u?CID=1501378&TYPE=382584";
	console.log("line 190 " + pRes.length);
	for (i = 1; i < pRes.length; i++)
	{
		uri = "";
		uri += uriPrefix;
		uri += "&AMOUNT=" + pRes[i][4] + "&OID=" + pRes[i][1] + "&METHOD=S2S";
		$(".pixel-list").append("<p><b>" + uri + "</b></p> <img src=\"" + uri + "\" height=\"1\" width=\"1\" ><br>") ;
		pixels.push(uri);

        /*httpGet(uri, function(response)
		{
			$(".pixel-list").append("<b> Response: " + response + "</b>");
		})*/
	}
	download_csv(pixels);

	
	
	
	 
	 

	
	 
	// <button onclick="download_csv()">Download CSV</button> 
	
	
	

	/*Code for producing text file, currently not working*/
	var textFile = null,
  	makeTextFile = function (text) {
    var data = new Blob([text], {type: 'text/plain'});

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    // returns a URL you can use as a href
    return textFile;
	};
	var downloadFile = function downloadURL(url) {
    	var hiddenIFrameID = 'hiddenDownloader',
    	iframe = document.getElementById(hiddenIFrameID);
    	if (iframe === null) {
        	iframe = document.createElement('iframe');
       	 	iframe.id = hiddenIFrameID;
        	iframe.style.display = 'none';
        	document.body.appendChild(iframe);
    	}
    	iframe.src = url;
	}
	console.log(pixels.toString);
	downloadFile(makeTextFile(pixels.toString));
}

function download_csv(arr) {
	var i=0;
	var csv = 'Hotels.com Tags\n';	
	while (i < arr.length) {
			csv += arr[i];
			csv += "\n";
			i++;
	}
	console.log(csv);
	var hiddenElement = document.createElement('a');
	hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv); 
	hiddenElement.target = '_blank';
	hiddenElement.download = 'hotels.csv';
	hiddenElement.click();
};

// function showData(arr) {
// 	console.log(arr.length);
// };