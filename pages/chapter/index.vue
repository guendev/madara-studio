<template>
  <div>
    <a-spin :spinning="isLoading">
      <a-form-model id="form-chapter" ref="ruleForm" layout="vertical" :rules="rules" :model="form">
        <a-row>
          <a-col span="6">
            <a-form-model-item ref="name" class="chapter-name" prop="name" has-feedback>
              <a-input
                v-model="form.name"
                placeholder="Chapter 1"
                size="large"
                :max-length="70"
                @blur="$refs.name.onFieldBlur()"
              />
            </a-form-model-item>
          </a-col>
          <a-col span="17" offset="1">
            <a-form-model-item ref="nameExtend" class="chapter-name" prop="nameExtend">
              <a-input
                v-model="form.nameExtend"
                placeholder="Tên Mở Rộng"
                size="large"
                :max-length="70"
              />
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col span="6">
            <a-form-model-item ref="avatar" prop="avatar">
              <a-spin :spinning="isLoadingImage" class="chapter-avatar-overlay">
                <input
                  id="inputChapterAvatar"
                  type="file"
                  name="inputAvatar"
                  accept="image/*"
                  @change="openCropImage($event)"
                >
                <label class="pr" for="inputChapterAvatar">
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
          </a-col>
          <a-col span="17" offset="1">
            <a-form-model-item ref="note" class="chapter-name" prop="note">
              <a-input
                v-model="form.note"
                placeholder="Ghi Chú Chương"
                size="large"
                :max-length="70"
              />
              <template slot="extra">
                <small>
                  - Cảnh báo xuất hiện ở đầu chương truyện.
                </small>
              </template>
            </a-form-model-item>
          </a-col>
        </a-row>
        <div class="chapter-content">
          <div class="comic-tool-bar">
            <div class="comic-tool-label">
              Nội Dung({{ form.content.length }})
            </div>
            <div v-if="form.content.length && !uploading">
              <a-button
                v-if="editting && imageSelected.length"
                size="small"
                type="danger"
                @click="deleteSelected()"
              >
                Xoá ({{ imageSelected.length }})
              </a-button>
              <a-button
                size="small"
                type="primary"
                :icon="editting ? 'check' : 'edit'"
                @click="editting = !editting"
              />
            </div>
          </div>
          <a-form-model-item>
            <input
              id="comicInput"
              accept=".jpg,.jpeg,.png,.webp"
              multiple="multiple"
              name="content"
              type="file"
              :disabled="editting"
              @change="uploadChapterImage($event)"
            >
          </a-form-model-item>
          <draggable
            v-model="form.content"
            class="comic-area"
            :class="{
              _isEditting: editting
            }"
            draggable=".real-item"
          >
            <a-spin
              v-for="(image, index) in form.content"
              :key="index"
              class="image-item real-item"
              :class="{
                _selected: imageSelected.includes(image.content) && editting
              }"
              :spinning="!!image.spinning"
            >
              <template v-if="editting">
                <input
                  :id="image.content"
                  v-model="imageSelected"
                  :value="image.content"
                  type="checkbox"
                >
                <a-button
                  v-if="!imageSelected.includes(image.content)"
                  class="delete-button"
                  size="small"
                  type="danger"
                  icon="delete"
                  @click="removeOneImage(image.content)"
                />
                <label :for="image.content" class="pa t0 l0 select-mark">
                  <a-icon class="will-be-delete" type="check-circle" />
                </label>
              </template>
              <img
                :src="image.content"
                alt=""
              >
            </a-spin>
            <div class="j_input_image">
              <label id="labelInput" for="comicInput" class="pr">
                <a-icon type="plus-circle" />
                <img src="/images/blank-image.jpeg" alt="">
              </label>
              <a-button type="primary" icon="upload" size="small" block>
                Tải Lên
              </a-button>
            </div>
            <div class="j_placeholder image-item" />
            <div class="j_placeholder image-item" />
            <div class="j_placeholder image-item" />
            <div class="j_placeholder image-item" />
          </draggable>
        </div>
      </a-form-model>
    </a-spin>
    <portal v-if="myStory" to="header-title">
      <span class="header-title">
        {{ myStory.title }}
      </span>
    </portal>
    <portal to="header">
      <a-button
        v-if="!form._id || form.postActive === 0"
        icon="clock-circle"
        size="large"
        class="_scheduler"
        type="primary"
        ghost
        :disabled="uploading || isLoading || editting"
        @click="setScheduler()"
      >
        LỊCH ĐĂNG
      </a-button>
      <a-button
        v-if="form._id"
        type="danger"
        icon="delete"
        size="large"
        :disabled="uploading || isLoading || editting"
        @click="showConfirm()"
      >
        XOÁ
      </a-button>
      <a-button
        type="primary"
        icon="check"
        size="large"
        :disabled="uploading || isLoading || editting"
        @click="onSubmit()"
      >
        ĐĂNG TẢI
      </a-button>
    </portal>
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
          :key="upload.avatar"
          output-type="jpg"
          :src="upload.avatar"
          :auto-crop-area="1"
          :crop-box-resizable="false"
          :toggle-drag-mode-on-dblclick="false"
          :drag-mode="'move'"
          :aspect-ratio="224 / 140"
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
    <a-modal
      v-model="timeScheduler"
      title="THIẾT LẬP THỜI GIAN ĐĂNG"
      cancel-text="Huỷ Bỏ"
      ok-text="HẸN GIỜ"
      :confirm-loading="isLoading"
      @ok="schedulerChapter()"
    >
      <div style="margin-bottom: 10px">
        <a-date-picker v-model="publishTime.date" format="YYYY-MM-DD" :disabled-date="disabledDate" />
        <a-time-picker v-model="publishTime.time" :default-open-value="$moment()" format="HH:mm" />
      </div>
      <small>
        - Hẹn giờ đăng chương của bạn.
        <br>
        - Thời gian đăng thực tế có thể chậm hơn 10 phút so với dự kiến!
      </small>
    </a-modal>
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import VueCropper from 'vue-cropperjs'

