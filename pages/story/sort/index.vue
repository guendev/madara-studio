<template>
  <div>
    <portal to="header-title">
      <span class="header-title">
        {{ story.title }}
      </span>
    </portal>
    <portal to="header">
      <a-button
        type="primary"
        icon="check"
        size="large"
        :disabled="nochapter || isLoading"
        @click="sort()"
      >
        LƯU LẠI
      </a-button>
    </portal>
    <a-spin v-if="chapters.length" :spinning="isLoading">
      <draggable v-model="chapters" class="list-chapters" v-bind="dragOptions">
        <transition-group type="transition" name="flip-list" draggable=".ant-list-item">
          <div v-for="(chapter) in chapters" :key="chapter.name.toString()" class="ant-list-item">
            <span>{{ chapter.name }}</span>
            <a-icon type="menu" />
          </div>
        </transition-group>
      </draggable>
    </a-spin>
    <div v-if="nochapter" class="no-chapter">
      <img src="/images/no-chapter.png" alt="">
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'

import { GET_CHAPTERS, MY_STORY } from '~/schema/queries/story'
import { SORT_MY_CHAPTERS } from '~/schema/mutations/story'

export default {
  name: 'SortChapters',
  components: { draggable },
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
      isLoading: false,
      chapters: [],
      nochapter: false
    }
  },
  computed: {
    dragOptions () {
      return {
        animation: 200,
        group: 'description',
        disabled: false,
        ghostClass: 'ghost'
      }
    }
  },
  apollo: {
    myChapters: {
      query: GET_CHAPTERS,
      variables () {
        return {
          id: parseInt(this.$route.params.id)
        }
      },
      manual: true,
      result ({ data, loading }) {
        if (!loading) {
          this.chapters = data.myChapters
          this.nochapter = !data.myChapters.length
        }
      },
      fetchPolicy: 'network-only'
    }
  },
  methods: {
    async sort () {
      this.isLoading = true
      try {
        const ids = []
        this.chapters.forEach((value) => {
          ids.push(value._id)
        })
        await this.$apollo.mutate({
          mutation: SORT_MY_CHAPTERS,
          variables: {
            _id: this.story._id,
            ids
          }
        })
        this.$message.success('Thay đổi thành công')
      } catch (e) {
        this.$message.error('Thay đổi thất bại')
      }
      this.isLoading = false
    }
  }
}
</script>
<style>
.list-chapters {
  max-width: 800px;
  margin: 0 auto;
}
.list-chapters .ant-list-item {
  cursor: move;
  overflow: hidden;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  border-bottom: 1px solid #f3f3f4;
}

.list-chapters .sortable-fallback {
  background: white;
  box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.16);
}

.flip-list-move {
  transition: transform 0.3s;
}
.no-move {
  transition: transform 0s;
}
.ghost {
  opacity: 0.3;
  background: #c8ebfb;
}
.no-chapter {
  text-align: center;
}
.no-chapter img {
  height: 500px;
  margin-top: 50px;
}
</style>
