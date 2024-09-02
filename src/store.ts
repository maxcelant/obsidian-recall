import { TFile, Vault } from "obsidian";

export default class FileStore {
	private vault: Vault;
	private store: { [key: string]: string } = {};
	private storePath: string;

	constructor(vault: Vault) {
		this.vault = vault;
		this.storePath =
			"./.obsidian/plugins/obsidian-recall/src/store/recall-data-store.json";
	}

	async load() {
		try {
			const file = this.vault.getAbstractFileByPath(this.storePath);
			if (file instanceof TFile) {
				const data = await this.vault.read(file);
				this.store = JSON.parse(data);
				console.log("Data loaded:", this.store);
			} else {
				console.log("Store file not found. Creating new store.");
				this.store = {};
				await this.save();
			}
		} catch (error) {
			console.error("Error loading file store:", error);
			this.store = {};
		}
		return this.store;
	}

	get(file: TFile): string | null {
		return this.store[file.path];
	}

	async save() {
		const json = JSON.stringify(this.store, null, 2);
		try {
			await this.vault.adapter.write(this.storePath, json);
			console.log("Data saved successfully");
		} catch (error) {
			console.error("Error saving file store:", error);
		}
	}

	async update(file: TFile) {
		this.store[file.path] = new Date().toISOString();
		await this.save();
	}
}
