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
  name_exists:boolean = false;
  proposedName:string;
  msg: {};
  submitted: boolean = false;
  constructor(private nameService:NameService) {

  }

  sendName(){
    this.nameService.sendName(this.name);
    this.nameExists();
    this.name = '';
    this.submitted = true;
  }
  nameExists(){
    this.nameService.nameExists().subscribe(data => {
      console.log('exists',data);
      this.name_exists = true;
      this.submitted = false;
      this.msg = data;
      this.name = this.msg['proposedName'];
      setTimeout(() => {
        this.name_exists = false;
      }, 3000);


    });
  }

}
