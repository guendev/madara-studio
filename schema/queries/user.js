import { gql } from 'apollo-boost'

export const GET_MY_ACCOUNT = gql`
  query me {
    me {
      _id
      name
      email
      avatar
      role
    }
  }
`
