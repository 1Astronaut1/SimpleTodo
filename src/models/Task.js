import { BaseModel } from "./BaseModel";

export class Task extends BaseModel {
  constructor(heading) {
    super();
    this.heading = heading;
    this.text = '';
    this.type = 0;
  }
}