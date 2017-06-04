import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './Chat.css'
import ChatInput from './ChatInput'
import ChatMessages from './ChatMessages'
import { graphql, compose } from 'react-apollo'
import gql from 'graphql-tag'
import Dropzone from 'react-dropzone'

const createMessage = gql`
  mutation createMessage($text: String!, $conversationId: Int!) {
    createMessage(text: $text, conversationId: $conversationId) {
      id
      text
      conversation {
        id
      }
    }
  }
`

const allMessages = gql`
  query allMessages($conversationId: Int!) {
    allMessages(conversationId: $conversationId)
    {
      id
      text
    }
  }
`

const newMessageSubscription = gql`
  subscription onMessageAdded($conversationId: Int!){
    messageAdded(conversationId: $conversationId){
      id
      text
    }
  }
`


class Chat extends Component {

  static propTypes = {
    conversationId: PropTypes.number.isRequired,
    allMessagesQuery: PropTypes.any.isRequired,
    mainColor: PropTypes.string.isRequired,
    profileImageURL: PropTypes.string.isRequired,
  }

  _timer = null

  state = {
    message: '',
    isUploadingImage: false,
  }

  componentDidMount() {
    this._subscribeToNewMessages(this)
  }

  render() {

    if (this.props.allMessagesQuery.loading) {
      return (
        <div
          className='loading-container'
        >
          <div
            style={{ backgroundColor: this.props.mainColor || 'rgba(0,0,0,.5)' }}
            className='loading' />
        </div>
      )
    }

    return (
      <Dropzone
        className='dropzone relative'
        onDrop={this._onFileDrop}
        accept='image/*'
        multiple={false}
        disableClick={true}
      >
        <div className='message-body chat-container'>
          <ChatMessages
            messages={this.props.allMessagesQuery.allMessages || []}
            userSpeechBubbleColor={this.props.mainColor}
            profileImageURL={this.props.profileImageURL}
          />
          {this.state.isUploadingImage && <div className='upload-image-indicator'>Uploading image ...</div>}
          <ChatInput
            message={this.state.message}
            onTextInput={message => this.setState({ message })}
            onResetText={() => this.setState({ message: '' })}
            onSend={this._onSend}
            onDrop={this._onFileDrop}
          />
        </div>
      </Dropzone>
    )
  }

  _onSend = () => {
    console.debug('Send message: ', this.state.message, this.props.conversationId, this.props.createMessageMutation)
    this.props.createMessageMutation({
      variables: {
        text: this.state.message,
        conversationId: this.props.conversationId,
      }
    })
  }

  _subscribeToNewMessages = (componentRef) => {
    this.subscription = this.props.allMessagesQuery.subscribeToMore({
      document: newMessageSubscription,
      variables: {
        conversationId: this.props.conversationId
      },
      updateQuery: (previousState, { subscriptionData }) => {

        if (!subscriptionData.data) {
          return previousState;
        }
        const newMessage = subscriptionData.data.messageAdded
        const messages = previousState.allMessages ? [...previousState.allMessages, newMessage] : [newMessage];
        return {
          allMessages: messages
        }
      },
      onError: (err) => {
        console.error('Chat - An error occured while being subscribed: ', err, 'Subscribe again')
        componentRef._subscribeToNewMessages(componentRef)
      }
    })
  }

  _onFileDrop = (acceptedFiles, rejectedFiles) => {

  }

}

export default compose(
  graphql(allMessages, { name: 'allMessagesQuery' }),
  graphql(createMessage, { name: 'createMessageMutation' })
)(Chat)
