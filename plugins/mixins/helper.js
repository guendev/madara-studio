export default {
  methods: {
    webAssets (url) {
      return process.env.DOMAIN_CDN + url
    }
  }
}
