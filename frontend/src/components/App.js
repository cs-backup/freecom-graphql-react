import React, { Component } from 'react'
import cx from 'classnames'
import './App.css'
import Chat from './Chat'
import ChatHeader from './ChatHeader'
import ConversationsList from './ConversationsList'
import ConversationsListHeader from './ConversationsListHeader'
import ToggleOpeningStateButton from './ToggleOpeningStateButton'
import { graphql, compose, withApollo } from 'react-apollo'
import gql from 'graphql-tag'
import { timeDifferenceForDate, sortConversationByDateCreated } from '../utils'
import {
  TEST_WITH_NEW_CUSTOMER, FREECOM_CUSTOMER_ID_KEY, FREECOM_CUSTOMER_NAME_KEY,
  IS_DEMO, DEMO_CUSTOMER
} from '../constants'

const findConversations = gql`
  query allConversations($customerId: Int!) {
    allConversations(customerId: $customerId){
      id
      messages {
        id
        text
      }
    }
  }
`

const createConversation = gql`
  mutation createConversation($customerId: Int!) {
    createConversation(customerId: $customerId) {
      id
      messages {
        id
        text
      }
    }
  }
`


class App extends Component {

  _timer = null

  state = {
    isOpen: true,
    selectedConversationId: null,
    conversations: [],
  }

  async componentDidMount() {
    // TESTING
    if (TEST_WITH_NEW_CUSTOMER) {
      localStorage.removeItem(FREECOM_CUSTOMER_ID_KEY)
      localStorage.removeItem(FREECOM_CUSTOMER_NAME_KEY)
    }

    const customerId = localStorage.getItem(FREECOM_CUSTOMER_ID_KEY)
    const username = localStorage.getItem(FREECOM_CUSTOMER_NAME_KEY)

    if (customerId && username) {
      // customer already exists, find all conversations for that customer
      this._loadConversations(customerId)
    } else {
      // customer doesn't exist yet, create new
      this._setupNewCustomer()
    }
  }

  render() {
    const customerId = localStorage.getItem(FREECOM_CUSTOMER_ID_KEY)
    const shouldRenderChat = this.state.selectedConversationId && customerId
    const panelStyles = cx(`panel drop-shadow radius overflow-hidden ${this.state.isOpen ? 'fadeInUp' : 'hide'}`)
    return (
      <div className='App'>
        <div>
          <div className='container'>
            <div className={panelStyles}>
              {shouldRenderChat ? this._renderChat(customerId) : this._renderConversationsList()}
            </div>
            <ToggleOpeningStateButton
              isOpen={this.state.isOpen}
              togglePanel={this._togglePanel}
              mainColor={this.props.freecom.mainColor}
            />
          </div>
        </div>
      </div>
    )
  }

  _renderConversationsList = () => {
    return (
      <span>
        <ConversationsListHeader
          mainColor={this.props.freecom.mainColor}
          companyName={this.props.freecom.companyName}
        />
        <div className='body overflow-y-scroll overflow-x-hidden'>
          <ConversationsList
            conversations={this.state.conversations}
            onSelectConversation={this._onSelectConversation}
            companyLogoURL={this.props.freecom.companyLogoURL}
            companyName={this.props.freecom.companyName}
          />
          <div className='flex flex-hcenter full-width conversation-button-wrapper pointer-events-none'>
            <div
              className='conversation-button background-darkgray drop-shadow-hover pointer flex-center flex pointer-events-initial'
              onClick={() => this._initiateNewConversation()}
            >
              <p>New Conversation</p>
            </div>
          </div>
        </div>
      </span>
    )
  }

  _renderChat = (customerId) => {
    const { freecom } = this.props
    const selectedConversation = this.state.conversations.find(c => c.id === this.state.selectedConversationId)
    const hasConversation = this.state.conversations.length > 0;
    const { agent } = selectedConversation
    const chatPartnerName = agent ? selectedConversation.agent.slackUserName : freecom.companyName
    const profileImageUrl = agent && agent.imageUrl ? agent.imageUrl : freecom.companyLogoURL
    const created = timeDifferenceForDate(selectedConversation.updatedAt)
    return (
      <span>
        <ChatHeader
          chatPartnerName={chatPartnerName}
          agentId={selectedConversation.agent ? selectedConversation.agent.id : null}
          headerColor={freecom.mainColor}
          resetConversation={this._resetConversation}
          profileImageUrl={profileImageUrl}
          created={created}
          shouldDisplayBackButton={selectedConversation.messages.length > 0 || hasConversation}
        />
        <Chat
          conversationId={this.state.selectedConversationId}
          mainColor={freecom.mainColor}
          customerId={customerId}
          resetConversation={this._resetConversation}
          secondsUntilRerender={this.state.secondsUntilRerender}
          profileImageURL={freecom.companyLogoURL}
        />
      </span>
    )
  }

  _setupNewCustomer = async () => {

    if (IS_DEMO) {
      localStorage.setItem(FREECOM_CUSTOMER_ID_KEY, DEMO_CUSTOMER.id);
      localStorage.setItem(FREECOM_CUSTOMER_NAME_KEY, DEMO_CUSTOMER.username);
    } else {
      // TODO: setup new customer
    }

  }

  _loadConversations = async (customerId) => {
    const findConversationsResult = await this.props.client.query({
      query: findConversations,
      variables: {
        customerId
      }
    })
    const sortedConversations = findConversationsResult.data.allConversations.slice()
    sortedConversations.sort(sortConversationByDateCreated)

    const shouldOpenEmptyConversation =
      sortedConversations.length === 1 && sortedConversations[0].messages.length === 0

    this.setState({
      conversations: sortedConversations,
      selectedConversationId: shouldOpenEmptyConversation ? sortedConversations[0].id : null
    })
  }

  _initiateNewConversation = () => {
    const customerId = localStorage.getItem(FREECOM_CUSTOMER_ID_KEY)
    const username = localStorage.getItem(FREECOM_CUSTOMER_NAME_KEY)
    const emptyConversation = this.state.conversations.find(c => c.messages.length === 0)
    if (emptyConversation) {
      this.setState({ selectedConversationId: emptyConversation.id })
    } else {
      this._createNewConversation(customerId, username)
    }
  }

  _createNewConversation = async (customerId, username) => {
    // create new conversation for the customer
    const result = await this.props.createConversationMutation({
      variables: {
        customerId: customerId
      }
    })
    const conversationId = result.data.createConversation.id
    const newConversations = this.state.conversations.concat([result.data.createConversation])
    this.setState({
      conversations: newConversations,
      selectedConversationId: conversationId,
    })
  }

  _onSelectConversation = (conversation) => {
    this.setState({
      selectedConversationId: conversation.id,
    })
  }

  _resetConversation = () => {
    this.setState({
      selectedConversationId: null,
    })
  }

  _togglePanel = () => this.setState({ isOpen: !this.state.isOpen })
}

const appWithMutations = compose(
  graphql(createConversation, { name: 'createConversationMutation' }),
)(App)

export default withApollo(appWithMutations)
