var groupId,    // 小组ID
    groupSetting = util.getLocalStorage('doupi-group'), // 豆瓣小组本地配置
    currGroupSetting, // 当前小组配置
    settingPanelClass = '', // 是否显示settingPanel
    groupPattern = /https:\/\/www\.douban\.com\/group\/*/,
    groupPagePattern = /https:\/\/www\.douban\.com\/group\/\w+\/discussion*/,
    topicPattern = /https:\/\/www\.douban\.com\/group\/topic\/*/;

moment.locale('zh-cn');

// 如果在帖子列表页, 非小组首页
if(groupPagePattern.test(window.location.href)){
    $('body').addClass('doupi-group');
    // 给默认排序列表的作者栏增加屏蔽按钮
    $('table.olt td.title').each(function(){
        $(this).next().addClass('creator').append('<a href="javascript:;" class="ban" title="屏蔽此人"><i class="iconfont icon-ban"></i></a>');
    });

    // 如果还没有获取本地配置
    if(!currGroupSetting){
        groupId = $('.aside .group-item .info .title a').attr('href').split('/')[4];
        if(!groupSetting[groupId]){
            groupSetting[groupId] = {};
        }
        currGroupSetting = groupSetting[groupId];
    }

    // 根据本地配置屏蔽用户
    if(currGroupSetting.banList && currGroupSetting.banList.length > 0){
        banUser(currGroupSetting.banList);
    }
}

// 如果在小组首页
if(groupPattern.test(window.location.href) && window.location.pathname.split('/')[2] != 'explore' && $('li.feed-link').length > 0){
    groupId = window.location.pathname.split('/')[2] || null;

    // 读取本地设置
    if(groupSetting){
        settingPanelClass = groupSetting.showSettingPanel ? '' : 'closed';
    } else{
        groupSetting = {showSettingPanel: 1};
        localStorage.setItem('doupi-group', JSON.stringify(groupSetting));
    }

    // 准备小组设置DOM
    $('body').addClass('doupi-group');
    $('#group-new-topic-bar .topic-tab').append('<i>/ </i><a class="toggleSettings '+ settingPanelClass +'" href="javascript:;">豆皮小组扩展</a>');
    $('#group-new-topic-bar').append('<section class="group-settings '+ settingPanelClass +'"><ul>'+
        '<li class="sort clearfix">'+
            '<label for="sortByPublishedTime">按发帖时间排序（近两日）</label>'+
            '<div class="doupi-radio"><input type="checkbox" id="sortByPublishedTime" >'+
                '<label for="sortByPublishedTime"></label>'+
            '</div></li>'+
        '<li class="ban-list clearfix">'+
            '<label>被屏蔽的用户</label>'+
            '<ul class="users clearfix"></ul></li></ul>'+
    '<div class="arrow"></div><div class="doupi-border-logo-re"></div></section>');

    // 获得当前小组设置
    if(!groupSetting[groupId]){
        groupSetting[groupId] = {};
    }
    currGroupSetting = groupSetting[groupId];

    // 根据本地配置选中排序按钮
    if(currGroupSetting.sort){
        $('#sortByPublishedTime').prop('checked', true);
        handleSort();
    }

    // 给默认排序列表的作者栏增加屏蔽按钮
    $('table.olt td.title').each(function(){
        $(this).next().addClass('creator').append('<a href="javascript:;" class="ban" title="屏蔽此人"><i class="iconfont icon-ban"></i></a>');
    });

    // 根据本地配置屏蔽用户, 显示被屏蔽用户列表
    if(currGroupSetting.banList && currGroupSetting.banList.length > 0){
        banUser(currGroupSetting.banList);
        genBanListSettingDom();
    }

    // 控制settingPanel的显示隐藏
    $('.toggleSettings').on('click', function(){
        $(this).toggleClass('closed');
        if($(this).hasClass('closed')){
            $('.group-settings').hide();
            groupSetting.showSettingPanel = 0;
        } else{
            $('.group-settings').show();
            groupSetting.showSettingPanel = 1;
        }
        localStorage.setItem('doupi-group', JSON.stringify(groupSetting));
    });

    // 按发帖时间排序
    $('#sortByPublishedTime').on('change', function(){
        if($(this).prop('checked')){
            currGroupSetting.sort = 1;
            handleSort();
        } else{
            currGroupSetting.sort = 0;
            handleNormal();
        }
        groupSetting[groupId] = currGroupSetting;
        localStorage.setItem('doupi-group', JSON.stringify(groupSetting));
    });

    // 撤销屏蔽
    $('.ban-list .users').on('click', '.icon-close', function(){
        var nick = $(this).parent().text().trim();

        currGroupSetting.banList = _.without(currGroupSetting.banList, nick);
        groupSetting[groupId] = currGroupSetting;
        localStorage.setItem('doupi-group', JSON.stringify(groupSetting));

        banUser(currGroupSetting.banList);
        genBanListSettingDom();
    })
}

// 如果在帖子页
if(topicPattern.test(window.location.href)){
    groupId = $('.aside .group-item .info .title a').attr('href').split('/')[4];

    // 填写默认设置
    if(!groupSetting){
        groupSetting = {showSettingPanel: 1};
        localStorage.setItem('doupi-group', JSON.stringify(groupSetting));
    }

    // 获得当前小组设置
    if(!groupSetting[groupId]){
        groupSetting[groupId] = {};
    }
    currGroupSetting = groupSetting[groupId];

    // 添加DOM
    $('body').addClass('doupi-topic');
    $('.sns-bar-fav').append('<a class="ban" href="javascript:;"><i class="iconfont icon-ban"></i><div class="doupi-border-logo"></div>屏蔽此人</a>');
}

// 屏蔽按钮点击事件
$('.doupi-group, .doupi-topic').on('click', '.ban', function(){

    var creator;
    // 帖子列表页
    if(groupPattern.test(window.location.href) && $('li.feed-link').length > 0){
        if($('.sorted').length > 0){
            creator = $(this).closest('.creator').text().trim();
        } else{
            creator = $(this).closest('.creator').find('a:first').text().trim();
        }
    }
    else if(groupPagePattern.test(window.location.href)){
        creator = $(this).closest('.creator').find('a:first').text().trim();
    }
    // 帖子页
    else if(topicPattern.test(window.location.href)){
        creator = $('.topic-doc .from a').text().trim();
    } else{
        return;
    }

    if(!creator){
        return;
    }

    var banList = currGroupSetting.banList;
    if(banList){
        currGroupSetting.banList = _.union(banList, [creator]);
    } else{
        currGroupSetting.banList = [creator];
    }
    groupSetting[groupId] = currGroupSetting;
    localStorage.setItem('doupi-group', JSON.stringify(groupSetting));

    banUser(currGroupSetting.banList);

    if(groupPattern.test(window.location.href) && $('li.feed-link').length > 0){
        genBanListSettingDom();
    }

    if(topicPattern.test(window.location.href)){
        window.close();
    }
});

// 选中排序的handle函数
function handleSort(){
    var rss = $('li.feed-link a').attr('href');

    $('table.olt').hide();
    $('.group-topics-more').hide();

    if($('table.olt.sorted').length > 0){
        $('table.olt.sorted').show();
    } else{
        util.showLoading('#group-new-topic-bar', 'after', '抓取中...  根据新帖数量多寡可能耗时10秒左右，请稍待');
        $.get(rss, function(data){
            // console.log($(data).find('rss channel item'));
            var table = $('<table class="olt sorted"><tr class="th"><td>话题</td><td>作者</td align="right"><td>发布时间</td></tr></table>');
            $(data).find('rss channel item').each(function(index){
                var title = $(this).find('title').text().split('(')[0],
                    link = $(this).find('link').text(),
                    pubDate = moment.utc($(this).find('pubDate').text()).fromNow(),
                    creator = $(this).find('dc\\:creator, creator').text();

                var tr = '<tr><td class="title"><a href="'+ link +'">'+ title +'</a></td nowrap="nowrap">'
                    +'<td class="creator">'+creator+'<a href="javascript:;" class="ban" title="屏蔽此人"><i class="iconfont icon-ban"></i></a></td>'
                    +'<td nowrap="nowrap">'+ pubDate +'</td></tr>';
                table.append(tr);
            });
            table.insertAfter('#group-new-topic-bar');
            util.removeLoading();

            if(currGroupSetting.banList){
                banUser(currGroupSetting.banList);
            }
        })
    }
}

// 切换到原始不排序状态
function handleNormal(){
    $('table.olt').show();
    $('table.olt.sorted').hide();
    $('.group-topics-more').show();
}

// 屏蔽用户UI反应
function banUser(banList){
    $('table.olt tr').each(function(index){
        var creator = $(this).find('.creator a:first').text().trim();
        if($('.sorted').length > 0){
            creator = $(this).find('.creator').text().trim();
        }
        if(_.includes(banList, creator)){
            $(this).hide();
        } else{
            $(this).show();
        }
    });
}

function genBanListSettingDom(){
    if(currGroupSetting.banList && currGroupSetting.banList.length > 0){
        var banListHtml = '';
        _.forEach(currGroupSetting.banList, function(nick){
            banListHtml += '<li><a href="javascript:;" class="iconfont icon-close"></a>'+ nick +'</li>';
        })
        $('.ban-list .users').html(banListHtml);
        $('.ban-list').show();
    } else{
        $('.ban-list').hide();
    }
}
