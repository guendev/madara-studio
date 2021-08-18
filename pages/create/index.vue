<template>
  <div class="book-form">
    <a-spin :spinning="isLoading">
      <a-form-model
        id="createForm"
        ref="ruleForm"
        :model="form"
        :rules="rules"
        layout="vertical"
      >
        <a-form-model-item ref="avatar" prop="avatar" label="Avatar">
          <a-spin class="loading-avatar" :spinning="isLoadingImage">
            <input
              id="inputAvatar"
              type="file"
              name="inputAvatar"
              accept="image/*"
              @change="openCropImage($event)"
            >
            <label class="pr" for="inputAvatar">
              <img
                :src="form.avatar || 'https://i.imgur.com/59FtdGm.png'"
                alt=""
              >
              <a-icon type="plus-circle" />
            </label>
          </a-spin>
          <template slot="extra">
            <small>
              - Nhấn để tải lên hình ảnh.
              <br>
              - Có công cụ hỗ trợ hình ảnh ngay tại đây!
            </small>
          </template>
        </a-form-model-item>

        <a-form-model-item ref="title" prop="title" label="Title" has-feedback>
          <a-input
            v-model="form.title"
            placeholder="Title"
            @blur="$refs.title.onFieldBlur()"
          />
        </a-form-model-item>

        <a-form-model-item ref="otherTitle" label="Other title" prop="otherTitle">
          <a-input
            v-model="form.otherTitle"
            placeholder="Other title"
          />
        </a-form-model-item>

        <a-form-model-item label="Author" prop="author">
          <a-input
            v-model="form.author"
            placeholder="Author"
          />
        </a-form-model-item>

        <a-form-model-item ref="team" prop="team" label="Trans" has-feedback>
          <a-input
            v-model="form.team"
            placeholder="Studio"
            @blur="$refs.team.onFieldBlur()"
          />
        </a-form-model-item>
        <a-form-model-item label="Badge" prop="badge">
          <a-input
            v-model="form.badge"
            placeholder="Badge"
          />
        </a-form-model-item>

        <a-form-model-item v-if="['mod', 'admin'].includes(user.role)" prop="adsense" label="Show Ads">
          <a-switch v-model="form.adsense" />
        </a-form-model-item>

        <a-form-model-item ref="categories" prop="categories" label="Category">
          <template slot="extra">
            <small>
              - Nhấn enter để thêm tag mới.
              <br>
              - Các tag này có thể giúp người đọc tìm kiếm được truyện của
              bạn!
            </small>
          </template>

          <div
            v-if="form.categories.length"
            class="book-tags"
            style="margin-bottom: 8px"
          >
            <a-tag
              v-for="(category, index) in form.categories"
              :key="index"
              class="aic"
              color="red"
              @click="
                form.categories = Object.values(form.categories).filter((value) => value !== category)
              "
            >
              {{ category }}
              <a-icon type="close-circle" theme="filled" />
            </a-tag>
          </div>

          <a-select v-model="form.categories" style="width: 100%" mode="multiple" class="categoriesSelect">
            <a-select-option
              v-for="category in getCategories"
              :key="category.name"
            >
              {{ category.name }}
            </a-select-option>
          </a-select>
        </a-form-model-item>

        <a-form-model-item label="About" prop="content">
          <a-textarea v-model="form.content" placeholder="About" :rows="4" />
        </a-form-model-item>

        <a-form-model-item>
          <a-button type="primary" @click="onSubmit">
            {{ $route.name === 'create' ? 'New' : 'Update' }}
          </a-button>
          <a-button style="margin-left: 10px;" @click="resetForm">
            Đặt Lại
          </a-button>
        </a-form-model-item>
      </a-form-model>
    </a-spin>

    <a-modal
      v-model="visible"
      :width="560"
      title="DI CHUYỂN VÀ CẮT HÌNH CỦA BẠN"
      cancel-text="Huỷ Bỏ"
      ok-text="Cắt Ảnh"
      :confirm-loading="isLoadingImage"
      @ok="uploadCover"
    >
      <client-only>
        <vue-cropper
          id="cropImage"
          ref="cropper"
          output-type="jpg"
          :src="upload.avatar"
          :auto-crop-area="1"
          :crop-box-resizable="false"
          :toggle-drag-mode-on-dblclick="false"
          :drag-mode="'move'"
          :aspect-ratio="3 / 4"
          :view-mode="1"
          :crop-box-movable="false"
          :min-container-height="200"
          :min-crop-box-width="300"
        />
      </client-only>
      <a-button-group class="crop-image-action">
        <a-button icon="left-circle" @click="$refs.cropper.rotate(-90)" />
        <a-button icon="zoom-out" @click="$refs.cropper.relativeZoom(-0.2)" />
        <a-button icon="zoom-in" @click="$refs.cropper.relativeZoom(0.2)" />
        <a-button icon="right-circle" @click="$refs.cropper.rotate(90)" />
      </a-button-group>
    </a-modal>

    <portal to="header-title">
      <span class="header-title">New Comic</span>
    </portal>
    <portal v-if="form._id" to="header">
      <a-button
        type="danger"
        icon="delete"
        size="large"
        :disabled="isLoading"
        @click="showConfirm()"
      >
        XOÁ TRUYỆN
      </a-button>
      <a-button
        v-if="form._id"
        type="primary"
        icon="plus"
        size="large"
        :disabled="isLoading"
        @click="$router.push({name: 'chapter', params: { story: $route.params.id }})"
      >
        CHƯƠNG MỚI
      </a-button>
    </portal>
  </div>
