// 喜欢
var likesPattern = /https:\/\/www\.douban\.com\/people\/\w+\/likes*/;
if(likesPattern.test(window.location.href)){
	new doupiSearcher({
		placeHolder: '搜索「喜欢」',
		resultContainer: 'ul.fav-list',
		itemSelector: 'ul.fav-list li'
	});
}

// 我的关注和被关注
var relationPattern = /https:\/\/www\.douban\.com\/contacts\/rlist*/;
if(relationPattern.test(window.location.href)){
	new doupiSearcher({
		placeHolder: '搜索关注我的人',
		resultContainer: '#content ul.user-list',
		itemSelector: '#content ul.user-list>li'
	});
}

// 他人的关注和被关注
var relationPattern = /https:\/\/www\.douban\.com\/people\/\w+\/contacts*/;
var revRelationPattern = /https:\/\/www\.douban\.com\/people\/\w+\/rev_contacts*/;
if(relationPattern.test(window.location.href) || revRelationPattern.test(window.location.href)){
	$('#db-usr-profile').remove().insertBefore('#content .article');
	new doupiSearcher({
		placeHolder: '搜索TA的联系人',
		resultContainer: '#content .article',
		itemSelector: '#content .article .obu'
	});
}

// 看过和想看的电影
var movieCollectPattern = /https:\/\/movie\.douban\.com\/people\/\w+\/collect*/;
var movieCollectPatternDefault = /https:\/\/movie\.douban\.com\/mine\?status\=collect*/;
var movieWishPattern = /https:\/\/movie\.douban\.com\/people\/\w+\/wish*/;
var movieWishPatternDefault = /https:\/\/movie\.douban\.com\/mine\?status\=wish*/;
if(movieCollectPattern.test(window.location.href) || movieCollectPatternDefault.test(window.location.href)){
	new doupiSearcher({
		placeHolder: '搜索「看过的电影」',
		resultContainer: '#content .article .grid-view',
		itemSelector: '#content .article .grid-view .item'
	});
}
if(movieWishPattern.test(window.location.href) || movieWishPatternDefault.test(window.location.href)){
	new doupiSearcher({
		placeHolder: '搜索「想看的电影」',
		resultContainer: '#content .article .grid-view',
		itemSelector: '#content .article .grid-view .item'
	});
}

// 看过和想看的书
var bookCollectPattern = /https:\/\/book\.douban\.com\/people\/\w+\/collect*/;
var bookCollectPatternDefault = /https:\/\/book\.douban\.com\/mine\?status\=collect*/;
var bookWishPattern = /https:\/\/book\.douban\.com\/people\/\w+\/wish*/;
var bookWishPatternDefault = /https:\/\/book\.douban\.com\/mine\?status\=wish*/;
if(bookCollectPattern.test(window.location.href) || bookCollectPatternDefault.test(window.location.href)){
	new doupiSearcher({
		placeHolder: '搜索「读过的书」',
		resultContainer: '#content .interest-list',
		itemSelector: '#content .interest-list .subject-item'
	});
}
if(bookWishPattern.test(window.location.href) || bookWishPatternDefault.test(window.location.href)){
	new doupiSearcher({
		placeHolder: '搜索「想读的书」',
		resultContainer: '#content .interest-list',
		itemSelector: '#content .interest-list .subject-item'
	});
}