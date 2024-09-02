# Obsidian Recall Plugin

## Overview

The Obsidian Recall Plugin is designed to help you revisit and reinforce your knowledge by surfacing old notes that you haven't interacted with in a while. It automatically identifies notes that haven't been viewed or edited recently and adds them to a designated "Recall" folder, making it easier for you to review and refresh your memory on past ideas and information.

## Features

-   **Automatic Note Tracking**: Monitors the last viewed and modified times of your notes.
-   **Customizable Staleness Threshold**: Set how long a note should be untouched before it's considered for recall.
-   **Dedicated Recall Folder**: Automatically creates copies of stale notes in a specified "Recall" folder for easy review.
-   **Ignorable Folders**: Customize which folders should be excluded from the recall process.
-   **Manual Trigger**: Ability to manually initiate the recall process via a ribbon icon or command.

## Installation

1. Open Obsidian and go to Settings.
2. Navigate to Community Plugins and disable Safe Mode.
3. Click on Browse and search for "Recall Plugin".
4. Click Install, then Enable the plugin.

## Usage

Once installed and enabled, the plugin will start tracking your note interactions automatically. Here's how to use it:

1. **Set Up**: Go to the plugin settings to configure your preferred staleness threshold and recall folder name.
2. **Automatic Process**: The plugin will periodically scan your vault and add stale notes to the recall folder.
3. **Manual Trigger**: Click the `timer` icon in the ribbon or use the "Perform vault recall" command to manually initiate the recall process.
4. **Review**: Check your designated recall folder to find notes that need review.

## Configuration

In the plugin settings, you can customize:

-   **Staleness Threshold**: Set the number of days after which a note is considered stale.
-   **Recall Folder Name**: Choose the name of the folder where stale notes will be copied.
-   **Ignored Folders**: Specify folders that should be excluded from the recall process.
-   **Reconciliation Period**: Set how often (in hours) the plugin should automatically check for stale notes.

## FAQ

Q: Will this plugin modify my original notes?
A: No, it only creates copies in the recall folder. Your original notes remain untouched.

Q: What happens if I delete a note from the recall folder?
A: The original note is unaffected. The plugin may re-add it to the recall folder in the future if it remains unvisited.

## Support

If you encounter any issues or have suggestions for improvements, please file an issue on the [GitHub repository](https://github.com/yourusername/obsidian-recall-plugin).

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Happy recalling!
