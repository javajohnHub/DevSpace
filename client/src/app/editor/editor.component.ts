import {Component} from '@angular/core';
import {SocketService} from '../shared/socket.service';
declare var CodeMirror: any;
@Component({
  selector: 'app-editor',
  template: `
    <select name="idTheme" id="theme" [(ngModel)]="selectedTheme" (ngModelChange)="onThemeChange($event)">
      <option value="" disabled selected>Select a Theme</option>
      <option value="eclipse">eclipse</option>
      <option value="vibrant-ink">vibrant-ink</option>
      <option value="3024-day">3024-day</option>
      <option value="3024-night">3024-night</option>
      <option value="monokai">monokai</option>
      <option value="midnight">midnight</option>
      <option value="night">night</option>
      <option value="railscasts">railscasts</option>
      <option value="solarized">solarized</option>
      <option value="ambiance">ambiance</option>
      <option value="abcdef">abcdef</option>
      <option value="ambiance-mobile">ambiance-mobile</option>
      <option value="base16-dark">base16-dark</option>
      <option value="base16-light">base16-light</option>
      <option value="bespin">bespin</option>
      <option value="blackboard">blackboard</option>
      <option value="cobalt">cobalt</option>
      <option value="colorforth">colorforth</option>
      <option value="dracula">dracula</option>
      <option value="duotone-light">duotone-light</option>
      <option value="duotone-dark">duotone-dark</option>
      <option value="elegant">elegant</option>
      <option value="erlang-dark">erlang-dark</option>
      <option value="hopscotch">hopscotch</option>
      <option value="icecoder">icecoder</option>
      <option value="isotope">isotope</option>
      <option value="lesser-dark">lesser-dark</option>
      <option value="liquibyte">liquibyte</option>
      <option value="material">material</option>
      <option value="mbo">mbo</option>
      <option value="mdn-like">mdn-like</option>
      <option value="neat">neat</option>
      <option value="neo">neo</option>
      <option value="panda-syntax">panda-syntax</option>
      <option value="paraiso-light">paraiso-light</option>
      <option value="paraiso-dark">paraiso-dark</option>
      <option value="pastel-on-dark">pastel-on-dark</option>
      <option value="rubyblue">rubyblue</option>
      <option value="seti">seti</option>
      <option value="the-matrix">the-matrix</option>
      <option value="tomorrow-night-bright">tomorrow-night-bright</option>
      <option value="tomorrow-night-eighties">tomorrow-night-eighties</option>
      <option value="ttcn">ttcn</option>
      <option value="twilight">twilight</option>
      <option value="xq-dark">xq-dark</option>
      <option value="xq-light">xq-light</option>
      <option value="yeti">yeti</option>
      <option value="zenburn">zenburn</option>
    </select>

    <select name="idLanguage" id="mode" [(ngModel)]="selectedMode" (ngModelChange)="onModeChange($event)">
      <option value="" disabled selected>Select a Mode</option>
      <option value="javascript">javaScript</option>
      <option value="python">python</option>
      <option value="php">php</option>
      <option value="ruby">ruby</option>
      <option value="clojure">clojure</option>
      <option value="coffeescript">coffeescript</option>
      <option value="clike">clike</option>
      <option value="css">css</option>
      <option value="markdown">markdown</option>
      <option value="htmlmixed">htmlmixed</option>
      <option value="xml">xml</option>

    </select>
    <textarea editor id="code" name="code">
        // Some content
    </textarea>
  `,
})


export class EditorComponent{
  selectedTheme: any;
  selectedMode: any;
  socket: any;
  constructor(){
    this.socket = SocketService.getInstance();
  }
  onThemeChange(newValue) {
  this.selectedTheme = newValue;
  this.socket.emit('theme', this.selectedTheme);
}

  onModeChange(newValue) {
    this.selectedMode = newValue;
    this.socket.emit('mode', this.selectedMode);
  }
}
