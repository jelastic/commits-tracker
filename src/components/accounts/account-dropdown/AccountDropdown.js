import React, { Component } from 'react';
import { Dropdown } from 'primereact/dropdown'

export class AccountDropdown extends Component {
  constructor(props) {
    super(props)

    const accounts = props.options

    this.state = {
      selectedAccount: accounts ? accounts.keys[props.value] : null
    }

    this.accounts = accounts.data
    this.onAccountChange = this.onAccountChange.bind(this)
  }

  componentDidMount () {
    this.isComponentMounted = true
  }

  componentWillUnmount () {
    this.isComponentMounted = false
  }

  onAccountChange(e) {
    if (this.isComponentMounted) {
      this.setState({ selectedAccount: e.value })

      if (this.props.onChange) {
        this.props.onChange(e)
      }
    }
  }

  selectedAccountTemplate(option, props) {
    if (option) {
      return (
        <div className="">
          {/*<img alt={option.name} src="showcase/demo/images/flag_placeholder.png" onError={(e) => e.target.src='https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png'} className={`flag flag-${option.code.toLowerCase()}`} />*/}
          <div>{option.name}</div>
        </div>
      );
    }

    return (
      <span>
        {props.placeholder}
      </span>
    );
  }

  render() {
    return (
      <>
        <Dropdown
          {...this.props}
          value={this.state.selectedAccount}
          options={this.accounts}
          onChange={this.onAccountChange}
          valueTemplate={this.selectedAccountTemplate}
          placeholder="Select an Account"
          optionLabel="name"
          filterBy="name"
          filter
          showClear
        />
      </>
    )
  }
}

