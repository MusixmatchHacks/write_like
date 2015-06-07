$(document).ready(function() {$('#genre').multiselect(
	{ 
		maxHeight: 150,  enableCaseInsensitiveFiltering: true, buttonClass: 'btn btn-link', disableIfEmpty: true, filterPlaceholder: 'select an artist',
		buttonText: function(options, select) 
					{
		                if (options.length === 0) {
		                    return '';
		                }
		                else if (options.length > 2) {
		                    return options.length + ' selected';
		                }
		                 else {
		                     var labels = [];
		                     options.each(function() {
		                         if ($(this).attr('label') !== undefined) {
		                             labels.push($(this).attr('label'));
		                         }
		                         else {
		                             labels.push($(this).html());
		                         }
		                     });
		                     return labels.join(', ') + ' ';
		                 }
		            }
		
	});
});

searchQuery = document.getElementById('username')
genre_id = document.getElementById('genre')
var language = {}
MakePlaylist = document.getElementById('makePlaylist')
var mxmAPI_base = 'https://api.musixmatch.com/ws/1.1/'
var apiKey = 'd8951a826384c648324e206c942b5cce'
var tagAPI_base = 'http://glacial-hollows-8890.herokuapp.com/lyrics_analysis/v1.0'
var chordAPI_base = 'http://ec2-54-194-213-147.eu-west-1.compute.amazonaws.com/chord_analysis/v1.0/chords?trackID='//'http://ec2-54-194-130-174.eu-west-1.compute.amazonaws.com/chord_analysis/v1.0/chords?trackID='
var chordAPIUrl = 'http://ec2-54-194-213-147.eu-west-1.compute.amazonaws.com/media' //'http://ec2-54-194-130-174.eu-west-1.compute.amazonaws.com/media'
var mxmAPI_base_new = 'http://ec2-54-165-48-238.compute-1.amazonaws.com:8080/ws/1.1/macro.subtitles.get?app_id=musixmatch-rd-v1.0&usertoken=74b62c7030d940b2c0e9d3cc97a42f4bc531e9501479cd9e' //'http://apic.musixmatch.com/ws/1.1/'
var echonest_base = 'http://developer.echonest.com/api/v4/track/profile?api_key='
var echonest_song_base = 'http://developer.echonest.com/api/v4/song/profile?api_key='
var echonest_search_base = 'http://developer.echonest.com/api/v4/song/search?api_key='
var echonest_api_key = 'UUZDTANXIMNN98YW6'
var musicbrainz_base = 'http://musicbrainz.org/ws/2/recording/?query=isrc:'
var spotify_auth_base = 'https://accounts.spotify.com/authorize'
var spotify_client_ID = '14fb55b1df36454793caa07ab8abefe6'
var spotify_client_secret = 'cf72548f86e8493d8aa38cc881a63ee4'
// var duolingoAPI_base = 'http://ec2-23-22-137-12.compute-1.amazonaws.com/duolingoHack/v1.0/'
var duolingoAPI_base = 'http://ec2-23-20-32-78.compute-1.amazonaws.com/duolingoHack/v1.0/'


var have_valid_playlist = false
var username = ''

document.getElementById("genre").innerHTML = ''
genreList = new Array()
for (var i = 0; i < genres["music_genre_list"].length; i++) 
{
	// k = {}
	// k['value'] = genres["music_genre_list"][i]["music_genre"]["music_genre_id"]
	// k['label'] = genres["music_genre_list"][i]["music_genre"]["music_genre_name"]
	document.getElementById("genre").innerHTML += "<option value=" +genres["music_genre_list"][i]["music_genre"]["music_genre_id"] + ">" + genres["music_genre_list"][i]["music_genre"]["music_genre_name"] + "</option>"						
	// genreList.push(k)
};
// nlform = new NLForm( document.getElementById( 'nl-form' ) )
// console.log(genreList)
// console.log($("#genre"))
// $("#genre").autocomplete({source: genreList, messages: { noResults: '',  results: function() {}}})

function getJSON(url) 
{
	var get_promise = $.getJSON(url);
	//console.log(url)
	return get_promise.then(JSON.stringify).then(JSON.parse);
}

function getLyrics(track) 
{
	var lyrics_URI = mxmAPI_base + 'track.lyrics.get?apikey=b463ed1270b71853d56be5bd776a9b4a&track_id=' + track.track.track_id + '&format=jsonp&callback=?'
	lyrics_URI = encodeURI(lyrics_URI)
	// console.log(lyrics_URI)
	//var get_promise = $.getJSON(lyrics_URI);
	//console.log(url)
	
	// console.log(trackWithLyrics)
	return new Promise(function(resolve,reject)
	{
		getJSON(lyrics_URI).then(function(response)
		{
			// console.log(response)
			trackWithLyrics = {}
			trackWithLyrics['lyrics'] = response
			trackWithLyrics['track'] = track.track
			resolve(trackWithLyrics)
		});
	})
		//console.log(url)
		//return getJSON(url);
}


