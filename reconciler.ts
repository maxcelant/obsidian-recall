import { TFile, Vault } from "obsidian";
import { RecallSettings } from "settings";

export class Reconciler {
	private recallFolderName: string;
	constructor(
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
			!this.settings.ignoreFolders.some(
				(f) => f === this.recallFolderName,
			)
		) {
			this.settings.ignoreFolders = [
				...this.settings.ignoreFolders,
				this.recallFolderName,
			];
		}
	}

	isIgnoredFolder(file: TFile) {
		return this.settings.ignoreFolders.some((folder) =>
			file.path.startsWith(folder),
		);
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
				const content = await this.vault.read(file);
				const newPath = `${this.recallFolderName}/${file.name}`;
				if (!(await this.vault.adapter.exists(newPath))) {
					console.log(newPath);
					await this.vault.create(newPath, content);
				}
			}
		});
	}
}