import { MY_CHAPTER, MY_STORY } from '~/schema/queries/story'
import { DELETE_CHAPTER, PUBLISH_CHAPTER } from '~/schema/mutations/story'

export default {
  name: 'ChapterPage',
  components: { draggable, VueCropper },
  async asyncData ({ route, app }) {
    if (route.name === 'chapter-edit') {
      const { data: { myChapter } } = await app.apolloProvider.defaultClient.query({
        query: MY_CHAPTER,
        variables: {
          id: parseInt(route.params.chapter)
        }
      })
      return {
        form: myChapter
      }
    } else {
      return {
        form: {
          name: '',
          nameExtend: '',
          avatar: '',
          content: [],
          note: ''
        }
      }
    }
  },
  data () {
    return {
      form: {},
      imageSelected: [],
      editting: false,
      uploading: false,
      isLoading: false,
      visible: false,
      isLoadingImage: false,
      timeScheduler: false,
      rules: {
        name: [
          { required: true, message: 'Tên chương là bắt buộc', trigger: 'blur' }
        ]
      },
      upload: {
        avatar: 'https://cdn.webdammy.com/content/1620901903141_22f315e7-5204-456b-8852-6a6d10764cab.jpg'
      },
      publishTime: {
        date: '',
        time: ''
      }
    }
  },

  apollo: {
    myStory: {
      query: MY_STORY,
      variables () {
        return {
          id: parseInt(this.$route.params.story)
        }
      }
    }
  },

  created () {
    if (this.form._id && this.form.postActive === 0) {
      this.publishTime.time = this.$moment(this.form.publishTime)
      this.publishTime.date = this.$moment(this.form.publishTime)
    }
  },

  methods: {

    disabledDate (current) {
      // Can not select days before today and today
      return current < this.$moment().subtract(1, 'day')
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
          formData.append('pathName', `story/${this.$route.params.story}/chapters/avatar`)
          formData.append('type', 'chapter-avatar')
          this.$nuxt.$loading.start()
          this.$axios
            .post(process.env.BACKEND_DOMAIN + '/upload/single', formData)
            .then(({ data }) => {
              this.form.avatar = data.data
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

    openCropImage ($event) {
      this.upload.avatar = URL.createObjectURL($event.target.files[0])
      this.visible = true
    },

    onSubmit () {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.publishChapter()
        } else {
          this.$message.error('Kiểm tra thông tin của bạn')
          return false
        }
      })
    },

    setScheduler () {
      this.$refs.ruleForm.validate((valid) => {
        if (valid) {
          this.timeScheduler = true
        } else {
          this.$message.error('Kiểm tra thông tin của bạn')
          return false
        }
      })
    },

    schedulerChapter () {
      if (!this.publishTime.time || !this.publishTime.date) {
        return this.$message.error('Thời gian đăng không hợp lệ')
      }
      const date = this.publishTime.date.format('DD/MM/YYYY')
      const time = this.publishTime.time.format('h:mm')
      const publishTime = this.$moment(date + ' ' + time, 'DD/MM/YYYY h:mm').valueOf()
      if (publishTime < Date.now()) {
        return this.$message.error('Lịch đăng đã qua')
      }
      this.timeScheduler = false
      this.publishChapter(publishTime)
    },

    async publishChapter (scheduler) {
      this.isLoading = true
      this.$nuxt.$loading.start()
      try {
        const { data: { publishChapter } } = await this.$apollo.mutate({
          mutation: PUBLISH_CHAPTER,
          variables: Object.assign({}, this.form, { story: this.myStory._id, publishTime: scheduler || null })
        })
        if (this.form._id) {
          this.$message.success('Cập nhật thành công')
        } else {
          this.$message.success('Tạo chương thành công')
          this.$router.push({ name: 'chapter-edit', params: { chapter: publishChapter._id, story: this.myStory._id } })
        }
      } catch (e) {
        console.log(e)
      }
      this.$nuxt.$loading.finish()
      this.isLoading = false
    },

    removeOneImage (content) {
      this.form.content = this.form.content.filter((value) => {
        return value.content !== content
      })
      this.$message.success('Xoá thành công')
    },

    deleteSelected () {
      this.form.content = this.form.content.filter((value) => {
        return !this.imageSelected.includes(value.src)
      })
      this.imageSelected = []
      this.$message.success('Xoá thành công')
    },

    async uploadChapterImage ($event) {
      this.uploading = true
      const count = this.form.content.length
      const files = Array.from($event.target.files)
      await Promise.all(
        files.map(async (value, index) => {
          const data = {
            content: URL.createObjectURL(value),
            spinning: true
          }
          this.form.content.push(data)
          await this.uploadImage(value, count + index)
        })
      )
      this.uploading = false
    },
    async uploadImage (file, index) {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('pathName', `story/${this.$route.params.story}/chapters/content`)
      formData.append('type', 'chapter-content')
      try {
        const {
          data: { data }
        } = await this.$axios.post(
          process.env.BACKEND_DOMAIN + '/upload/single',
          formData
        )
        this.$nuxt.$set(this.form.content, index, {
          content: data,
          spinning: false
        })
      } catch (e) {
        this.$message.error('Upload bị lỗi')
      }
    },

    showConfirm () {
      this.$confirm({
        title: 'Bạn chắc muốn xoá chứ?',
        content: 'Toàn bộ nội dung đi kèm chương sẽ bị xoá !?',
        onOk: () => {
          return this.deleteChapter()
        }
      })
    },

    async deleteChapter () {
      this.isLoading = true
      this.$nuxt.$loading.start()
      try {
        const { data: { deleteChapter } } = await this.$apollo.mutate({
          mutation: DELETE_CHAPTER,
          variables: {
            _id: this.form._id
          }
        })
        if (deleteChapter) {
          this.$message.success('Xoá thành công')
          await this.$router.push({
            name: 'story',
            params: { id: this.$route.params.story }
          })
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
.delete-chapter-avatar-button {
  position: absolute;
  top: 10px;
  left: 150px;
}
#form-chapter {
  padding: 24px 64px 32px;
  max-width: 1200px;
  margin: 0 auto;
}
#form-chapter  .chapter-name input, #form-chapter .chapter-name input:focus {
  border: none;
  outline: 0;
  box-shadow: none;
  width: 100%;
  font-size: 28px;
  font-weight: 600;
  padding-left: 0;
  margin-bottom: 10px;
}
.chapter-avatar-overlay {
  width: 244px;
}

#form-chapter  .chapter-name {
  margin-bottom: 10px;
}
#comicInput {
  display: none;
}
.j_input_image {
  margin: 10px;
}
#labelInput {
  width: 150px;
  display: block;
  height: 212px;
  position: relative;
  box-shadow: 2px 0 8px rgb(0 0 0 / 4%), 12px 0 24px rgb(64 64 64 / 4%);
  border: 3px solid #eff2f5;
}
#labelInput img {
  width: 100%;
}
#labelInput:hover {
  cursor: pointer;
}
#labelInput~button {
  text-transform: lowercase;
  font-feature-settings: "c2sc","smcp";
  font-variant: small-caps;
  box-shadow: none!important;
  width: 150px;
  margin-top: 8px;
}
#labelInput i {
  position: absolute;
  font-size: 30px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  transition: 0.2s;
}
#labelInput:before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #3b66f466;
  transition: 0.2s;
}
.comic-area .image-item {
  width: 150px;
  height: 212px;
  margin: 10px 10px 20px;
  overflow: hidden;
  transition: all 0.2s;
}
.comic-area .image-item img {
  width: 100%;
}
.comic-area .image-item:not(.j_placeholder) {
  box-shadow: 2px 0 8px rgb(0 0 0 / 4%), 12px 0 24px rgb(64 64 64 / 4%);
  border: 3px solid #eff2f5;
}

