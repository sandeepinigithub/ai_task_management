import { Component, Input } from '@angular/core';
import { AppMenu } from '../navigation/app-menu';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  @Input() menu: AppMenu | null = null;

  openPanels = new Set<string>();

  toggle(name: string): void {
    this.openPanels.has(name) ? this.openPanels.delete(name) : this.openPanels.add(name);
  }

  isOpen(name: string): boolean {
    return this.openPanels.has(name);
  }
}
