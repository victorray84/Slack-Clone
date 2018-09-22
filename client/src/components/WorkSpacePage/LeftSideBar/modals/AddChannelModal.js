import React from "react";
import {
  Form,
  Input,
  Button,
  Modal,
  Checkbox,
  Dropdown
} from "semantic-ui-react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { InlineError } from "@/components/common";
import { validateForm } from "@/utils";
import { channelAction } from "@/actions";
import {
  getCurrentTeam,
  getCurrentUser,
  getCurrentTeamMembers,
  getError
} from "@/reducers";

class AddChannelModal extends React.Component {
  state = {
    clientError: {},
    members: [],
    isChannelPrivate: true,
    channelName: ""
  };

  componentWillUnmount() {
    this.setState({
      clientError: {},
      members: [],
      isChannelPrivate: true,
      channelName: ""
    });
  }

  handleChange = e => {
    const { name, value } = e.target;
    this.setState({
      [name]: value
    });
  };

  handleSubmit = async () => {
    // validate user's login info on client side
    const clientError = validateForm.addChannel(this.state);
    this.setState({ clientError });

    // proceed to send data to server if there's no error
    if (Object.keys(clientError).length === 0) {
      const { createChannel, currentTeam, onClose } = this.props;
      const { channelName, isChannelPrivate, members } = this.state;
      createChannel({
        teamId: currentTeam.id,
        channelName,
        isPublic: !isChannelPrivate,
        membersList: members
      });
      this.setState({
        clientError: {},
        members: [],
        isChannelPrivate: true,
        channelName: ""
      });
      onClose();
    }
  };

  handleClose = e => {
    const { onClose } = this.props;
    e.preventDefault();
    this.setState({
      clientError: {},
      members: [],
      isChannelPrivate: true,
      channelName: ""
    });
    onClose();
  };

  toggleCheckboxValue = e => {
    this.setState({
      clientError: {},
      isChannelPrivate: !this.state.isChannelPrivate
    });
  };

  render() {
    const { open, currentTeamMembers, currentUser } = this.props;
    const { channelName, isChannelPrivate, members, clientError } = this.state;

    return (
      <Modal size="small" open={open} onClose={this.handleClose}>
        <Modal.Header>
          {!isChannelPrivate ? (
            <span>Create Public Channel</span>
          ) : (
            <span>Create Private Channel</span>
          )}
        </Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label>Channel name:</label>
              {clientError.channelName && (
                <InlineError text={clientError.channelName} />
              )}
              <Input
                value={channelName}
                onChange={this.handleChange}
                name="channelName"
                fluid
                placeholder="# random channel"
              />
            </Form.Field>
            <Form.Field>
              <Checkbox
                toggle
                value={!isChannelPrivate}
                label="Public"
                onChange={this.toggleCheckboxValue}
              />
            </Form.Field>
            {isChannelPrivate ? (
              <Form.Field>
                <label>Select members to join your private channel:</label>
                {clientError.members && (
                  <InlineError text={clientError.members} />
                )}
                <Dropdown
                  placeholder="# username"
                  fluid
                  multiple
                  search
                  selection
                  value={members}
                  options={currentTeamMembers
                    .filter(member => member.id !== currentUser.id)
                    .map(member => ({
                      key: member.id,
                      value: member.id,
                      text: member.username
                    }))}
                  onChange={(e, { value }) => {
                    this.setState({
                      members: value
                    });
                  }}
                />
              </Form.Field>
            ) : (
              <div style={{ fontSize: "20px" }}>
                <i className="users icon " />{" "}
                <span className="">{currentTeamMembers.length} members</span>
              </div>
            )}
            <br />
            <Form.Group widths="equal">
              <Button type="button" onClick={this.handleSubmit} fluid>
                Create Channel
              </Button>
              <Button type="button" fluid onClick={this.handleClose}>
                Cancel
              </Button>
            </Form.Group>
          </Form>
        </Modal.Content>
      </Modal>
    );
  }
}

const stateToProps = state => ({
  currentTeam: getCurrentTeam(state),
  currentUser: getCurrentUser(state),
  currentTeamMembers: getCurrentTeamMembers(state),
  error: getError(state)
});

const dispatchToProps = dispatch => ({
  createChannel: channelFormInfo => {
    dispatch(channelAction.createChannel(channelFormInfo));
  }
});
AddChannelModal.propTypes = {
  open: PropTypes.bool.isRequired,
  createChannel: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default connect(
  stateToProps,
  dispatchToProps
)(AddChannelModal);
