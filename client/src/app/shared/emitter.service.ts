import {Injectable, EventEmitter} from '@angular/core';

@Injectable()
export class EmitterService {
  private static _emitters: { [NAME: string]: EventEmitter<any> } = {};

  static get(NAME: string): EventEmitter<any> {
    if (!this._emitters[NAME])
      this._emitters[NAME] = new EventEmitter();
    return this._emitters[NAME];
  }
}
