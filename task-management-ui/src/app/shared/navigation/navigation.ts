import { Component, OnInit } from '@angular/core';
import { AppNavigationService } from './app-navigation-service';
import { AppMenu } from './app-menu';

@Component({
  selector: 'app-navigation',
  standalone: false,
  templateUrl: './navigation.html',
  styleUrl: './navigation.scss',
})
export class Navigation implements OnInit {
  sidebarCloseFlag: boolean = false;
  menu: AppMenu | null = null;

  constructor(private appNavigationService: AppNavigationService) {}

  ngOnInit(): void {
    this.menu = this.appNavigationService.getMenu();
  }

  sidebarCloseEvent(event: any) {}
}
