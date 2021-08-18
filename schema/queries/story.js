import { gql } from 'apollo-boost'

export const MY_STORY = gql`
  query myStory($id: Float!) {
    myStory(id: $id) {
      _id
      title
      otherTitle
      author
      team
      avatar
      content
      adsense
      categories {
        _id
        name
        slug
      }
      badge
      updatedAt
      createdAt
      source
    }
  }
`

export const MY_STORIES = gql`
  query myStories($order: String! $sort: Int! $page: Int! $limit: Int!) {
    myStories(order: $order, sort: $sort, page: $page, limit: $limit) {
      _id
      title
      avatar
      slug
      updatedAt
      countChapter
      categories {
        _id
        name
      }
      user {
        _id
        name
      }
      views
    }
  }
`

export const COUNT_STORIES = gql`
  query countStories {
    countStories
  }
`

export const GET_CHAPTERS = gql`
  query myChapters($id: Float!) {
    myChapters(id: $id) {
      _id
      name
      nameExtend
      avatar
      createdAt
      views
      postActive
    }
  }
`

export const MY_CHAPTER = gql`
  query myChapter($id: Float!) {
    myChapter(id: $id) {
      _id
      name
      nameExtend
      avatar
      slug
      content
      postActive
      publishTime
      note
    }
  }
`

export const SEARCH_STORIES = gql`
  query searchMyStories($keyword: String! $size: Int!) {
    searchMyStories(keyword: $keyword, size: $size) {
      _id
      title
      otherTitle
      author
      team
      avatar
      content
      adsense
      views
      countChapter
      categories {
        _id
        name
        slug
      }
      updatedAt
      createdAt
    }
  }
`
