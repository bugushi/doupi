if(window.location.href.indexOf('movie.douban.com/subject/') != -1){
	var movieName = $('#content h1:first span:first').text().trim().split(' ')[0];
	var encodeMovieName = encodeURIComponent(movieName);

	// var acfunApi = 'http://search.acfun.tv/search?cd=1&type=2&q='+encodeMovieName+'&sortType=-1&field=title&parentChannelId=68&sortField=score&pageNo=1&pageSize=10&aiCount=3&spCount=3&isWeb=1';
	// var acfunLink = 'http://www.acfun.tv/search/#query='+encodeMovieName+';page=1;channel=7';
	var bilibiliLink = 'https://search.bilibili.com/pgc?keyword=' + encodeMovieName;
	var youkuLink = 'http://www.soku.com/search_video/q_' + encodeMovieName;


	var acfunHtml = '';
	var bilibiliHtml = '';
	var watchHtml = '<div class="doupi-movie"><span class="pl">在线观看:</span><span id="dp-movie-holder"></span><a href="'+youkuLink+'" id="youkuLink" target="_blank">去优酷</a></div>'
	$('#info').append(watchHtml);

	// checkAcfun();
	checkBilibili();
}

function checkAcfun(){
	chrome.extension.sendMessage({url:acfunApi}, function(response) {
		var jsonData = JSON.parse(response.replace('system.tv=', ''));
		if(jsonData.data.page.totalCount > 0){
			$('#dp-movie-holder').before('<a href="'+acfunLink+'" target="_blank">去Acfun</a> | ');
		}
	});
}

function checkBilibili(){
	chrome.extension.sendMessage({url:bilibiliLink}, function(response) {
		if($(response).find('li.movie-item').length > 0 || $(response).find('li.synthetical').length > 0){
			$('#dp-movie-holder').after('<a href="'+bilibiliLink+'" target="_blank">去bilibili</a> | ');
		}
	});
}