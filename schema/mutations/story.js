import { gql } from 'apollo-boost'

export const PUBLISH_STORY = gql`
    mutation publishStory(
        $_id: Float
        $title: String!
        $otherTitle: String
        $author: String
        $team: String!
        $avatar: String!
        $content: String
        $adsense: Boolean
        $categories: [String]
        $badge: String
    ) {
        publishStory(
            input: {
                _id: $_id
                title: $title
                otherTitle: $otherTitle
                author: $author
                team: $team
                avatar: $avatar
                content: $content
                adsense: $adsense
                categories: $categories
                badge: $badge
            }
        ) {
            _id
        }
    }
`

export const PUBLISH_CHAPTER = gql`
    mutation publishChapter(
        $_id: Float
        $name: String!
        $avatar: String
        $content: Object!
        $story: Float!,
        $nameExtend: String
        $publishTime: Float
        $note: String
    ) {
        publishChapter(
            input: {
                _id: $_id
                name: $name
                avatar: $avatar
                content: $content
                story: $story
                nameExtend: $nameExtend
                publishTime: $publishTime
                note: $note
            }
        ) {
            _id
        }
    }
`

export const DELETE_CHAPTER = gql`
    mutation deleteChapter($_id: Float!) {
        deleteChapter(_id: $_id) {
            _id
        }
    }
`

export const DELETE_STORY = gql`
    mutation deleteStory($_id: Float!) {
        deleteStory(_id: $_id) {
            _id
        }
    }
`

export const SORT_MY_CHAPTERS = gql`
    mutation sortMyChapters($ids: [Float!], $_id: Float!) {
        sortMyChapters(ids: $ids, _id: $_id)
    }
`

export const IMPORT_STORY = gql`
  mutation importStory($site: String!, $source: String!) {
    importStory(site: $site, source: $source) {
      _id
    }
  }
`
