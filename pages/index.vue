<template>
  <div class="login-container">
    <div
      class="login-bg"
      style="background-image: url(https://static3w.kuaikanmanhua.com/static-kk-ecology/img/login_bg.8a7b128.jpg);"
    />
    <div class="login-inner">
      <div class="login-form">
        <a-form-model
          ref="formRule"
          class="form"
          layout="vertical"
          :model="form"
          :rules="rules"
        >
          <p class="form-title">
            Đăng Nhập
          </p>
          <a-form-model-item ref="email" prop="email" has-feedback>
            <a-input
              v-model="form.email"
              placeholder="Tên đăng nhập"
              @blur="$refs.email.onFieldBlur()"
            />
          </a-form-model-item>
          <a-form-model-item ref="password" prop="password" has-feedback>
            <a-input-password
              v-model="form.password"
              placeholder="Mật khẩu"
              @blur="$refs.password.onFieldBlur()"
            />
          </a-form-model-item>
        </a-form-model>
        <a-form-model-item>
          <a-button
            type="primary"
            :icon="isLoading ? 'loading' : 'caret-right'"
            :disabled="isLoading"
            @click="submitForm()"
          >
            Đăng Nhập
          </a-button>
        </a-form-model-item>
      </div>
    </div>
  </div>
</template>

<script>
import { SIGN_IN } from '~/schema/mutations/user'

export default {
  name: 'LoginPage',
  layout: 'blank',
  data () {
    return {
      form: {
        email: '',
        password: ''
      },
      isLoading: false,
      rules: {
        email: [
          {
            required: true,
            message: 'Email không được để trống',
            trigger: 'blur'
          },
          {
            type: 'email',
            message: 'Địa chỉ Email không hợp lệ',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: 'Mật khẩu không được để trống'
          }
        ]
      }
    }
  },
  methods: {
    submitForm () {
      this.$refs.formRule.validate((valid) => {
        if (valid) {
          this.loginAction()
        }
      })
    },
    async loginAction () {
      this.isLoading = true
      this.$nuxt.$loading.start()
      try {
        const { data: { signinUser } } = await this.$apollo.mutate({
          mutation: SIGN_IN,
          variables: this.form
        })
        await this.$apolloHelpers.onLogin(signinUser.token)
        location.reload()
      } catch (e) {
        console.log(e)
      }
      this.$nuxt.$loading.finish()
      this.isLoading = false
    }
  }
}
</script>

<style>
.login-container {
  position: relative;
  width: 100%;
}

.login-container .login-bg {
  position: fixed;
  height: 100%;
  width: 100%;
  background-size: cover;
  background-position: 50%;
  background-repeat: no-repeat;
  z-index: -1;
}
.login-inner {
  height: 100vh;
  display: flex;
}
.login-form {
  width: 366px;
  padding: 50px 40px 20px;
  background: #fff;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 6%);
  border-radius: 4px;
  margin: auto;
}

.form-title {
  position: relative;
  display: inline-block;
  margin-bottom: 30px;
  width: 100%;
  text-align: center;
}

.login-form .ant-input {
  border: unset;
  border-bottom: 1px solid #dcdfe6;
  border-radius: unset;
  padding-left: unset;
}
.login-form .ant-input:focus {
  box-shadow: none;
  border-color: #909399;
}

.login-form .ant-form-explain {
  font-size: 12px;
}
</style>
