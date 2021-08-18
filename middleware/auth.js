export default ({ store, route, redirect }) => {
  if (store.getters['user/auth']) {
    if (route.path === '/') {
      redirect('/stories')
    }
  } else {
    redirect('/')
  }
}
