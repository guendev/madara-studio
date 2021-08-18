<template>
  <div>
    <a-spin :spinning="isLoading">
      <a-table :columns="columns" :data-source="myChapters" row-key="_id">
        <nuxt-link
          slot="name"
          slot-scope="name, chapter"
          :to="{
            name: 'chapter-edit',
            params: {
              story: $route.params.id,
              chapter: chapter._id
            }
          }"
          class="chapter-name"
          :class="{
            _has_thumb: chapter.avatar
          }"
        >
          <div v-if="chapter.avatar" class="chapter-avatar">
            <img :src="chapter.avatar" alt="">
          </div>
          <span class="c-name">
            {{ name }} {{ chapter.nameExtend ? ` - ${chapter.nameExtend}` : '' }}
          </span>
        </nuxt-link>
        <span slot="postActive" slot-scope="text">
          <a-tag v-if="text === 0" color="blue">Lịch Đăng</a-tag>
          <a-tag v-else-if="text === 1" color="green">Thành Công</a-tag>
        </span>
        <span slot="customCreatedAt" slot-scope="updatedAt">
          {{ $moment(updatedAt).format('ll') }}
        </span>
        <span slot="action" slot-scope="text, chapter">
          <a-button
            size="small"
            type="primary"
            class="custom-btn-font"
            @click="$router.push(
              { name: 'chapter-edit',
                params: {
                  story: $route.params.id,
                  chapter: chapter._id
                } }
            )"
          >
            Biên Tập
          </a-button>
          <a-popconfirm
            title="Bạn chắc chứ?"
            ok-text="Xoá"
            cancel-text="Thôi"
            @confirm="deleteChapter(chapter._id)"
          >
            <a-button size="small" type="danger" class="custom-btn-font" icon="delete" />
          </a-popconfirm>
        </span>
      </a-table>
    </a-spin>
    <portal to="header">
      <a-button
        type="primary"
        icon="setting"
        size="large"
        ghost
        @click="$router.push({ name: 'story-setting', params: { id: $route.params.id } })"
      />
      <a-button
        type="primary"
        icon="menu"
        size="large"
        ghost
        @click="$router.push({ name: 'story-sort', params: { id: $route.params.id } })"
      />
      <a-button
        type="primary"
        icon="plus"
        size="large"
        @click="$router.push({ name: 'chapter', params: { story: $route.params.id } })"
      >
        CHƯƠNG MỚI
      </a-button>
    </portal>
    <portal to="header-title">
      <span class="header-title">
        {{ story.title }}
      </span>
    </portal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { GET_CHAPTERS, MY_STORY } from '~/schema/queries/story'
import { DELETE_CHAPTER } from '~/schema/mutations/story'

const columns = [
  {
    title: 'Chương',
    dataIndex: 'name',
    key: 'name',
    scopedSlots: { customRender: 'name' }
  },
  {
    title: 'Lượt Xem',
    dataIndex: 'views',
    key: 'views',
    align: 'center'
  },
  {
    title: 'Trạng Thái',
    key: 'postActive',
    dataIndex: 'postActive',
    scopedSlots: { customRender: 'postActive' },
    align: 'center'
  },
  {
    title: 'Đăng Tải',
    dataIndex: 'updatedAt',
    key: 'createdAt',
    align: 'center',
    scopedSlots: { customRender: 'customCreatedAt' }
  },
  {
    title: 'Hành Động',
    key: 'action',
    scopedSlots: { customRender: 'action' },
    align: 'right'
  }
]

export default {
  name: 'StoryPage',
  async asyncData ({ app, route }) {
    const { data: { myStory } } = await app.apolloProvider.defaultClient.query({
      query: MY_STORY,
      variables: {
        id: parseInt(route.params.id)
      }
    })
    return {
      story: myStory
    }
  },
  data () {
    return {
      columns,
      isLoading: false,
      story: {}
    }
  },
  computed: {
    ...mapGetters('user', ['user'])
  },
  apollo: {
    myChapters: {
      query: GET_CHAPTERS,
      variables () {
        return {
          id: parseInt(this.$route.params.id)
        }
      },
      fetchPolicy: 'network-only'
    }
  },
  methods: {
    async deleteChapter (_id) {
      this.isLoading = true
      this.$nuxt.$loading.start()
      try {
        const { data: { deleteChapter } } = await this.$apollo.mutate({
          mutation: DELETE_CHAPTER,
          variables: {
            _id
          }
        })
        if (deleteChapter) {
          this.$message.success('Xoá thành công')
          this.myChapters = Object.values(this.myChapters).filter(value => value._id !== _id)
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
.chapter-avatar {
  width: 150px;
  border-radius: 4px;
  overflow: hidden;
  display: inline-block;
  border: 2px solid #eff2f5;
  margin-right: 10px;
}
.chapter-avatar img {
  transition: all 0.3s;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.chapter-avatar:hover img {
  transform: scale(1.1);
}
.chapter-name._has_thumb {
  display: flex;
}
.chapter-name._has_thumb .c-name {
  margin-top: 10px;
}
</style>
