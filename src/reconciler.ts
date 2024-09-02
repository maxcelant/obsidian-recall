import { App, TFile, Vault } from "obsidian";
import { RecallSettings } from "./settings";
import FileStore from "./store";

export default class Reconciler {
	private app: App;
	private vault: Vault;
	private fileStore: FileStore;
	private settings: RecallSettings;
	private recallFolderName: string;
	constructor(app: App, fileStore: FileStore, settings: RecallSettings) {
		this.app = app;
		this.vault = app.vault;
		this.fileStore = fileStore;
		this.settings = settings;
		this.recallFolderName = this.settings.recallFolderName;
	}

	private async createRecallFolderIfNotExists() {
		if (!(await this.vault.adapter.exists(this.recallFolderName))) {
			await this.vault.createFolder(this.recallFolderName);
		}
	}

	private addRecallFolderToIgnores() {
		if (
			!this.settings.foldersBlacklist.some(
				(f) => f === this.recallFolderName,
			)
		) {
			this.settings.foldersBlacklist = [
				...this.settings.foldersBlacklist,
				this.recallFolderName,
			];
		}
	}

	isIgnoredFolder(file: TFile) {
		return this.settings.foldersBlacklist.some((folder) =>
			file.path.startsWith(folder),
		);
	}

	async touchFile(file: TFile) {
		const content = await this.app.vault.read(file);
		await this.app.vault.modify(file, content);
	}

	async unvisited(file: TFile) {
		const stat = await this.vault.adapter.stat(file.path);
		if (!stat) return;

		const lastModified = stat.mtime;
		const stalenessDate =
			Date.now() -
			Number(this.settings.stalenessThreshold) * 24 * 60 * 60 * 1000;

		const lastViewedStr = this.fileStore.get(file);
		const lastViewed = lastViewedStr
			? new Date(lastViewedStr).getTime()
			: null;

		if (!lastViewed) {
			return lastModified < stalenessDate;
		}
		return lastModified < stalenessDate && lastViewed < stalenessDate;
	}

	async reconcile(): Promise<number> {
		let count = 0;
		await this.createRecallFolderIfNotExists();
		this.addRecallFolderToIgnores();
		const files = this.vault.getMarkdownFiles();
		for (const file of files) {
			if (this.isIgnoredFolder(file)) {
				continue;
			}
			if (await this.unvisited(file)) {
				await this.touchFile(file);
				const content = await this.vault.read(file);
				const newPath = `${this.recallFolderName}/${file.name}`;
				if (!(await this.vault.adapter.exists(newPath))) {
					await this.vault.create(newPath, content);
				}
				count++;
			}
		}
		return count;
	}
}
