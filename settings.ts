import RecallPlugin from "./main";
import { App, PluginSettingTab, Setting, TextComponent } from "obsidian";

export interface MyPluginSettings {
  recallFolderName: string;
  ignoreFolders: string[];
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
  recallFolderName: 'recall',
  ignoreFolders: []
}

export class RecallSettingTab extends PluginSettingTab {
  plugin: RecallPlugin;
  private ignoreFolderInput: TextComponent;
  private ignoreFoldersEl: HTMLElement;

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

    new Setting(containerEl)
      .setName("Ignore Folders")
      .setDesc("Add folders to ignore (one per line)")
      .addText((text) => {
        this.ignoreFolderInput = text;
        text.setPlaceholder("Enter folder path");
      })
      .addButton((button) => 
        button
          .setButtonText("Add")
          .onClick(async () => {
            const value = this.ignoreFolderInput.getValue();
            if (value && !this.plugin.settings.ignoreFolders.includes(value)) {
              this.plugin.settings.ignoreFolders.push(value);
              await this.plugin.saveSettings();
              this.ignoreFolderInput.setValue("");
              this.displayIgnoreFolders();
            }
          })
      );

    this.ignoreFoldersEl = containerEl.createDiv("ignore-folders-list");
    this.displayIgnoreFolders();
  }

  displayIgnoreFolders(): void {
    this.ignoreFoldersEl.empty();

    this.plugin.settings.ignoreFolders.forEach((folder, index) => {
      const setting = new Setting(this.ignoreFoldersEl)
        .setName(folder)
        .addButton((button) => 
          button
            .setIcon("trash")
            .onClick(async () => {
              this.plugin.settings.ignoreFolders.splice(index, 1);
              await this.plugin.saveSettings();
              this.displayIgnoreFolders();
            })
        );
    });
  }
}