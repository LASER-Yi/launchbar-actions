// LaunchBar Action Script

function runWithString(string) {
    if (string) {
        return {
            title: "Press ENTER to start search"
        };
    } else {
        return [];
    }
}