.comic-area._isEditting .image-item:not(.j_placeholder) {
  animation: shake 1s;
  animation-iteration-count: infinite;
}
.comic-area {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;
}
.j_input_image {
  margin: 10px;
}

.comic-tool-bar {
  border-bottom: 1px solid rgba(18, 18, 23, 0.1);
  padding-bottom: 15px;
  margin-bottom: 20px;
  color: #cccccc;
  display: flex;
  justify-content: space-between;
  align-content: center;
}

.inputSelectLabel {
  width: 100%;
  background: #f5f5fa;
  box-shadow: 2px 0 8px rgb(0 0 0 / 4%), 12px 0 24px rgb(64 64 64 / 4%);
  padding: 5px;
  transition: all 0.2s;
  z-index: 1;
}
.image-item._selected img {
  filter: blur(1px);
  transform: scale(0.9);
}

.image-item img {
  transition: all 0.2s;
}

.comic-area .image-item._selected {
  border: 3px solid #ff4d4f;
}

@keyframes shake {
  0% {
    transform: translate(1px, 1px) rotate(0deg);
  }
  10% {
    transform: translate(-1px, -2px) rotate(-1deg);
  }
  20% {
    transform: translate(-3px, 0px) rotate(1deg);
  }
  30% {
    transform: translate(3px, 2px) rotate(0deg);
  }
  40% {
    transform: translate(1px, -1px) rotate(1deg);
  }
  50% {
    transform: translate(-1px, 2px) rotate(-1deg);
  }
  60% {
    transform: translate(-3px, 1px) rotate(0deg);
  }
  70% {
    transform: translate(3px, 1px) rotate(-1deg);
  }
  80% {
    transform: translate(-1px, -1px) rotate(1deg);
  }
  90% {
    transform: translate(1px, 2px) rotate(0deg);
  }
  100% {
    transform: translate(1px, -2px) rotate(-1deg);
  }
}

