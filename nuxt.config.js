export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: process.env.TITLE,
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],
    script: [
      {
        src: 'https://cdn.jsdelivr.net/npm/lazysizes@5.3.0/lazysizes.min.js',
        type: 'text/javascript',
        async: true,
        defer: true
      }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    { src: '~/assets/theme.less', lang: 'less' },
    'cropperjs/dist/cropper.css'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '@/plugins/antd-ui'
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  loading: { color: '#007bff', height: '3px', throttle: 0 },

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    ['@nuxtjs/dotenv', { filename: '.env' }],
    '@nuxtjs/moment'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/axios
    '@nuxtjs/axios',
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    // https://go.nuxtjs.dev/content
    '@nuxt/content',
    'cookie-universal-nuxt',
    '@nuxtjs/apollo',
    'portal-vue/nuxt'
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  axios: {},

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      lang: 'en'
    }
  },

  moment: {
    defaultLocale: 'vi',
    locales: ['vi'],
    defaultTimezone: 'Asia/Ho_Chi_Minh'
  },

  // Content module configuration: https://go.nuxtjs.dev/config-content
  content: {},

  apollo: {
    // Sets up the apollo client endpoints
    clientConfigs: {
      // recommended: use a file to declare the client configuration (see below for example)
      default: '~/plugins/apollo-config.js'
    }
  },

  router: {
    middleware: ['auth'],
    extendRoutes (routes, resolve) {
      routes.forEach((route) => {
        if (route.name === 'create') {
          route.path = '/story/create'
          routes.push(Object.assign({}, route, { path: '/story/:id(\\d+)/setting', name: 'story-setting' }))
        }
        if (route.name === 'story') {
          route.path = '/story/:id(\\d+)'
        }
        if (route.name === 'story-sort') {
          route.path = '/story/:id(\\d+)/sort'
        }
        if (route.name === 'chapter') {
          route.path = '/story/:story(\\d+)/new'
          routes.push(Object.assign({}, route, { path: '/story/:story(\\d+)/:chapter(\\d+)/edit', name: 'chapter-edit' }))
        }
      })
    }
  },

  build: {
    extend (config, { loaders: { less } }) {
      less.javascriptEnabled = true
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  server: {
    port: process.env.PORT, // default: 3000
    host: 'localhost', // default: localhost,
    timing: false
  }
}
