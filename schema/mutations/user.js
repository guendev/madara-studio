import { gql } from 'apollo-boost'

export const SIGN_IN = gql`
  mutation signinUser($email: String!, $password: String!) {
    signinUser(email: $email password: $password) {
      token
    }
  }
`
