import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './ChatHeader.css'
import './App.css'
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'
import { timeDifferenceForDate } from '../utils'

const lastMessageOfCurrentAgent = gql`
  query lastMessageOfCurrentAgent($agentId: ID!) {
    Agent(id: $agentId) {
      id
      messages(last: 1) {
        id
        createdAt
      }
    }
  }
`

class ChatHeader extends Component {

  static propTypes = {
    resetConversation: PropTypes.func.isRequired,
    chatPartnerName: PropTypes.string.isRequired,
    profileImageUrl: PropTypes.string.isRequired,
    headerColor: PropTypes.string.isRequired,
    created: PropTypes.string,
    agentId: PropTypes.string,
    shouldDisplayBackButton: PropTypes.bool,
  }

  render() {
    const headerSubtitle = this._generateHeaderSubtitle()
    return (
      <div
        style={{ backgroundColor: this.props.headerColor }}
        className='header flex header-padding-chat items-center header-shadow'
      >
        {this.props.shouldDisplayBackButton &&
          <div className='radius fadeInLeft flex flex-center back-button pointer' onClick={this.props.resetConversation}>
            <i className='material-icons'>keyboard_arrow_left</i>
          </div>
        }
        <div className='padding-10 flex'>
          <img
            src={this.props.profileImageUrl}
            alt=''
            className='avatar fadeInLeft'></img>
          <div className='fadeInLeft gutter-left conversation-title'>
            {this.props.chatPartnerName}
            <p className='fadeInLeft text-opaque'>{headerSubtitle}</p>
          </div>
        </div>
      </div>
    )
  }

  _generateHeaderSubtitle = () => {
    let headerSubtitle = ''
    if (this.props.lastMessageOfCurrentAgentQuery && !this.props.lastMessageOfCurrentAgentQuery.loading) {
      const lastMessage = this.props.lastMessageOfCurrentAgentQuery.Agent.messages[0]
      headerSubtitle = 'Last active ' + timeDifferenceForDate(lastMessage.createdAt)
    } else {
      headerSubtitle = 'Created ' + this.props.created
    }
    return headerSubtitle
  }

}

export default graphql(lastMessageOfCurrentAgent, {
  skip: (ownProps) => {
    return !Boolean(ownProps.agentId)
  },
  name: "lastMessageOfCurrentAgentQuery"
})(ChatHeader)
