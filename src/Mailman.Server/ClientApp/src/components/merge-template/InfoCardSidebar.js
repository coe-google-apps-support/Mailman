import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import DeleteIcon from '@material-ui/icons/Delete'
import PlayIcon from '@material-ui/icons/PlayArrow'
import CreateIcon from '@material-ui/icons/Create'
import ViewIcon from '@material-ui/icons/Visibility'
import { IconButton } from '@material-ui/core'
// import { Link } from 'react-router-dom'
import Tooltip from '@material-ui/core/Tooltip'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import PropTypes from 'prop-types'
import MailmanLink from '../MailmanLink'


const styles = theme => ({
  smallIcon: {
    width: 32,
    height: 32,
    padding: 0,
  },
  root: {
    paddingTop: 0,
    paddingBottom: 0,
  },
  iconList: {
    paddingTop: 50,
  },
})

class InfoCardSidebar extends Component {
  constructor(props) {
    super(props)
  }

  getMergeTemplateFromID(templateID) {
    // returns the index of the mergeTemplate (in props) or null if not exist
    if (!this.props.mergeTemplates) {
      return null
    }
    for (let i = 0; i < this.props.mergeTemplates.length; i++) {
      if (this.props.mergeTemplates[i]['id'] === templateID) {
        return this.props.mergeTemplates[i]
      }
    }
    return null
  }

  render() {
    const { classes } = this.props

    return (
      <div>
        <List disablePadding={true} className={classes.iconList}>
          <ListItem className={classes.root}>
            <IconButton className={classes.smallIcon}>
              <Tooltip title="Delete" placement="left">
                <DeleteIcon style={{ color: 'red' }} />
              </Tooltip>
            </IconButton>
          </ListItem>
          <ListItem className={classes.root}>
            <IconButton className={classes.smallIcon}>
              <Tooltip title="Run" placement="left">
                <PlayIcon style={{ color: 'green' }} />
              </Tooltip>
            </IconButton>
          </ListItem>
          <ListItem className={classes.root}>
            <IconButton className={classes.smallIcon}>
              <MailmanLink to={`/mergeTemplate/${this.props.id}`}>
                <Tooltip title="Edit" placement="left">
                  <CreateIcon style={{ color: 'grey' }} />
                </Tooltip>
              </MailmanLink>
            </IconButton>
          </ListItem>
          <ListItem className={classes.root}>
            <IconButton className={classes.smallIcon}>
              <Tooltip title="Preview" placement="left">
                <ViewIcon style={{ color: 'black' }} />
              </Tooltip>
            </IconButton>
          </ListItem>
        </List>
      </div>
    )
  }
}

InfoCardSidebar.propTypes = {
  mergeTemplates: PropTypes.array.isRequired,
  deleteMergeTemplate: PropTypes.func.isRequired,
}

export default withStyles(styles, { withTheme: true })(InfoCardSidebar)
