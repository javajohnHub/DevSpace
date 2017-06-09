import { Component } from '@angular/core';
import { NameService } from './name.service';
import {AbstractControl, FormBuilder, FormGroup, Validators} from '@angular/forms';
@Component({
  selector: 'app-name',
  templateUrl: './name.component.html',
  styleUrls: ['./name.component.css']
})
export class NameComponent {
  name: string = '';
 submitted: boolean = false;
  constructor(private nameService:NameService) {

  }

  sendName(){
    this.nameService.sendName(this.name);
    this.name = '';
    this.submitted = true;
  }

}
