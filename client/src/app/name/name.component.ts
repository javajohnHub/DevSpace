import { Component } from '@angular/core';
import { NameService } from './name.service';
@Component({
  selector: 'app-name',
  templateUrl: './name.component.html',
  styleUrls: ['./name.component.css']
})
export class NameComponent {
  name: string;
  constructor(private nameService:NameService) { }

  sendName(){
    this.nameService.sendName(this.name);
    this.name = '';
  }

}
