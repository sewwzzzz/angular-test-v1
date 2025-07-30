import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navigation } from '../component/navigation/navigation';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navigation],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'angular-test-v1';
}
