import React from 'react'

import './FilterForm.css'
import { Panel } from 'primereact/panel'
import { AccountDropdown } from '../../accounts/account-dropdown/AccountDropdown'
import { Calendar } from 'primereact/calendar'
import { Button } from 'primereact/button'
import { ModulesMultiSelect } from '../../modules/modules-multi-select/ModulesMultiSelect'
import ConfirmationDialog from "../../common/confirmation-dialog/ConfirmationDialog"
import ExportDialog from "../export-dialog/ExportDialog";
import accounts from '../../../data/accounts'
import projects from '../../../data/projects'

export default class FilterForm  extends React.Component {
  constructor (props) {
    super(props)

/*    projects.getProjects().then(() => {
      let currentModules = null

      if (props.modules && props.modules !== 'all') {
        let moduleKeys = props.modules.split(',')

        currentModules = []

        for (const key of moduleKeys) {
          if (projects.keys[key]) {
            currentModules.push(projects.keys[key])
          }
        }

        this.setAsyncState({ modules: currentModules }).then(() => {
          if (this.props.onInput) {
            this.props.onInput(this.state)
          }
        })

      }
    })*/

    this.state = {
      account: accounts.keys[props.account],
      period: props.period || [new Date(), new Date()],
      displayConfirmation: false,
      downloadReport: false,
      exporting: props.download,
      modules: null
    }

    this.calendarRef = React.createRef()
  }

  submitHandler = event => {
    event.preventDefault()
    if (this.props.onSubmit) {
      this.props.onSubmit(this.state)
    }
  }

  setAsyncState = (newState) =>
    new Promise((resolve) => this.setState(newState, resolve))

  changeInputHandler = event => {
    this.setAsyncState(prev => { return { ...prev, ...{ [event.target.name]: event.target.value } } }).then(() => {
      if (this.props.onInput) {
        this.props.onInput(this.state)
      }
    })
  }

  changePeriodHandler = event => {
    this.setAsyncState(prev => { return { ...prev, ...{ [event.target.name]: event.target.value } } }).then(() => {
      let period = event.target.value;
      if (this.props.onInput && period && period[0] && period[1]) {
        this.props.onInput(this.state)
        this.calendarRef.current.hideOverlay()
      }
    })
  }

  onExport() {

  }

  componentDidMount () {
    let period = this.state.period

    if (this.props.onInput && period && period[0] && period[1]) {
      this.props.onInput(this.state)
    }
  }

  render() {
    return (
      <Panel className="commits-filter-form" collapsed>
        <form onSubmit={this.submitHandler}>
           <div className="p-formgroup-inline">
            <div className="p-field">
              <label htmlFor="account" className="p-sr-only">Account</label>
              <ModulesMultiSelect
                name="modules"
                value={this.state.modules}
                className="filter-form-modules"
                options={projects.data}
                onChange={this.changeInputHandler}
              />
            </div>
            <div className="p-field">
              <label htmlFor="account" className="p-sr-only">Account</label>
              <AccountDropdown
                name="account"
                value={this.state.account ? this.state.account.id : null}
                options={accounts}
                onChange={this.changeInputHandler}
              />
            </div>
            <div className="p-field">
              <Calendar
                ref={this.calendarRef}
                name="period"
                value={this.state.period}
                onChange={this.changePeriodHandler}
                selectionMode="range"
                dateFormat="dd.mm.yy"
                yearRange="2010:2030"
                maxDate={new Date()}
                monthNavigator
                yearNavigator
                keepInvalid
                showOtherMonths
                selectOtherMonths
                readOnlyInput
                showWeek
                showIcon
                required
              />
            </div>
             <div className="p-field">
               <Button
                   icon="pi pi-download"
                   className="p-button-raised p-button-secondary"
                   label="Export"
                   type="button"
                   onClick={() => {
                     this.setAsyncState({ displayConfirmation: true }).then(() => {
                       console.log(this.state)
                     })
                   }}
               />
             </div>
            {this.state.displayConfirmation ?
                <ConfirmationDialog
                    onHide={() => this.setState({ displayConfirmation: false })}
                    onSubmit={() => this.setState({ exporting: true })}>
                  Export data?
                </ConfirmationDialog> : null
            }

            {this.state.exporting ?
                <ExportDialog
                    account={this.state.account}
                    period={this.state.period}
                    modules={this.state.modules}
                    onHide={() => this.setState({ exporting: false })}
                /> : null
            }
          </div>
        </form>
      </Panel>
    )
  }
}