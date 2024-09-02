import { TFile, Vault } from "obsidian";
import { RecallSettings } from "settings";

export class Reconciler {
	constructor(
		private vault: Vault,
		private settings: RecallSettings,
	) {}

	private async createRecallFolderIfNotExists(recallFolderName: string) {
		if (!(await this.vault.adapter.exists(recallFolderName))) {
			await this.vault.createFolder(recallFolderName);
		}
	}

	private addRecallFolderToIgnores(recallFolderName: string) {
		if (
			!this.settings.ignoreFolders.some(
				(f) => f === this.settings.recallFolderName,
			)
		) {
			this.settings.ignoreFolders = [
				...this.settings.ignoreFolders,
				this.settings.recallFolderName,
			];
		}
	}

	isIgnoredFolder(file: TFile) {
		return this.settings.ignoreFolders.some((folder) =>
			file.path.startsWith(folder),
		);
	}

	async reconcile(recallFolderName: string) {
		await this.createRecallFolderIfNotExists(recallFolderName);
		this.addRecallFolderToIgnores(recallFolderName);
		this.vault.getMarkdownFiles().forEach(async (file: TFile) => {
			if (this.isIgnoredFolder(file)) {
				return;
			}

			const stat = await this.vault.adapter.stat(file.path);
			if (!stat) return;

			const lastModified = stat.mtime;
			const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

			if (lastModified < oneWeekAgo) {
				const content = await this.vault.read(file);
				const newPath = `${recallFolderName}/${file.name}`;
				if (!(await this.vault.adapter.exists(newPath))) {
					console.log(newPath);
					await this.vault.create(newPath, content);
				}
			}
		});
	}
}
