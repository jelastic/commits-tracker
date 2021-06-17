import React, { Component } from 'react';
import { MultiSelect } from 'primereact/multiselect'
import ModuleIcon from '../module-icon/ModuleIcon'
// import GitLabIcon from './../../images/gitlab-icon.svg'
// import GitHubIcon from './../../images/github-icon.svg'

export class ModulesMultiSelect extends Component {
  constructor(props) {
    super(props)

    const modules = props.options

    this.state = {
      selectedModules: null
    }

    this.modules = modules
    this.onModulesChange = this.onModulesChange.bind(this)
  }

  componentDidMount () {
    this.isComponentMounted = true
  }

  componentWillUnmount () {
    this.isComponentMounted = false
  }

  setAsyncState = (newState) =>
    new Promise((resolve) => this.setState(newState, resolve))

  onModulesChange(e) {
    if (this.isComponentMounted) {
      this.setAsyncState({ selectedModules: e.value }).then(() => {
        if (this.props.onChange) {
          this.props.onChange(e)
        }
      })
    }
  }

  selectedAccountTemplate(option, props) {
    if (option) {
      return (
        // <div className="">
          <div>{option.name}</div>
        // </div>
      );
    }

    return (
      <span>
        {props.placeholder}
      </span>
    );
  }

  moduleTemplate(option) {
    return (
      <div className="x-item">
        <ModuleIcon type={option.data.type} />
        <span>{option.name}</span>
      </div>
    );
  }

  render() {
    return (
        <MultiSelect
            onChange={this.onModulesChange}
            value={this.state.selectedModules}
            optionLabel="name"
            placeholder="Select Modules"
            filter
            display="chip"
            itemTemplate={this.moduleTemplate}
            {...this.props}
        />
    )
  }
}

