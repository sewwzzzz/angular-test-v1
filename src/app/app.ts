import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navigation } from '../component/navigation/navigation';
import { ColorfulScrollbar } from '../component/colorful-scrollbar/colorful-scrollbar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navigation, ColorfulScrollbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'angular-test-v1';
}
