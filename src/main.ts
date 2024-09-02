import { Notice, Plugin, Vault } from "obsidian";
import { DEFAULT_SETTINGS, RecallSettings, RecallSettingTab } from "./settings";
import Reconciler from "./reconciler";
import FileStore from "./store";

export default class RecallPlugin extends Plugin {
	settings: RecallSettings;
	vault: Vault;
	fileStore: FileStore

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new RecallSettingTab(this.app, this));

		this.fileStore = new FileStore(this.app.vault)
		await this.fileStore.load()

		const reconciler = new Reconciler(
			this.app,
			this.settings,
		);

		this.registerInterval(
			window.setInterval(
				() => {
					new Notice(
						`Scanning vault for notes to recall and adding them to /${this.settings.recallFolderName} 🔍`,
					);
					reconciler.reconcile();
				},
				Number(this.settings.reconcilePeriod) * 60 * 60 * 1000,
			),
		);

		const ribbonIconEl = this.addRibbonIcon("brain", "Recall", async () => {
			new Notice(
				`Scanning vault for notes to recall and adding them to /${this.settings.recallFolderName} 🔍`,
			);
			await reconciler.reconcile();
		});

		ribbonIconEl.addClass("my-plugin-ribbon-class");

		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text");

		this.addCommand({
			id: "recall",
			name: "Perform vault recall",
			callback: async () => {
				new Notice(
					`Scanning vault for notes to recall and adding them to /${this.settings.recallFolderName} 🔍`,
				);
				await reconciler.reconcile();
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
