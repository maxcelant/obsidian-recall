import { Notice, Plugin } from 'obsidian';
import { createRecallIfNotExists, reconcile } from 'src/reconcile';

interface MyPluginSettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  mySetting: 'default'
}

export default class RecallPlugin extends Plugin {
  settings: MyPluginSettings;

  async onload() {
    await this.loadSettings();

    const ribbonIconEl = this.addRibbonIcon('timer', 'Recall', (evt: MouseEvent) => {
      new Notice('Reconciling notes ⏲');
      createRecallIfNotExists(this.app.vault)
      reconcile(this.app.vault)
    });

    ribbonIconEl.addClass('my-plugin-ribbon-class');

    const statusBarItemEl = this.addStatusBarItem();
    statusBarItemEl.setText('Status Bar Text');

    this.addCommand({
      id: 'recall',
      name: 'Perform vault recall',
      callback: () => {
        new Notice('Reconciling notes ⏲')
        createRecallIfNotExists(this.app.vault)
        reconcile(this.app.vault);
      }
    });
  }

  onunload() {

  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
