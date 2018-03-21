// LaunchBar Action Script

function runWithString(string)
{
    var url_checker = /^(?:([a-zA-z]+):)(?:\/{0,3})/;
    if (!url_checker.test(string)) {
        return [{
            title: argument,
            subtitle: 'incorrect url'
        }]
    } else {
        return [{
            title: "Select here to search",
            action: 'find_without_proxy',
            actionArgument: string
        }, {
            title: "Select here to search with HTTP Proxy",
            action: 'find_with_proxy',
            actionArgument: string
        }];
    }
}

function find_without_proxy(argument) {
    try {
        //get json download information
        var ret_json = LaunchBar.execute('/usr/local/bin/you-get', argument, '--json');
        //delete front and end string
        ret_json = ret_json.replace(/^([^\{]*)/, '').replace(/([^\}]*)$/, '');
    } catch (error) {
        return [{
            title: "Install 'you-get'",
            url: "https://github.com/soimort/you-get"
        }]
    }
    //Try to covert return string to json format
    try {
        var data = JSON.parse(ret_json);
    } catch (error) {
        return [{
            title: argument,
            subtitle: "'you-get' doesn't support this link."
        }]
    }
    //Push json info to launchbar
    let result = [];
    //Push website title
    result.push({
        icon: "web_icon.png",
        title: data.title,
        subtitle: data.site,
        url: data.url
    })
    //Push every result in json
    for (const _url in data.streams) {
        let video_url = [];
        //Push every url in json to single block
        for (let index = 0; index < data.streams[_url].src.length; index++) {
            video_url.push({
                url: data.streams[_url].src[index],
                badge: (index + 1).toString()
            })
        }
        //Push main block
        result.push({
            children: video_url,
            icon: "video_icon.png",
            title: data.streams[_url].container.toUpperCase(),
            subtitle: _url,
            label: (data.streams[_url].size / 1048576.0).toFixed(2).toString() + "MB",
            badge: data.streams[_url].src.length.toString(),
            action: 'start_download',
            actionArgument: {
                tag: _url,
                src: argument
            }
        })
    }
    return result;
}

function start_download(info_json) {
    let ter_command = "you-get" + " " + "--itag=" + info_json.tag + " " + info_json.src + " -o ~/downloads";
    LaunchBar.performAction("Run Terminal Command", ter_command);
}

function start_download_with_proxy(info_json) {
    let ter_command = "you-get" + " " + "--itag=" + info_json.tag + " " + info_json.src + " -o ~/downloads" + " -x 127.0.0.1:1085";
    LaunchBar.performAction("Run Terminal Command", ter_command);
}
