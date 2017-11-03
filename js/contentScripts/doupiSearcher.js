/*
options:{
	placeHolder: '喜欢搜索「豆皮」', 				// 搜索提示
	resultContainer: 'ul.fav-list',	// 查询结果容器
	itemSelector: 'ul.fav-list li',	// 条目dom
}
*/
function doupiSearcher(options){
	this.options = options;
	this.addSearchSection();
}

// 在侧边添加搜索框
doupiSearcher.prototype.addSearchSection = function(){
	var scope = this;
	var searchBox = '<div class="doupi-bd"><input id="db-search-text" placeholder="'+scope.options.placeHolder+'"/><span id="db-search-btn"></span><div class="doupi-border-logo"></div></div>';
	$('.aside').prepend(searchBox);
	$('#db-search-btn').on('click', function(e){
		var keyword = $(e.currentTarget).val().trim();
		if(keyword){
			scope.seachAction(keyword);
		}
	});
	$('#db-search-text').on('keypress', function(e){
		if (e.keyCode == 13 ) {
			var keyword = $(e.currentTarget).val().trim();
			if(keyword){
				scope.seachAction(keyword);
			}
		}
	});
};

// 搜索操作
doupiSearcher.prototype.seachAction = function(keyword){
	var scope = this;

	//清空显示区域，显示加载图标
	$(scope.options.resultContainer).empty();
	$('.paginator').remove();
	var loading = chrome.extension.getURL("images/loading.gif");
	$(scope.options.resultContainer).append('<div class="doupi-bd-loading"><img src="'+loading+'"/></div>');

	// 搜索内容
	var currentUrl = window.location.href;
	chrome.extension.sendMessage({url:currentUrl}, function(response) {
		scope.handlePage(response, keyword);
	});
};

// 处理分页搜索结果
doupiSearcher.prototype.handlePage = function(response, keyword){
	var scope = this;
	var $response = $(response);
	var pattern = new RegExp(keyword, "gi");

	// 判断是否出了验证码
	if($response.find('.article form').length == 0){
		$response.find(scope.options.itemSelector).each(function(index, element){
			var hasKeyWord = pattern.test($(element).text());
			if(hasKeyWord){
				$(scope.options.resultContainer).append(element);
			}
		});
	} else{
		$(scope.options.resultContainer).prepend($response.find('.article form'));
		$('.doupi-bd-loading').remove();
		return;
	}

	// 如果「下一页」可点击，则继续查询
	var nextPageLink = $response.find('.paginator .next a');
	if(nextPageLink.length > 0){
		var nextPageUrl = nextPageLink[0].href;
		chrome.extension.sendMessage({url:nextPageUrl}, function(response){
			scope.handlePage(response, keyword);
		});
	} else{
		$('.doupi-bd-loading').remove();
		if($(scope.options.itemSelector).length == 0){
			$(scope.options.resultContainer).append('<div><span class="doupi-no-bd">未搜索到结果╮(╯︿╰)╭ <span></div>');
		}
	}
};

