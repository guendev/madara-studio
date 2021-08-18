export const actions = {
  async nuxtServerInit ({ commit, state, dispatch }, { app, req }) {
    const _token = this.$cookies.get('apollo-token')
    if (_token) {
      await app.store.dispatch('user/getMyAccount')
    }
  },
  nuxtClientInit ({ commit, dispatch }, { app }) {
    // app.store.dispatch('story/getStoryMeta')
  }
}
