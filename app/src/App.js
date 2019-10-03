import { InMemoryCache } from 'apollo-cache-inmemory'
import ApolloClient from 'apollo-client'
import { split } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import gql from 'graphql-tag'
import React from 'react'
import { ApolloProvider, Mutation, Subscription } from 'react-apollo'

function App({ authState }) {
  const isIn = authState.status === 'in'

  const headers = isIn ? { Authorization: `Bearer ${authState.token}` } : {}

  const httpLink = new HttpLink({
    uri: 'https://cloudynotes.herokuapp.com/v1/graphql',
    headers,
  })

  const wsLink = new WebSocketLink({
    uri: 'wss://cloudynotes.herokuapp.com/v1/graphql',
    options: {
      reconnect: true,
      connectionParams: {
        headers,
      },
    },
  })

  const link = split(
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query)
      return kind === 'OperationDefinition' && operation === 'subscription'
    },
    wsLink,
    httpLink,
  )

  const client = new ApolloClient({
    link,
    cache: new InMemoryCache(),
  })

  const NOTE = gql`
  subscription NOTE($userId: String!) {
    note {
      title
    }
  }
  `

  return (
    <ApolloProvider client={client}>
      <Subscription
        subscription={NOTE}
        variables={
          isIn
            ? {
              userId: authState.user.uid,
            }
            : null
        }
      >
        {({ data, loading, error }) => {
          if (loading) return 'loading...'
          if (error) return error.message
          return (
            <div>
              {/* @TODO */}
            </div>
          )
        }}
      </Subscription>
    </ApolloProvider>
  );
}

export default App;
