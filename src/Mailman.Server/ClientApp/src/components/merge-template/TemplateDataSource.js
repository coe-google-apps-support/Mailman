import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Hint from './Hint'
import Button from '@material-ui/core/Button'
import TableChartIcon from '@material-ui/icons/TableChart'
import TextField from '@material-ui/core/TextField'
import MuiReactAutosuggest from '../merge-template/MuiReactAutosuggest'

const styles = theme => ({
  root: {
    width: '90%',
  },
  text: {
    marginRight: theme.spacing.unit * 2,
  },
  sheetButton: {
    color: '#2FA464',
    margin: theme.spacing.unit,
    fontSize: 32,
  },
  sheetcontainer: {
    display: 'inline-block',
    margin: theme.spacing.unit,
  },
})

class TemplateDataSource extends Component {
  constructor(props) {
    super(props)
  }

  showSheetPicker() {
    alert('This will help you pick your Google Sheet.')
  }

  onTabChange = newValue => {
    this.props.handleChange('sheetName')({ target: { value: newValue } })
  }

  render() {
    const { value, classes, handleChange, tabs, sheetId } = this.props

    // Transform tabs to match autocomplete format
    const tabValues = tabs.tabs.map(value => {
      return { label: value }
    })

    return (
      <div className={classes.root}>
        {!sheetId && (
          <div>
            <Paper elevation={1} className={classes.sheetcontainer}>
              <Button onClick={this.showSheetPicker}>
                <TableChartIcon className={classes.sheetButton} />
                Google Sheet
              </Button>
            </Paper>
            <Hint title="This Google Sheet contains your data." />
          </div>
        )}
        <div>
          <span className={classes.text}>
            <MuiReactAutosuggest
              placeholder="Tab..."
              suggestions={tabValues}
              callback={this.onTabChange}
              value={this.props.tab}
            />
          </span>
          <Hint title="This tab must contain all the information you may want to send in an email." />
        </div>
        <div>
          <TextField
            required
            className={classes.text}
            label="Row"
            margin="normal"
            value={this.props.row}
            onChange={this.props.handleChange('headerRowNumber')}
          />
          <Hint title="Mailman will use this to swap out template tags." />
        </div>
      </div>
    )
  }
}

TemplateDataSource.propTypes = {
  tab: PropTypes.string.isRequired,
  row: PropTypes.number.isRequired,
  tabs: PropTypes.shape({
    loading: PropTypes.bool,
    tabs: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  sheetId: PropTypes.string,
  handleLoadTabs: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
}

export default withStyles(styles, { withTheme: true })(TemplateDataSource)