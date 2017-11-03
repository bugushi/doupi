var util = (function util(){
    var loading = chrome.extension.getURL("images/loading.gif");

    return {
        // 获取localStorage对象
        getLocalStorage: function getLocalStorage(name){
            var lsItem = localStorage.getItem(name);
            if(lsItem){
                return JSON.parse(lsItem);
            }
            return null;
        },
        // 扩展localStorage
        assignLocalStorage: function setLocalStorage(name, options){
            var lsItem = this.getLocalStorage(name);
            if(lsItem){
                var temp = _.assign(lsItem, options);
                localStorage.setItem(name, JSON.stringify(temp));
            } else{
                localStorage.setItem(name, JSON.stringify(options));
            }
        },
        // 显示loading
        showLoading: function showLoading(selector, position, text){
            var loadingDom = $('<div class="doupi-bd-loading"><img src="'+loading+'"/><div class="desc">'+ text +'</div></div>');
            switch(position){
                case 'before':
                    loadingDom.insertBefore(selector);
                    break;
                case 'inner':
                    loadingDom.appendTo(selector);
                    break;
                case 'after':
                    loadingDom.insertAfter(selector);
                    break;
            }
        },
        // 移除loading
        removeLoading: function removeLoading(){
            $('.doupi-bd-loading').remove();
        }
    }
})();