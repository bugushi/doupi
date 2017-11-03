var urlPatt = /https:\/\/www\.douban\.com\/people\/\w+\/notes*/;

if(urlPatt.test(window.location.href)){
	//用户名
	var noteUserName = getUserName();
	// 页面查询计数
	var notePagecount = 0;
	//是否已经展示验证码验证
	var noteCaptureShowed = false;
	//已经查询出符合搜索条件的日记数
	var fitNoteCount = 0;
	//存储临时日记列表dom
	$('body').append('<section id="noteDom" style="display:none;"></section>');

	addNoteSearchSection();
}


//获取用户名
function getUserName(){
	var url = window.location.href;
	var urlLength = url.length;
	var notesPosition = url.indexOf('/notes');
	var preUrl = 'https://www.douban.com/people/';
	return url.substring(0, notesPosition).replace(preUrl, '');
}

// 添加查询区域
function addNoteSearchSection(){
	var searchBox = '<div class="doupi-bd"><input id="db-search-text" placeholder="搜索「日记」"/><span id="db-search-btn"></span><div class="doupi-border-logo"></div></div>';
	$('.aside').prepend(searchBox);
	$('#db-search-btn').on('click', function(){
		searchPageNote();
	});
	$('#db-search-text').on('keypress', function(e){
		if (e.keyCode == 13 ) {
			searchPageNote();
		}
	});
}

//按页搜索日记
function searchPageNote(){
	var searchText = preSearchNote();
	for(var i=0; i< 30; i++){
		var url = 'https://www.douban.com/people/' + noteUserName + '/notes?start=' + i*10;
		chrome.extension.sendMessage({url:url}, function(response) {
			searchSingleNote(searchText, response);
		});
	}
}

// 获取查询值，并清空展示区域
function preSearchNote(){
	var searchText = $.trim($('#db-search-text').val());
	if(searchText==''){return;}
	var loading = chrome.extension.getURL("images/loading.gif");
	//显示加载图标，添加搜索结果权重占位符
	$('#db-usr-profile').siblings().remove();
	$('#db-usr-profile').after('<div class="doupi-bd-loading"><img src="'+loading+'"/></div>');
	//全局变量初始化
	notePagecount = 0;
	noteCaptureShowed = false;
	fitNoteCount = 0;

	return searchText;
}

//查询单篇日志
function searchSingleNote(searchText, noteList){
	var notesSection = $(noteList).find('.article>div').filter(function(index){
		return this.id.indexOf('note-') != -1;
	});

	$('#noteDom').append(notesSection);
	notePagecount += notesSection.length;

	$.each(notesSection, function(index, element){
		//单篇日志地址
		var url = $(element).find('h3>a').attr('href');
		chrome.extension.sendMessage({url:url}, function(response) {
			if(response.search(/captcha-solution/) == -1){
				setNoteSearchResult(searchText, response);
			} else{
				if(!noteCaptureShowed){
					addNoteCaptcha(response);
					noteCaptureShowed = true;
				} else{
					return;
				}
			}
		});
	});

}

//拉取验证码
function addBroadCastCaptcha(response){
	var captchaForm = $(response).find('.article form');
	$('.article').append(captchaForm);
}


//展示搜索结果
function setNoteSearchResult(searchText, notePage){
	//查询是否包含关键词
	var noteId;
	var note = $(notePage).find('.article>div').filter(function(index){
		if(this.id.indexOf('note-') != -1){
			noteId = this.id;
		}
		return this.id.indexOf('note-') != -1;
	});

	var pattern = new RegExp(searchText, "gi");
	var flag = pattern.test(note[0].innerHTML);
	console.log(noteId + '<===========>' + flag);

	//填充日志
	if(flag){
		var singleDom = $('#noteDom').find('#'+noteId);
		$('.article').append(singleDom);
		fitNoteCount++;
	}

	//善后
	notePagecount--;
	if(notePagecount == 0){
		$('.doupi-bd-loading').remove();
		if(fitNoteCount == 0){
			$('.article').append('<div><span class="doupi-no-bd">无包含此内容的日记╮(╯︿╰)╭ <span></div>');
		}
	}
}

