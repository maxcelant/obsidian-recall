import { TFile, Vault } from "obsidian";

export async function createRecallIfNotExists(vault: Vault) {
  const recallFolder = '/recall'
  if (!(await vault.adapter.exists(recallFolder))) {
    await vault.createFolder(recallFolder);
  } else {
    console.log('folder exists!')
  }
}

export function reconcile(vault: Vault) {
  const files = vault.getMarkdownFiles()
  console.log('files', files)
}