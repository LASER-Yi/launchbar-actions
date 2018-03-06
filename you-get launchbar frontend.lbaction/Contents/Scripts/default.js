// LaunchBar Action Script

function runWithString(argument) {
    let checker = argument.match(/http(s):\/\/.+/);
    if (checker == null) {
        LaunchBar.alert("Incorrect url");
        return;
    }
    let ret_json = LaunchBar.execute('/usr/local/bin/you-get', argument, '--json');
    //Try to covert return string to json format
    try {
        var data = JSON.parse(ret_json);
    } catch (error) {
        LaunchBar.alert("Error: 'you-get' doesn't support this link.");
        return;
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
            action: 'startDownload',
            actionArgument: {
                tag: _url,
                src: argument
            }
        })
    }
    return result;
}

function startDownload(info_json) {
    let ter_command = "you-get" + " " + "--itag=" + info_json.tag + " " + info_json.src + " -o ~/downloads";
    LaunchBar.performAction("Run Terminal Command", ter_command);
}

function bg_startDownload(info_json) {
    LaunchBar.execute('you-get', "--itag=" + info_json.tag, info_json.src, "-o ~/downloads");
}