function generatePlaylist(wrds,language_code, leeway) //enter URI which has tracklist to build playlist of related tracks. search_with_words is a flag to accomodate different kind of JSON response structure fetched from the seed_URI
{
	words = new Array()
	lyricWords = new Array()
	// console.log(typeof(language.value[0]))
	lan = language.value[0]
	stpWords = stopwords[(language.value[0]).toLowerCase()]
	// console.log(stopwords)
	genre_id = document.getElementById('genre')
	// console.log(genre_id.value)
	console.log(genre_id.selectedOptions.length)
	var stemmer = new Snowball(language.value[0])

	wrds.forEach(function(word)
	{
		if(stpWords.indexOf(word.toLocaleLowerCase()) == -1)
		{
			// words.push(word.toLocaleLowerCase())
			stemmer.setCurrent(word.toLocaleLowerCase())
			stemmer.stem()
			words.push(stemmer.getCurrent())
		}
	})

	final_playlist_ids = new Array()
	final_playlist_tracks = new Array()
	seed_track_ids = new Array()
	url_list = new Array()
	var repeatFlag = false
	var seed_URI = mxmAPI_base + 'track.search?apikey=b463ed1270b71853d56be5bd776a9b4a&s_track_rating=desc&page_size=100&f_lyrics_language=' + language_code +'&f_music_genre_id=' //genre_id.value +'&format=jsonp&callback=?'
	console.log(typeof(genre_id.selectedOptions))
	
	for (var i = 0; i < genre_id.selectedOptions.length; i++) 
	{
		console.log(genre_id.selectedOptions[i].value)
		url_list.push(encodeURI(seed_URI + genre_id.selectedOptions[i].value +'&format=jsonp&callback=?'))
	}

	// seed_URI = encodeURI(seed_URI)
	console.log(url_list)
	leeway = 60
	playlistLength = 0
	console.log(words)
	console.log(wrds)
	//http://api.musixmatch.com/ws/1.1/track.search?apikey=b463ed1270b71853d56be5bd776a9b4a&f_lyrics_language=it&s_track_rating=desc
	// document.getElementById("progress").style.display = "inline-block"
	// $("#status").text("Searching musixmatch for songs with words in your vocabulary. You have " + wrds.length() + " words in your vocabulary")
	$("#status").text("Your 'current language' on Duolingo is " + language.value[0] + ". Searching tracks with words in your Duolingo vocabulary.")
	return new Promise(function(resolve,reject)
	{
		Promise.all( url_list.map(getJSON)).then(function(responses)
		{
			//console.log(123)
			//console.log(response)
			console.log('here0')
			Promise.all(responses.map(function(response)
			{
					console.log('here1')
					// return new Promise(function(resolve,reject)
					// {
						console.log('here2')
						if (response.message.header.status_code == 200)
						{	
							//console.log(3)
							track_list = response.message.body.track_list
							
							if (track_list.length >=1)
							{
								return Promise.all(track_list.map(getLyrics)).then(function(values)
								{
									// console.log(values)
									console.log(values)
									values.forEach(function(trackObject)
									{
										//console.log(trackObject)
										notFound = 0
										if(trackObject.lyrics.message.header.status_code == 200)
										{
											var lyrics = trackObject.lyrics.message['body'].lyrics.lyrics_body
											// lyrics = lyrics.replace(/↵/g,"")
											// console.log(lyrics.replace(/↵/,''))
											var lyricsP = lyrics.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"") //lyrics.replace('\n',' ')
											var lyricsFinal = lyricsP.replace(/\s{2,}/g," ") //.replace('\t',' ')
											lyricWords = lyricsFinal.replace(/\n/g,' ').split(' ')
											lyricWords.every(function(Word)
											{
												//console.log(Word)
												if(stpWords.indexOf(Word.toLocaleLowerCase()) == -1)
												{
													stemmer.setCurrent(Word.toLocaleLowerCase())
													stemmer.stem()
													// words.push(stemmer.getCurrent())
													if(words.indexOf(stemmer.getCurrent()) == -1)
													{
														notFound = notFound +1
													}
													// console.log(Word)
												}
												if(notFound > leeway)
												{
												// console.log(notFound)
													return false
												}
												if(notFound <= leeway)
												{
													return true
												}
											})
											
											if (notFound <= leeway) 
											{
												// console.log(notFound)
												// console.log(lyricWords)
												// console.log(words)
												playlistLength = playlistLength +1
												final_playlist_ids.push(trackObject.track.track_spotify_id)
												// return true
											}
											// if(notFound > leeway)
											// {
											// 	return false
											// }	
										}
									})	
									// console.log(playlistLength)
							
								})
							}
							else
							{
								console.log('empty genre')
								// resolve('asd')
							}
						}

						// resolve(playlistLength)
						// else
						// {
						// 	reject(Error(response.message))
						// }
						// console.log('here1')
					// })
			})).then(function(){
				console.log('here3')
				resolve(final_playlist_ids)})	
				// console.log('here2')
		})
	})	
}
	
