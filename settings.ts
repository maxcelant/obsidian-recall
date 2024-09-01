import RecallPlugin from "./main";
import { App, PluginSettingTab, Setting } from "obsidian";

export interface MyPluginSettings {
  recallFolderName: string;
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
  recallFolderName: 'recall'
}

export class RecallSettingTab extends PluginSettingTab {
  plugin: RecallPlugin;

  constructor(app: App, plugin: RecallPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Recall Folder Name")
      .setDesc("Enter the name of the recall folder")
      .addText((text) =>
        text
          .setPlaceholder("recall")
          .setValue(this.plugin.settings.recallFolderName)
          .onChange(async (value) => {
            this.plugin.settings.recallFolderName = value;
            await this.plugin.saveSettings();
          })
      );
  }
}