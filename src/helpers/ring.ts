export default class Ring {
  list: any[];

  constructor(list: any[]) {
    this.list = [...list];
  }

  push(item: any) {
    this.list.push(item);
  }
}
