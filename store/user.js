import { GET_MY_ACCOUNT } from '~/schema/queries/user'

export const state = () => ({
  user: {}
})

export const getters = {
  user: state => state.user,
  auth: state => !(!state.user || Object.keys(state.user).length === 0),
  isMod: state => getters.auth(state)
    ? ['mod', 's_mod', 'admin', 'sp_admin'].includes(state.user.role)
    : ''
}

// mutations
export const mutations = {
  SET_USER (state, data) {
    state.user = data
  }
}

export const actions = {
  async getMyAccount ({ dispatch }) {
    try {
      const {
        data: { me }
      } = await this.app.apolloProvider.defaultClient.query({
        query: GET_MY_ACCOUNT
      })
      dispatch('setUser', me)
    } catch (e) {
      console.log(e)
      // reload để thực hiện các thay đổi
      // dispatch('logOut')
    }
  },
  setUser ({ commit }, user) {
    commit('SET_USER', user)
  },
  logOut () {
    this.$cookies.remove('apollo-token')
    if (process.browser) {
      window.location.href = '/'
    }
  }
}
