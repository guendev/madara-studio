import { gql } from 'apollo-boost'

export const GET_CATEGORIES = gql`
  query getCategories {
    getCategories {
      _id
      name
      slug
    }
  }
`