function getUsernameAndLanguage()
{
	var seed_query = duolingoAPI_base + 'languages.get?username=' + searchQuery.value + '&format=jsonp&callback=?'
	seed_query = encodeURI(seed_query)
	username = searchQuery.value
	$("#status").text("Fetching duolingo data")
	// document.getElementById("progress").style.display = "inline-block"
	console.log(seed_query)
	return new Promise(function(resolve,reject)
	{
		getJSON(seed_query).then(function(response){
			console.log(response)
			console.log(response['lang'])
			language['value'] = response['lang']
		
			resolve(language)
			// document.getElementById("genreHolder").style.display = "inline-block"
			// document.getElementById("makePlaylist").style.display = "inline-block"
			// $("#status").text("Your 'current language' on Duolingo is " + language['value'] + ". Please select a genre (or multiple genres with ctrl/cmd) and press ''Make Playlist''")
			// document.getElementById("progress").style.display = "none"
		})
	})
		// console.log(words)
}

function getWordsAndMakePlaylist()
{
	console.log(language)
	var seed_query = duolingoAPI_base + 'words.get?username=' + searchQuery.value + '&language='+ language.value[0] + '&format=jsonp&callback=?'
	seed_query = encodeURI(seed_query)
	username = searchQuery.value
	// $("#status").text("Fetching duolingo data")
	// document.getElementById("progress").style.display = "inline-block"
	console.log(seed_query)
	getJSON(seed_query).then(function(response){
		generatePlaylist(response.words,response.language_code, 10).then(function(track_ids)
		{
			console.log('here4')
			console.log(track_ids)

			if(track_ids.length > 0)
			{
				$("#status").text("Making playlist with the tracks found.")
				// <iframe src="https://embed.spotify.com/?uri=spotify:trackset:PREFEREDTITLE:5Z7ygHQo02SUrFmcgpwsKW,1x6ACsKV4UdWS2FMuPFUiT,4bi73jCM02fMpkI11Lqmfe" frameborder="0" allowtransparency="true"></iframe>
				localStorage.setItem('track_ids', JSON.stringify(track_ids));
				localStorage.setItem('playlist-name', 'Musixmatch-Polyglottis'+'-'+language.value[0])
				var src = "https://embed.spotify.com/?uri=spotify:trackset:"+username+'-'+language.value[0]+ ':'+ track_ids.toString()
				//console.log(src)
				$("#status").text("Done!")
				document.getElementById("SpotifyWidget").style.visibility = "visible"
				$('#SpotifyWidget').empty()
				document.getElementById("SpotifyWidget").innerHTML += '<iframe id = "SpotifyWidgetFrame" frameborder="0" allowtransparency="true" width="373" height="453" style = "display:inline"></iframe>'
				document.getElementById("SpotifyWidgetFrame").src = src
				//console.log(document.getElementById("SpotifyWidget").innerHTML)
				
				have_valid_playlist = true
				// document.getElementById("progress").style.display = "none"
				
				return Promise.resolve()
			}
			else
			{
				$("#status").text("No tracks found. Either your duolingo vocabulary is not large or no songs in the chosen genre. Please select a more popular genre.")
				return Promise.reject()
			}
		}, function(error){
				console.log(error)
				// $("#status").text("No songs found with these search terms. Try again please.")
				return Promise.reject()
			}).then(function()
			{
				//console.log('love')
				//document.getElementById("SpotifySave").disabled = false
				document.getElementById("SpotifySave").style.display = "inline-block"

			})

	})
	
}


$("#username").keyup(function(event) {
    if (event.keyCode == 13) {
    	// myStopFunction();
    	
        // $("#status").text("Please select language for songs in playlist")
        // document.getElementById("progress").style.display = "none"
    }
});
// $("#genre").focus();

$("#user_message").focus(function (){autocomplete_text()})

