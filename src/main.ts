import { Notice, Plugin, Vault } from "obsidian";
import { DEFAULT_SETTINGS, RecallSettings, RecallSettingTab } from "./settings";
import Reconciler from "./reconciler";
import FileStore from "./store";

export default class RecallPlugin extends Plugin {
	settings: RecallSettings;
	vault: Vault;
	fileStore: FileStore;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new RecallSettingTab(this.app, this));

		this.fileStore = new FileStore(this.app.vault);
		await this.fileStore.load();

		const reconciler = new Reconciler(
			this.app,
			this.fileStore,
			this.settings,
		);

		this.registerEvent(
			this.app.workspace.on("file-open", async (file) => {
				if (file) {
					await this.fileStore.update(file);
				}
			}),
		);

		this.registerInterval(
			window.setInterval(
				async () => {
					const count = await reconciler.reconcile();
					new Notice(
						`${count} stale notes added to /${this.settings.recallFolderName}`,
					);
				},
				Number(this.settings.reconcilePeriod) * 60 * 60 * 1000,
			),
		);

		const ribbonIconEl = this.addRibbonIcon("timer", "Recall", async () => {
			const count = await reconciler.reconcile();
			new Notice(
				`${count} stale notes added to /${this.settings.recallFolderName}`,
			);
		});

		ribbonIconEl.addClass("my-plugin-ribbon-class");

		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText("Status Bar Text");

		this.addCommand({
			id: "recall",
			name: "Perform vault recall",
			callback: async () => {
				const count = await reconciler.reconcile();
				new Notice(
					`${count} stale notes added to /${this.settings.recallFolderName}`,
				);
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
