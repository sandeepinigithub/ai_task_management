import { Component, Input } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-comp-wrap',
  standalone: false,
  templateUrl: './comp-wrap.html',
  styleUrl: './comp-wrap.scss',
})
export class CompWrap {
  @Input() title = 'Sample Title';


  constructor(private location: Location) { }

  goBack() {
    this.location.back();
  }
}
