import { App, TFile, Vault } from "obsidian";
import { RecallSettings } from "src/settings";

export default class Reconciler {
	private recallFolderName: string;
	constructor(
		private app: App,
		private vault: Vault,
		private settings: RecallSettings,
	) {
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

	async reconcile() {
		await this.createRecallFolderIfNotExists();
		this.addRecallFolderToIgnores();
		this.vault.getMarkdownFiles().forEach(async (file: TFile) => {
			if (this.isIgnoredFolder(file)) {
				return;
			}

			const stat = await this.vault.adapter.stat(file.path);
			if (!stat) return;

			const lastModified = stat.mtime;
			const stalenessDate =
				Date.now() -
				Number(this.settings.stalenessThreshold) * 24 * 60 * 60 * 1000;

			if (lastModified < stalenessDate) {
				await this.touchFile(file);
				const content = await this.vault.read(file);
				const newPath = `${this.recallFolderName}/${file.name}`;
				if (!(await this.vault.adapter.exists(newPath))) {
					await this.vault.create(newPath, content);
				}
			}
		});
	}
}
