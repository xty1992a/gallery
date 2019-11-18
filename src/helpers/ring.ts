class Ring {
  list: any[];

  constructor(list: any[]) {
    this.list = [...list];
  }

  push(item: any) {
    this.list.push(item);
  }

  getNextBy(item: any, isSame = (a: any, b: any) => a === b) {
    const index = this.list.findIndex(it => isSame(it, item));
    if (index === -1) return;
    if (index === this.list.length - 1) return this.list[0];
    return this.list[index + 1];
  }

  getPrevBy(item: any, isSame = (a: any, b: any) => a === b) {
    const index = this.list.findIndex(it => isSame(it, item));
    if (index === -1) return;
    if (index === 0) return this.list[this.list.length - 1];
    return this.list[index - 1];
  }
}

export default Ring;
