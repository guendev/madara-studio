/* global $nuxt */
import { onError } from 'apollo-link-error'
export default ({ store, redirect }) => {
  const errorLink = onError(({ networkError, graphQLErrors, response }) => {
    if (process.browser) {
      if (networkError) {
        $nuxt.$emit('addNotify', {
          id: Math.random(),
          success: false,
          msg: 'Lỗi kết nối'
        })
      }
    }
    if (graphQLErrors) {
      graphQLErrors.forEach(({ message, extensions }) => {
        if (['UNAUTHENTICATED', 'FORBIDDEN', 'NOTIFY'].includes(extensions.code)) {
          switch (extensions.code) {
            // yêu cầu đăng nhập
            case 'UNAUTHENTICATED':
              if (process.browser) {
                $nuxt.$message.error('Bạn không được phép truy cập')
                setTimeout(() => {
                  store.dispatch('user/logOut')
                }, 1500)
              }
              break
            case 'FORBIDDEN':
              if (process.browser) {
                $nuxt.$message.error('Bạn không được phép truy cập')
                setTimeout(() => {
                  store.dispatch('user/logOut')
                }, 1500)
              }
              redirect('/404')
              break
            case 'NOTIFY':
              $nuxt.$message.error(message)
          }
        }
      })
    }
  })
  return {
    link: errorLink,
    httpEndpoint: process.env.GRAPHQL_SERVER,

    // override HTTP endpoint in browser only
    // browserHttpEndpoint: '/graphql',

    // See https://www.apollographql.com/docs/link/links/http.html#options
    httpLinkOptions: {
      credentials: 'same-origin'
    },
    // You can use `wss` for secure connection (recommended in production)
    // Use `null` to disable subscriptions
    wsEndpoint: '',

    authenticationType: 'Bearer',

    // Token name for the cookie which will be set in case of authentication
    tokenName: 'apollo-token',

    // Enable Automatic Query persisting with Apollo Engine
    persisting: false
  }
}
