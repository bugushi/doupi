// 页面查询计数
var BroadCastPagecount = 0;
// 是否已经清除加载图标
var hasRemovedLoading = false;

// 个人广播页
if(window.location.href.indexOf('statuses') != -1){
	addBroadcastSearchSection('status');
} else{ // 首页
	addBroadcastSearchSection('all');
	addDoupiTattoo();
}

function addDoupiTattoo(){
	$('.statuses-setting .hd .a_status_setting').css('right','65px');
	$('.statuses-setting .arrow').css('right', '85px');
	$('.statuses-setting .hd').append('<a href="http://www.guyustudio.com/%E8%B1%86%E7%9A%AE/" target="_blank" class="doupi-tattoo">豆皮inuse</a>');
}

// 添加查询区域
function addBroadcastSearchSection(type){
	var searchBox = '<div class="doupi-bd"><input id="db-search-text" placeholder="搜索广播"/><span id="db-search-btn"></span><div class="doupi-border-logo"></div></div>';
	if(type == 'all'){
		$('.notify-mod').before(searchBox);
	} else if(type == 'status'){
		$('.aside').append(searchBox);
	}
	$('#db-search-btn').on('click', function(){
		searchFuncGuide(type);
	});
	$('#db-search-text').on('keypress', function(e){
		if (e.keyCode == 13 ) {
			searchFuncGuide(type);
		}
	});
}

// 根据页面类型确定查询方法
function searchFuncGuide(type){
	if(type=='all'){
		searchBroadCastAll();
	} else if(type=='status'){
		searchBroadCastStatus();
	}
}

// 获取查询值，并清空展示区域
function preSearchBroadCast(){
	var searchText = $.trim($('#db-search-text').val());
	if(searchText==''){return;}
	var loading = chrome.extension.getURL("images/loading.gif");
	//显示加载图标，添加搜索结果权重占位符
	$('.stream-items').empty().append('<div class="doupi-bd-loading"><img src="'+loading+'"/></div>').append('<div id="doupi-bd-holder1"></div><div id="doupi-bd-holder2"></div>');
	$('.paginator').hide();

	hasRemovedLoading = false;

	return searchText;
}

//全部广播按页查询
function searchBroadCastAll(){
	BroadCastPagecount = 40;
	var searchText = preSearchBroadCast();
	for(var i=1; i< 41; i++){
		var url = 'https://www.douban.com/?p=' + i;
		chrome.extension.sendMessage({url:url}, function(response) {
			if(response.search(/captcha-solution/) == -1){
				setSearchResult(searchText, response);
			} else{
				addBroadCastCaptcha(response);
			}
		});
	}
}

//个人广播按页查询
function searchBroadCastStatus(){
	BroadCastPagecount = 100;
	var searchText = preSearchBroadCast();
	for(var i=1; i< 101; i++){
		var url = window.location.href.match(/https.*statuses/i)[0]+ '?p=' + i;
		chrome.extension.sendMessage({url:url}, function(response) {
			if(response.search(/captcha-solution/) == -1){
				setSearchResult(searchText, response);
			} else{
				addBroadCastCaptcha(response);
			}
		});
	}
}

//拉取验证码
function addBroadCastCaptcha(response){
	var captchaForm = $(response).find('.article form');
	$('.stream-items').empty().append(captchaForm);
}

//将搜索结果填充到友邻广播页面
function setSearchResult(searchText, response){
	BroadCastPagecount--;
	var items = $(response).find('.status-item');
	var itemNum = items.length;
	//循环广播条目
	for(var i=0; i<itemNum; i++){
		var searchArray = searchText.split(' ');
		var searchNum = searchArray.length;
		var matchNum = 0; //0 不匹配，1 匹配一项，>=2 多项匹配
		var isFirstParMatch = false; //是否匹配第一个搜索条件
		//循环搜索条件
		for(var j=0; j<searchNum; j++){
			var pattern = new RegExp(searchArray[j], "gi");
			var flag = pattern.test(items[i].innerHTML);
			if(flag){
				matchNum++;
				if(j==0){
					isFirstParMatch = true;
				}
			}
		}
		if(matchNum == 1){
			if(!hasRemovedLoading){
				hasRemovedLoading=true;
				$('.doupi-bd-loading').remove();
			}
			if(isFirstParMatch){
				$('#doupi-bd-holder2').before(items[i]);
			} else{
				$('.stream-items').append(items[i]);
			}
		} else if(matchNum > 1){
			if(!hasRemovedLoading){
				hasRemovedLoading=true;
				$('.doupi-bd-loading').remove();
			}
			$('#doupi-bd-holder1').before(items[i]);
		}
	}

	if(BroadCastPagecount == 0 && $('.stream-items').find('.status-item').length == 0){
		hasRemovedLoading=true;
		$('.doupi-bd-loading').remove();
		$('.stream-items').append('<div><span class="doupi-no-bd">无相关广播 · · ·<span></div>');
	}
}