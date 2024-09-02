import { Notice, Plugin, Vault } from "obsidian";
import { Reconciler } from "reconciler";
import { DEFAULT_SETTINGS, RecallSettings, RecallSettingTab } from "settings";

export default class RecallPlugin extends Plugin {
	settings: RecallSettings;
	vault: Vault;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new RecallSettingTab(this.app, this));

		const reconciler = new Reconciler(this.app.vault, this.settings);

		this.registerInterval(
			window.setInterval(
				() => reconciler.reconcile(this.settings.recallFolderName),
				7 * 24 * 60 * 60 * 1000,
			),
		);

		const ribbonIconEl = this.addRibbonIcon("brain", "Recall", async () => {
			new Notice("Reconciling notes ⏲");
			await reconciler.reconcile(this.settings.recallFolderName);
		});

		ribbonIconEl.addClass("my-plugin-ribbon-class");

		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text");

		this.addCommand({
			id: "recall",
			name: "Perform vault recall",
			callback: async () => {
				new Notice("Reconciling notes ⏲");
				await reconciler.reconcile(this.settings.recallFolderName);
			},
		});
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
