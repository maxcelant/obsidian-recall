import { Notice, Plugin, TFile, Vault } from 'obsidian';
import { DEFAULT_SETTINGS, RecallSettings, RecallSettingTab } from 'settings';

export default class RecallPlugin extends Plugin {
  settings: RecallSettings;
  vault: Vault;

  async onload() {
    this.vault = this.app.vault
    await this.loadSettings();

    this.addSettingTab(new RecallSettingTab(this.app, this));

    this.registerInterval(
      window.setInterval(() => this.reconcile(this.settings.recallFolderName), 7 * 24 * 60 * 60 * 1000)
    );

    const ribbonIconEl = this.addRibbonIcon('brain', 'Recall', async () => {
      new Notice('Reconciling notes ⏲');
      await this.reconcile(this.settings.recallFolderName)
    });

    ribbonIconEl.addClass('my-plugin-ribbon-class');

    const statusBarItemEl = this.addStatusBarItem();
    statusBarItemEl.setText('Status Bar Text');

    this.addCommand({
      id: 'recall',
      name: 'Perform vault recall',
      callback: async () => {
        new Notice('Reconciling notes ⏲')
        await this.reconcile(this.settings.recallFolderName);
      }
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async createRecallIfNotExists(recallFolderName: string) {
    if (!(await this.vault.adapter.exists(recallFolderName))) {
      await this.vault.createFolder(recallFolderName);
    } 
  }
  
  async reconcile(recallFolderName: string) {
    await this.createRecallIfNotExists(recallFolderName)
    const files = this.vault.getMarkdownFiles()
    files.forEach(async (file: TFile) => {
      if (this.settings.ignoreFolders.some(folder => file.path.startsWith(folder))) {
        return
      }

      const stat = await this.vault.adapter.stat(file.path);
      if (!stat) return;
      
      const lastModified = stat.mtime;
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  
      if (lastModified < oneWeekAgo) {
        const content = await this.vault.read(file);
        const newPath = `${recallFolderName}/${file.name}`;
        if (!(await this.vault.adapter.exists(newPath))) {
          console.log(newPath)
          await this.vault.create(newPath, content);
        }
      }
    })
  }
}