.comic-area .image-item .delete-button {
  position: absolute;
  box-shadow: 2px 0 8px rgb(0 0 0 / 4%), 12px 0 24px rgb(64 64 64 / 4%);
  z-index: 3;
}
.comic-area .image-item input {
  display: none;
}
.comic-area .image-item .select-mark {
  width: 150px;
  height: 200px;
  z-index: 2;
  position: absolute;
}
.comic-area .image-item .select-mark .will-be-delete {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  transition: all 0.2s;
}
.comic-area .image-item._selected .select-mark .will-be-delete {
  transform: translate(-50%, -50%) scale(1);
}
.comic-area .image-item .select-mark .will-be-delete svg {
  width: 45px;
  height: 45px;
  fill: #f5222d;
}
#inputChapterAvatar {
  display: none;
}
#inputChapterAvatar + label {
  width: 224px;
  height: 140px;
  display: block;
  overflow: hidden;
  border-radius: 4px;
}
#inputChapterAvatar + label img {
  width: 100%;
  transition: all 0.2s;
}
#inputChapterAvatar + label i {
  position: absolute;
  font-size: 30px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  transition: 0.2s;
  opacity: 0;
  transition: all 0.2s;
}
#inputChapterAvatar + label:hover {
  cursor: pointer;
}
#inputChapterAvatar + label:hover img {
  filter: blur(1px) brightness(0.95);
}
#inputChapterAvatar + label:hover i {
  opacity: 1;
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

</style>
