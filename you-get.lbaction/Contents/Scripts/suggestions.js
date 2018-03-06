// LaunchBar Action Script

function runWithString(string)
{
    if (string == "") {
        let clip = Launchbar.getClipboardString();
        return [{
            title: clip,
            subtitle: "clipboard",
        }];
    }
}
