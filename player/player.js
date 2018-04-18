var stepped = 0,
    chunks = 0,
    rows = 0;
var start, end;
var parser;
var pauseChecked = false;
var printStepChecked = false;
var uri;
var selection = [];
var columns = [];



$(function() {
    $('#submit-parse').click(function() {
 
// debugger
var formvalu = function(){
		
		var ob = columns //[cat_1,cat_2,cat_3];
		getFormText(ob);
	
	function getFormText(e){
	for (var i = 0; i < ob.length; i++) {
		var values = ob[i].options[ob[i].selectedIndex].text; 
		selection.push(values);

	}
	console.log(selection); //selection will be used to build out the main pixel attributes

		// var oid_text = oid_col.options[oid_col.selectedIndex].text;
		// var cid_text = cid_col.options[oid_col.selectedIndex].text;
		// var type_text = cid_col.options[oid_col.selectedIndex].text;
		// var amt_text = cid_col.options[oid_col.selectedIndex].text;

		//  alert(oid_text,cid_text,type_text,amt_text);
	};



}()

        stepped = 0;
        chunks = 0;
        rows = 0;

        
        var txt = $('#input').val();
        var localChunkSize = $('#localChunkSize').val();
        var remoteChunkSize = $('#remoteChunkSize').val();
        var files = $('#files')[0].files;
        var config = buildConfig();
        console.log(config);





        // NOTE: Chunk size does not get reset if changed and then set back to empty/default value
        if (localChunkSize)
            Papa.LocalChunkSize = localChunkSize;
        if (remoteChunkSize)
            Papa.RemoteChunkSize = remoteChunkSize;

        pauseChecked = $('#step-pause').prop('checked');
        printStepChecked = $('#print-steps').prop('checked');

        
        if (files.length > 0) {
            if (!$('#stream').prop('checked') && !$('#chunk').prop('checked')) {
                for (var i = 0; i < files.length; i++) {
                    if (files[i].size > 1024 * 1024 * 10) {
                        alert("A file you've selected is larger than 10 MB; please choose to stream or chunk the input to prevent the browser from crashing.");
                        return;
                    }
                }
            }


            start = performance.now();

            $('#files').parse({
                config: config,
                before: function(file, inputElem) {
                    console.log("Parsing file:", file);
                },
                complete: function() {
                    console.log("Done with all files.");
                }
            });
        } else {
            start = performance.now();
            var results = Papa.parse(txt, config);
            console.log("Synchronous parse results:", results);
        }
    });

    $('#submit-unparse').click(function() {
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

    $('#insert-tab').click(function() {
        $('#delimiter').val('\t');
    });

    $('#files').change(function() {


        var file = event.target.files[0];
        var reader = new FileReader();
        reader.onload = function(event) {
            var a;
            var text = reader.result;
            var firstLine = text.split('\n').shift();
            var columns = firstLine.split(',');
        
            console.log(firstLine);
            console.log(columns);
            var lines = text.split('\n');
            lines.splice(0, 1);
            var newtext = lines.join('\n');
            var secLine = newtext.split('\n').shift();
            var lines2 = newtext.split('\n');
            lines2.splice(0, 1);
            var newnewtext = lines2.join('\n');
            var thirdLine = newnewtext.split('\n').shift();
            document.getElementById('filePrev').value = (firstLine + "\n" + secLine + "\n" + thirdLine);


            function addOption(selectbox, text, value) {
                
                var optn = document.createElement("OPTION");
                optn.text = text;
                optn.value = value;
                selectbox.options.add(optn);
            }

            function addOption_list(selectbox) {
               
                var month = columns;
                var box = selectbox;

                for (var i = 0; i < month.length; ++i) {
                    addOption(box, month[i], month[i]);
                }

            }
             
           
            var dropDown = [tag_form.cat_1,tag_form.cat_2, tag_form.cat_3];
            for (var i = 0; i <= dropDown.length -1; i++) {
            	
            	addOption_list(dropDown[i]);
            }

//             $(function(){

	
// 	$('#pre_sub').click(function() {


		
// 		var e = document.getElementById(dropdown[0]);
// 		var text = e.options[e.selectedIndex].text;
		

		

// 	 // for (var i = 0; i < dropDown.length; i++) {
// 	 // 	console.log(dropDown[i]);
// 	 // }

// 	 console.log("hi");

// 	});
// })
            
           
        };

        reader.readAsText(file);



    });

});

function buildConfig() {
    return {
        delimiter: $('#delimiter').val(),
        newline: getLineEnding(),
        header: true, // disregard the input; we always want headers, at least for this custom branch
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

    function getLineEnding() {
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

/*Currently not using this function as cross-domain requests 
 * are not accepted via browser. Leaving in case this is ported
 * to a server-side API 
 */
function httpGet(s2sUri, callback) {
    var xmlHttp = new XMLHttpRequest();
    var queryString = s2sUri.substring(s2sUri.indexOf("?") + 1);
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        {
            callback(xmlHttp.responseText, queryString);
        }
 /*        else
        {
            callback("S2S Call Failed" + (xmlHttp.responseText ? " - " + xmlHttp.responseText : ""), queryString);
        } */
    }
    xmlHttp.open("GET", s2sUri, true);
    xmlHttp.send(null);
}

function stepFn(results, parserHandle) {
    stepped++;
    rows += results.data.length;

    parser = parserHandle;

    if (pauseChecked) {
        console.log(results, results.data[0]);
        parserHandle.pause();
        return;
    }

    if (printStepChecked)
        console.log(results, results.data[0]);
}

function chunkFn(results, streamer, file) {
    if (!results)
        return;
    chunks++;
    rows += results.data.length;

    parser = streamer;

    if (printStepChecked)
        console.log("Chunk data:", results.data.length, results);

    if (pauseChecked) {
        console.log("Pausing; " + results.data.length + " rows in chunk; file:", file);
        streamer.pause();
        return;
    }
}

function errorFn(error, file) {
    console.log("ERROR:", error, file);
}

function constructPixels(data) { 
	// console.log(selection);
    var previewPixels = $('#preview-pixels').prop('checked');
    var fireZePixels = $('#fire-ze-pixels').prop('checked');
    var pRes = data; 
    var pixels = [];
     
    columns = pRes;
    var uriPrefix = "https://www.emjcd.com/u?cid=1501378&type=400523"; //custom for Hotels.com

    // console.log("line 190 " + pRes.length);
    console.log(columns);
    
    /* This uri is customized for a specific file provided by
     * Hotels.com and will not work for any other file. What 
     * should be the same regardless of advertiser is the presence
     * of the cjevent parameter and METHOD=S2S
     */
    for (i = 0; i < pRes.length; i++) {
        uri = "";
        uri += uriPrefix;
        uri += "&oid=" + pRes[i]['OID'] + "&amount=" + pRes[i]['Sale Amount'] + "&check_in_date=" +  pRes[i]['CHECKIN'] 
        + "&check_out_date=" +  pRes[i]['CHECKOUT'] + "&country=" +  pRes[i]['POSA'] + "&wr_earned=" +  pRes[i]['WR_EARNED'] + "&CURRENCY=" 
        +  pRes[i]['CURRENCY_POSA'] + (pRes[i]['COUPON'] == "" || pRes[i]['COUPON'] == "UNDEFINED" ? "" : "&coupon=" +  pRes[i]['COUPON']) 
        + "&property_id=" +  pRes[i]['SUPPLIER_PROPERTY_ID'] + "&payment_model=" +  pRes[i]['PAYMENT_MODEL'] + "&cjevent=" +  pRes[i]['EVENT ID'] 
        + "&METHOD=S2S";
        pixels.push(uri);
    }

    console.log(pixels);

    if (previewPixels) {
        $(".pixel-preview").append("<p><b>Total Pixels: " + pixels.length + "</p></p>")
        $(".pixel-preview").append("<p><b>Sampling of query strings from up to 10 random pixels</b></p>");
        if (pixels.length < 10) {
            for (i = 0; i < pixels.length; i++) {
                $(".pixel-preview").append("<p>" + pixels[i].substring(pixels[i].indexOf("?") + 1) + "</p>");
            }
        }
        else {
            var usedIndices = [];
            var r = 0;
            for (i = 0; i < 10; i++) {
                if (usedIndices.length == 0 && r == 0) {
                    r = Math.floor(Math.random() * pixels.length);
                    $(".pixel-preview").append("<p>" + pixels[r].substring(pixels[r].indexOf("?") + 1) + "</p>");
                    usedIndices.push[r];
                }
                else {
                    r = Math.floor(Math.random() * pixels.length);
                    if (usedIndices[r]) {
                        i--
                    }
                    else {
                        $(".pixel-preview").append("<p>" + pixels[r].substring(pixels[r].indexOf("?") + 1) + "</p>");
                        usedIndices.push[r];
                    }
                }

            }

        }
    }

/*  This function would be called by the httpGet function to handle the callback. 
 *  However, cross-domain requests are not allowed by the remote server via a browser,
 *  so this code is not presently being used. However, if this is ever ported to a server-side
 *  api, this function could ostensibly be used. 
 */
    function pixelCallback(responseText, queryString) {
        console.log("S2S Response: " + responseText + " | query string: " + queryString);
        $(".pixel-list").append("<p><b> QUERY STRING: " + queryString + " RESPONSE: " + responseText + "</p></b>")
    }

    if (fireZePixels) {
        $(".pixel-list").append("<p><b>Query Strings from the fired pixel(s)</p>");
        for (i = 0; i < pixels.length; i++) {
            $(".pixel-list").append("<img src=\"" + pixels[i] + "\" height=\"1\" width=\"1\" ><br>");
            $(".pixel-list").append("<p>" + pixels[i].substring(pixels[i].indexOf("?")+1) + "</p>");

           //httpGet(pixels[i], pixelCallback); // see block comment above
        }
    }
        downloadCsv(pixels);
}

function completeFn() {
    console.log(arguments[0].data[0])
    end = performance.now();
    if (!$('#stream').prop('checked') &&
        !$('#chunk').prop('checked') &&
        arguments[0] &&
        arguments[0].data)
        rows = arguments[0].data.length - 1;

    console.log("Finished input (async). Time:", end - start, arguments);
    console.log("Rows:", rows, "Stepped:", stepped, "Chunks:", chunks);

    var headers = arguments[0].data[0];


    function updateParams() {
        for (var i = 0; i < headers.length; i++) {
            //console.log(headers[i]);
            var oid1 = $('#oid1');


        }
    };
    updateParams();

    function replaceColumnName(argument) {
    	var columnName = [box1, box2, box3, box4];
    	for (var i = 0; i < columnName.length; i++) {
    		if (columnName[i] != null){
    			console.log(columnName);
    		}
    	}
    }

    function myFunction(){
    	
    	console.log("hello")
    }

    constructPixels(arguments[0].data); //pass in selection later

}


/* Not working - csv is being created but nothing downloads - no errors either
 */
function downloadCsv(arr) {
    console.log("Hey we're supposed to be downloading a csv here... ");
    var i = 0;
    var csv = 'Hotels.com Tags\n';
    while (i < arr.length) {
        csv += arr[i];
        csv += "\n";
        i++;
    }
    var hiddenElement = document.createElement('csvDownload');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        hiddenElement.target = '_blank';
        hiddenElement.download = 'pixel_list_' + new Date().toDateString + '.csv';
        hiddenElement.click();

        // var hiddenElement = document.createElement('csvDownload');
        // hiddenElement.setAttribute('href','data:text/csv;charset=utf-8,' + encodeURI(csv));
        // hiddenElement.setAttribute('download', 'pixel_list_' + new Date().toDateString + '.csv');
        // // console.log("CSV? " + csv)
        // // hiddenElement.download = 'pixel_list_' + new Date().toDateString + '.csv';
        // hiddenElement.style.display - 'none';
        // document.body.appendChild(hiddenElement);
        // hiddenElement.click();
        // document.body.removeChild(hiddenElement);
}
