import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App'
import './index.css'
import ApolloClient, { createNetworkInterface } from 'apollo-client'
import { ApolloProvider } from 'react-apollo'
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws'
import { API_ENDPOINT, SUBSCRIPTION_ENDPOINT } from './constants'

const wsClient = new SubscriptionClient(SUBSCRIPTION_ENDPOINT);

const networkInterface = createNetworkInterface({ uri: API_ENDPOINT })

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient
)

const client = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
  connectToDevTools: true,
  dataIdFromObject: o => o.id,
})

const freecom = {
  render,
  companyName: 'GoBike',
  companyLogoURL: 'https://techsauce.co/wp-content/uploads/2016/05/GoBike-logo.png',
  mainColor: '#F58220'
}

function render(element) {

  if (!element) {
    const root = document.createElement('div')
    root.id = '__freecom-root__'
    document.body.appendChild(root)
    element = root
  }

  ReactDOM.render(
    <ApolloProvider client={client}>
      <App freecom={freecom} />
    </ApolloProvider>
    ,
    element
  )
}

render(document.getElementById('__freecom-root__'))