function generate_display(selected_array)
{
	$('#autocomplete_display').empty()
	urls = new Array()
	var recommendations = $("<div>")
	.attr('id','recommendations')
	// $('#recommendations').hide()
	// $("#autocomplete_display").append(recommendations)

	for (var i = 0; i < selected_array.length; i++) {
		single_autocomplete = $('<div>')
		.addClass('autocomplete_element')
		.attr("data-url", genres['music_genre_list'][selected_array[i]]['music_genre']['url'])
		.css('background-image', 'url(' + genres['music_genre_list'][selected_array[i]]['music_genre']['img'] + ')')

		urls.push(genres['music_genre_list'][selected_array[i]]['music_genre']['url'])
		// $("#autocomplete_display")

		// $("#visualizations").empty()

	
	// $("#visualizations").append("<div id ='seeds' style = 'display:none; text-align:center'></div>")
		// var song = $("<div>")
		// .addClass('seed_tracks')
		// .attr('id', tracks[i]['track'] )
		// .attr('data-audio_file', tracks[i]['audio_link'])
		
		var mask = $("<div>").addClass("button_mask")
		.attr('id','text_' + (selected_array[i]+1))
		// .addClass('vertical_align')
		// var text = $("<p>").addClass("autocomplete_text")
		// .attr('id','text_' + selected_array[i])
		// .text('asdasd')

		// text.html('asdasd asdasd')
		// mask.append('<p>asdasd</p>')
		// var play = $("<div>")
		// .addClass("glyphicon glyphicon-headphones")
		// .addClass("pull-right")
		// // .css('display', "inline-block")
		// .addClass("play_button")
		// .addClass("vertical_align")
		// .attr('data-audio_file', tracks[i]['audio_link'] )
		// .attr('data-temp_id', i )
		
		// play.click(function(){
		// 	play_song(this.getAttribute('data-audio_file'))
		// })
		// mask.append(text)
		// mask.hide()
		single_autocomplete.append(mask)

		$("#autocomplete_display").append(single_autocomplete)
		// $('#recommendations').append(single_autocomplete)
	}
	return urls
}

$('#user_message').change(function(){
	console.log(this.value)
})

function autocomplete_text(){
	// console.log('loda lasun')
	// console.log($("#genre").selectedOptions)
	// console.log(document.getElementById('genre').selectedOptions[0].value)
	// console.log(document.getElementById('genre').selectedOptions[0].text)
	selected_array = new Array()
	url_list = new Array()
	for (var i = 0; i < document.getElementById('genre').selectedOptions.length; i++) {
		selected_array.push(Number(document.getElementById('genre').selectedOptions[i].value) - 1)
		// url_list.push()
	};
	url_list = generate_display(selected_array)

}
function display_response(response)
{
	el = $('#' + response['id'])
	el.empty()
	for (var i = 0; i < response['prediction'].length; i++) {
		k = $('<p>')
		.addClass('autocomplete_text')
		.text(response['prediction'][i][0])
		// Things[i]
		el.append(k)
	};
}

$('#user_message').on('input',function(e){
    console.log((this.value).split(' '))
    // console.log(selected_array)
    // console.log(url_list)
    query_list = new Array()

    u_input = (this.value).split(' ')
    curr = u_input.pop()
    prev = u_input.pop()
    console.log(prev)
    if(typeof curr !='undefined' && curr != '')
    {
    	for (var i = 0; i < url_list.length; i++) 
    	{
    		// if (typeof prev === 'undefined')
    		// {
    		// 	query_list.push(url_list[i]+curr)
    		// }
    		// else
    		// {
    		// 	query_list.push(url_list[i].replace('current_word?q=','current_word_given_previous?previous=') + prev + '&current=' + curr)	
    		// }
			query_list.push(url_list[i]+curr)
    	}
    	console.log(query_list)
    	Promise.all(query_list.map(getJSON)).then(function(responses){
    		// console.log(responses)
    		for (var i = 0; i < responses.length; i++) {
    			// Things[i]
    			 display_response(responses[i])
    		};
    	})
    }



});


// MakePlaylist.onclick = function(e){
	
// 	$('#SpotifyWidget').empty()
// 	document.getElementById("SpotifySave").style.display = "none"
// 	document.getElementById("makePlaylist").style.display = "none"
// 	document.getElementById("status").style.display = "inline-block"
// 	$("#status").text("Searching your vocabulary in this language")
// 	getUsernameAndLanguage().then(function()
// 	{
// 		getWordsAndMakePlaylist();	
// 	});
	
// }

// SpotifySave.onclick = function(e){
//   loginWithSpotify()
// }


// GetImages.onclick = function(e){
// 	getTagsAndImages()
// }

// $(window).blur(function(e){
//     //$('#result').text('Clicked out of the window or on the iframe');
//     console.log('Clicked out of the window or on the iframe')
// })
// SpotifySave.onclick = function(e){
//   loginWithSpotify()
// }