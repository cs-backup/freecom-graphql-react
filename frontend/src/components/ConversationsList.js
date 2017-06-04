import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './ConversationsList.css'
import ConversationItem from './ConversationItem'

class ConversationsList extends Component {

  static propTypes = {
    onSelectConversation: PropTypes.func.isRequired,
    companyName: PropTypes.string.isRequired,
    companyLogoURL: PropTypes.string.isRequired,
  }

  render() {
    return (
      <div className='conversation-list'>
        {this.props.conversations.map((conversation, i) => {
          return (conversation.messages.length > 0 && <ConversationItem
            key={i}
            conversation={conversation}
            onSelectConversation={this.props.onSelectConversation}
            companyName={this.props.companyName}
            companyLogoURL={this.props.companyLogoURL}
          />)
        })}
      </div>
    )
  }

}

export default ConversationsList
