export default {
  state: {
    options: null,
    width: 0,
    height: 0
  },
  mutations: {
    // @ts-ignore
    SET_OPTIONS: (state, options) => (state.options = options),
    // @ts-ignore
    SET_WIDTH: (state, width) => (state.width = width),
    // @ts-ignore
    SET_HEIGHT: (state, height) => (state.height = height)
  },
  getters: {
    // @ts-ignore
    dpr: state => state.options.devicePixelRatio,
    // @ts-ignore
    WIDTH: (state, getter) => state.width * getter.dpr,
    // @ts-ignore
    HEIGHT: (state, getter) => state.height * getter.dpr
  }
};
