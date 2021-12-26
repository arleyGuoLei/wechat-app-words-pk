Component({
  properties: {
    path: String,
    type: {
      type: String,
      value: 'gotoPage'
    },
    route: String,
    query: Object,
    delta: Number,
    setData: Object
  },

  methods: {
    gotoPage () {
      const router = getApp().router
      const { path, route, type, query } = this.data
      const toPath = route || path

      if (
        ['gotoPage', 'navigateTo', 'switchTab', 'redirectTo'].includes(type)
      ) {
        (router)[type](toPath, query)
      }

      if (type === 'navigateBack') {
        const { delta, setData } = this.data
        router.navigateBack({ delta }, { setData })
      }
    }
  }
})