</template>

<script>
import VueCropper from 'vue-cropperjs'
import { mapGetters } from 'vuex'

import { GET_CATEGORIES } from '~/schema/queries/category'
import { DELETE_STORY, PUBLISH_STORY } from '~/schema/mutations/story'
import { MY_STORY } from '~/schema/queries/story'

import helper from '~/plugins/mixins/helper'

export default {
  name: 'NewBook',
  components: {
    VueCropper
  },
  mixins: [helper],
  async asyncData ({ route, app }) {
    if (route.name === 'story-setting') {
      const { data: { myStory } } = await app.apolloProvider.defaultClient.query({
        query: MY_STORY,
        variables: {
          id: parseInt(route.params.id)
        }
      })
      return {
        form: Object.assign({}, myStory, { categories: Object.assign(myStory.categories).map(value => value.name) })
      }
    } else {
      return {
        form: {
          _id: null,
          avatar: '',
          title: '',
          author: '',
          badge: '',
          team: '',
          otherTitle: '',
          adsense: true,
          categories: [],
          content: ''
        }
      }
    }
  },
  apollo: {
    getCategories: {
      query: GET_CATEGORIES
    }
  },
  data () {
    return {
      visible: false,
      isLoadingImage: false,
      isLoading: false,
      form: {
        _id: null,
        avatar: '',
        title: '',
        author: '',
        team: '',
        otherTitle: '',
        adsense: true,
        categories: [],
        content: ''
      },
      upload: {
        avatar: 'https://cdn.webdammy.com/content/1620901903141_22f315e7-5204-456b-8852-6a6d10764cab.jpg'
      },
      rules: {
        avatar: [
          { required: true, message: 'Ảnh bìa là bắt buộc', trigger: 'blur' },
          { type: 'url', message: 'Ảnh bìa không hợp lệ', trigger: 'blur' }
        ],
        title: [
          { required: true, message: 'Tên truyện là bắt buộc', trigger: 'blur' }
        ],
        team: [
          { required: true, message: 'Nhóm dịch là bắt buộc', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters('user', ['user'])
  },
  created () {},
  mounted () {
    this.$nextTick(() => {
      document.querySelector('.categoriesSelect input').setAttribute('placeholder', 'Tìm kiếm thể loại')
    })
  },
  methods: {
    onSubmit () {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.publishStory()
        } else {
          this.$message.error('Kiểm tra thông tin của bạn')
          return false
        }
      })
    },
    resetForm () {
      this.$refs.ruleForm.resetFields()
    },

    async publishStory () {
      this.isLoading = true
      this.$nuxt.$loading.start()
      try {
        const { data: { publishStory } } = await this.$apollo.mutate({
          mutation: PUBLISH_STORY,
          variables: this.form
        })
        if (this.form._id) {
          this.$message.success('Cập nhật thành công')
        } else {
          this.$message.success('Tạo truyện thành công')
          await this.$router.push({
            name: 'story-setting',
            params: { id: publishStory._id }
          })
        }
      } catch (e) {}
      this.$nuxt.$loading.finish()
      this.isLoading = false
    },

    openCropImage ($event) {
      this.upload.avatar = URL.createObjectURL($event.target.files[0])
      this.visible = true
    },

    uploadCover () {
      this.$refs.cropper.getCroppedCanvas().toBlob((data) => {
        if (!data) {
          this.$message.error('Cắt ảnh thất bại')
          return false
        } else {
          this.isLoadingImage = true
          const formData = new FormData()
          formData.append('image', data)
          formData.append('pathName', this.form._id ? `story/${this.form._id}/avatar` : 'temp/book')
          formData.append('type', 'story-avatar')
          this.$nuxt.$loading.start()
          this.$axios
            .post(process.env.BACKEND_DOMAIN + '/upload/single', formData)
            .then(({ data }) => {
              this.form.avatar = data.data
              this.$refs.avatar.onFieldBlur()
            })
            .catch(() => {
              this.$message.error('Cắt ảnh thất bại')
            })
            .finally(() => {
              this.isLoadingImage = false
              this.visible = false
              this.$message.success('Cắt ảnh thành công')
              this.$nuxt.$loading.finish()
            })
        }
      })
    },

    showConfirm () {
      this.$confirm({
        title: 'Bạn chắc muốn xoá chứ?',
        content: 'Toàn bộ nội dung đi kèm truyện sẽ bị xoá !?',
        onOk: () => {
          return this.deleteStory()
        }
      })
    },

    async deleteStory () {
      this.isLoading = true
      this.$nuxt.$loading.start()
      try {
        const { data: { deleteStory } } = await this.$apollo.mutate({
          mutation: DELETE_STORY,
          variables: {
            _id: this.form._id
          }
        })
        if (deleteStory) {
          this.$message.success('Xoá thành công')
          await this.$router.push({ name: 'stories' })
        } else {
          this.$message.error('Xoá thất bại')
        }
      } catch (e) {}
      this.$nuxt.$loading.finish()
      this.isLoading = false
    }
  }
}
</script>
<style>
.book-form {
  width: 400px;
}

#createForm .ant-select-selection__rendered ul .ant-select-selection__choice {
  display: none;
}
#createForm .ant-select-selection__rendered ul input.ant-select-search__field {
  width: max-content;
}
.book-form {
  display: flex;
}
#inputAvatar {
  display: none;
}
#inputAvatar + label {
  width: 120px;
  height: 160px;
  display: block;
  background-size: contain;
}
.loading-avatar {
  width: 120px;
  height: 160px;
}
#inputAvatar ~ button {
  text-transform: lowercase;
  -webkit-font-feature-settings: 'c2sc';
  font-feature-settings: 'c2sc';
  font-variant: small-caps;
  box-shadow: none !important;
  width: 120px;
}

#inputAvatar + label svg {
  position: absolute;
  top: 70%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
  visibility: hidden;
  opacity: 0;
  transition: all 0.25s;
  width: 24px;
  height: 24px;
  fill: white;
  z-index: 11;
}
#inputAvatar + label:before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  visibility: hidden;
  opacity: 0;
  background-color: rgba(72, 3, 234, 0.8);
  transition: all 0.25s;
  border-radius: 5px;
  z-index: 10;
  cursor: pointer;
}
#inputAvatar + label:hover:before {
  visibility: visible;
  opacity: 1;
}
#inputAvatar + label:hover svg {
  opacity: 1;
  visibility: visible;
  top: 50%;
}

#cropImage {
  height: 400px;
}
.crop-image-action {
  width: 250px;
  display: flex;
  align-content: center;
  justify-content: space-around;
  margin: 15px auto 0;
}

#cropImage .cropper-dashed {
  /*border-color: #3b66f4;*/
}

#inputAvatar + label img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
