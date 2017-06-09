import {NgModule} from '@angular/core';
import {ClientAppComponent} from './client.component';
import {ChatComponent} from './chat/chat.component';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { NameComponent } from './name/name.component';
import {NameService} from "./name/name.service";
import { RoomComponent } from './room/room.component';
import {RoomService} from "./room/room.service";
import { RoomListComponent } from './room-list/room-list.component';
import { PeopleListComponent } from './people-list/people-list.component';
import { VideoComponent } from './video/video.component';
import { EditorComponent } from './editor/editor.component';
import {EditorDirective} from "./editor/editor.directive";
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
  declarations: [ClientAppComponent, EditorDirective,ChatComponent, NameComponent, RoomComponent, RoomListComponent, PeopleListComponent, VideoComponent, EditorComponent],
  bootstrap: [ClientAppComponent],
  imports: [BrowserModule, FormsModule, ReactiveFormsModule, BsDropdownModule.forRoot(),ModalModule.forRoot()] ,
  providers: [NameService, RoomService,],
})

export class AppModule {}
