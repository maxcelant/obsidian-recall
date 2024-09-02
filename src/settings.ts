import RecallPlugin from "./main";
import { App, PluginSettingTab, Setting, TextComponent } from "obsidian";

export interface RecallSettings {
	recallFolderName: string;
	stalenessThreshold: number;
	reconcilePeriod: number;
	foldersBlacklist: string[];
}

export const DEFAULT_SETTINGS: RecallSettings = {
	recallFolderName: "recall",
	stalenessThreshold: 7,
	reconcilePeriod: 1,
	foldersBlacklist: [],
};

export class RecallSettingTab extends PluginSettingTab {
	plugin: RecallPlugin;
	private foldersBlacklistInput: TextComponent;
	private foldersBlacklistEl: HTMLElement;

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
					}),
			);

		new Setting(containerEl)
			.setName("Staleness Threshold (in days)")
			.setDesc(
				"The amount of day(s) it takes for a note to be considered 'stale'",
			)
			.addSlider((slider) =>
				slider
					.setLimits(0.25, 15, 0.25)
					.setValue(this.plugin.settings.stalenessThreshold)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.stalenessThreshold = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Reconcile Period (in days)")
			.setDesc("How often your vault should be reconciled for old notes")
			.addSlider((slider) =>
				slider
					.setLimits(0.25, 15, 0.25)
					.setValue(this.plugin.settings.reconcilePeriod)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.reconcilePeriod = value;
						await this.plugin.saveSettings();
					}),
			);

		new Setting(containerEl)
			.setName("Folders to blacklist")
			.setDesc("Add folders to ignore (one per line)")
			.addText((text) => {
				this.foldersBlacklistInput = text;
				text.setPlaceholder("Enter folder path");
			})
			.addButton((button) =>
				button.setButtonText("Add").onClick(async () => {
					const value = this.foldersBlacklistInput.getValue();
					if (
						value &&
						!this.plugin.settings.foldersBlacklist.includes(value)
					) {
						this.plugin.settings.foldersBlacklist.push(value);
						await this.plugin.saveSettings();
						this.foldersBlacklistInput.setValue("");
						this.displayIgnoreFolders();
					}
				}),
			);

		this.foldersBlacklistEl = containerEl.createDiv("ignore-folders-list");
		this.displayIgnoreFolders();
	}

	displayIgnoreFolders(): void {
		this.foldersBlacklistEl.empty();

		this.plugin.settings.foldersBlacklist.forEach((folder, index) => {
			new Setting(this.foldersBlacklistEl)
				.setName(folder)
				.addButton((button) =>
					button.setIcon("trash").onClick(async () => {
						this.plugin.settings.foldersBlacklist.splice(index, 1);
						await this.plugin.saveSettings();
						this.displayIgnoreFolders();
					}),
				);
		});
	}
}
