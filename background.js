chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
	if(request.url){
		var xhr = new XMLHttpRequest();
		xhr.open("GET", request.url, true);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {							
				sendResponse(xhr.responseText);
			}
		}
		xhr.send();
		return true;
	}
	if(request.loop != null){
		fmTab = sender.tab.id;
		loop = request.loop;
		isLooping = request.isLooping;
	}
});

chrome.contextMenus.create({"title":"推荐到豆瓣", "onclick":recommend});

function recommend(info, tab){
	var url = 'http://www.douban.com/recommend/?url=' + encodeURIComponent(info.pageUrl) + '&title=' + encodeURIComponent(tab.title) + '&v=1';
	window.open(url,'douban','toolbar=0,resizable=1,scrollbars=yes,status=1,width=500,height=300,top='+(window.screen.availHeight-480)/2+',left='+(window.screen.availWidth-500)/2);
}