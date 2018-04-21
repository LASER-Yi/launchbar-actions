// LaunchBar Action Script

/*Enter your you-get dir here */
var yg_dir = '/usr/local/anaconda3/bin/you-get';
var http_proxy_addr = '127.0.0.1:1085';

function run() {
    LaunchBar.openURL('https://github.com/soimort/you-get');
}

function runWithString(string) {
    var url_checker = /^(?:([a-zA-z]+):)(?:\/{0,3})/;
    if (!url_checker.test(string)) {
        return [{
            title: 'Incorrect URL',
            url: string
        }]
    }
    var use_proxy = false;
    if (LaunchBar.options.shiftKey) {
        use_proxy = true;
    }
    return json_dump(list_downloadable_url(string, use_proxy), use_proxy);
}

function list_downloadable_url(ori_link, is_proxy) {
    try {
        //get json download information(String)
        var ret_json;
        if (is_proxy) {
            ret_json = LaunchBar.execute(yg_dir, ori_link, '--json', '-x', http_proxy_addr);
        } else {
            ret_json = LaunchBar.execute(yg_dir, ori_link, '--json');
        }
        //delete front and end string
        ret_json = ret_json.replace(/^([^\{]*)/, '').replace(/([^\}]*)$/, '');
    } catch (error) {
        throw new Error("Please setup this action")
    }
    //Try to covert return string to json format
    try {
        var data = JSON.parse(ret_json);
    } catch (error) {
        throw new Error("'you-get' doesn't support this link.");
    }
    return data;
}

function json_dump(data, is_proxy) {
    //Push json info to launchbar
    let result = [];
    //Push website title
    result.push({
        icon: "web_icon.png",
        title: data.title,
        subtitle: data.site,
        url: data.url,
        badge: is_proxy ? "Proxy" : "Direct"
    })
    //Push every result in json
    for (const _url in data.streams) {
        let video_url = [];
        if (data.streams[_url].src) {
            //Push every url in json to single block(src)
            for (let index = 0; index < data.streams[_url].src.length; index++) {
                video_url.push({
                    url: data.streams[_url].src[index],
                    badge: (index + 1).toString()
                })
            }
        } else {
            //Push Url
            video_url.push({
                url: data.streams[_url].url,
                badge: "1"
            })
        }
        //Push main block
        result.push({
            children: video_url,
            icon: "video_icon.png",
            title: data.streams[_url].container.toUpperCase(),
            subtitle: data.streams[_url].quality ? data.streams[_url].quality : _url,
            label: (data.streams[_url].size / 1048576.0).toFixed(2).toString() + " MB",
            badge: data.streams[_url].src ? data.streams[_url].src.length.toString() : "1",
            action: 'start_download',
            actionArgument: {
                tag: _url,
                src: data.url,
                proxy: is_proxy
            }
        })
    }
    return result;
}

function start_download(info_json) {
    let ter_command = "you-get" + " " + "--itag=" + info_json.tag + " " + info_json.src + " -o ~/downloads";
    if (info_json.proxy === true) {
        ter_command += " " + http_proxy_addr;
    }
    LaunchBar.performAction("Run Terminal Command", ter_command);
}