import React from 'react'
import './ConfirmationDialog.css'
import {Dialog} from "primereact/dialog"
import {Button} from "primereact/button"

export default class ConfirmationDialog extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            visible: true
        }

        this.onHideHandler = this.onHideHandler.bind(this)
        this.onSubmitHandler = this.onSubmitHandler.bind(this)
    }

    onHideHandler() {
        this.setState({ visible: false })

        if (this.props.onHide) {
            this.props.onHide()
        }
    }

    onSubmitHandler() {
        this.onHideHandler()

        if (this.props.onSubmit) {
            this.props.onSubmit()
        }
    }

    renderFooter() {
        return (
            <div>
                <Button label="No" onClick={this.onHideHandler} className="p-button-text" />
                <Button label="Yes" icon="pi pi-check" onClick={this.onSubmitHandler} className="p-button-raised" autoFocus />
            </div>
        );
    }

    render() {
        return (
            <Dialog header="Confirmation"
                    className="confirmation-dialog"
                    visible={this.state.visible} modal style={{ width: '350px' }}
                    position="top"
                    footer={this.renderFooter()}
                    onHide={this.onHideHandler}>
                <div className="confirmation-content">
                    <i className="pi pi-exclamation-triangle p-mr-3" style={{ fontSize: '2rem' }} />
                    <span>{this.props.children}</span>
                </div>
            </Dialog>
        )
    }
}
