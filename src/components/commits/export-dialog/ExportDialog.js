import React, {Component} from "react"
import PropTypes from 'prop-types'
import Moment from "moment"

import {Dialog} from "primereact/dialog"
import {ProgressBar} from "primereact/progressbar"
import {CommitsNodeService} from "../../../service/CommitsNodeService"
import {Button} from "primereact/button"
import DownloadReport from "../download-report/DownloadReport"
import modules from "../../../data/projects"
import { DEFAULT_SHORT_DATE_FORMAT } from "../../../constants"

export default class ExportDialog extends Component {
    static propTypes = {
        account: PropTypes.object,
        period: PropTypes.arrayOf(PropTypes.instanceOf(Date)),
        modules: PropTypes.arrayOf(PropTypes.object),
        onHide: PropTypes.func
    }

    constructor(props) {
        super(props)

        this.state = {
            visible: true,
            exported: false,
            progress: 0,
            current: 0,
            total: 0,
            subProgress: 0,
            subCurrent: 0,
            subTotal: 0,
            currentModule: "",
            dataSet: null,
            filename: this.formatFilename(props)
        }

        this.nodesService = new CommitsNodeService()
        this.progressValueTemplate = this.progressValueTemplate.bind(this)
        this.onHideHandler = this.onHideHandler.bind(this)
    }

    formatFilename(props) {
        return 'commits_' + (props.account ? props.account.name :  'all').replace(/[\s.,-/]/g, '_').toLowerCase() +
            '_' +
            (props.period[0] ? Moment(props.period[0]).format(DEFAULT_SHORT_DATE_FORMAT) : '').replace(/[\s.,-/]/g, '_') +
            '_' +
            (props.period[1] ? Moment(props.period[1]).format(DEFAULT_SHORT_DATE_FORMAT) : '').replace(/[\s.,-/]/g, '_')

    }

    onHideHandler() {
        this.setState({ visible: false })

        if (this.props.onHide) {
            this.props.onHide()
        }
    }

    async export() {
        const dataSet = []
        const currentModules = this.props.modules || modules.data

        for (let i = 0, n = currentModules.length; i < n; i++) {
            if (!this.isComponentMounted) {
                break
            }

            const module = currentModules[i]
            if (module.leaf) continue

            this.setState({
                total: n,
                currentModule: `${module.name}...`
            });

            const type = module.data.type
            const account = this.props.account
            const projectId = module.data.projectId
            const dateFrom = this.props.period[0]
            const dateTo = this.props.period[1]
            const isGroup = module.data.group

            const data = await this.nodesService.getNodes(type, account, projectId, dateFrom, dateTo, isGroup, false,
                (repoName, repo, repoIndex, reposTotal) => {
                    if (this.isComponentMounted) {
                        this.setState({
                            subProgress: ((repoIndex + 1 ) / reposTotal) * 100,
                            subCurrent: repoIndex + 1,
                            subTotal: reposTotal,
                            currentModule: `${module.name} (${repoName})...`
                        })
                    }

                    return this.isComponentMounted
                }
            )

            dataSet.push({ module, data })

            if (this.isComponentMounted) {
                this.setState({
                    subTotal: 0,
                    current: i + 1,
                    progress: ((i + 1) / n) * 100
                });
            }
        }

        return dataSet
    }

    componentWillUnmount() {
        //@todo: Get rid of isComponentMounted Anti-pattern. Implement cancellation instead
        this.isComponentMounted = false
    }

    componentDidMount() {
        //@todo: Get rid of isComponentMounted Anti-pattern. Implement cancellation instead
        this.isComponentMounted = true

        this.export().then(dataSet => {
            if (this.isComponentMounted) {
                this.setState({ exported: true, currentModule: "Completed", dataSet })
                console.log("finish", dataSet)
            }
        })
    }

    progressValueTemplate() {
        return (
            <>
                {this.state.current}/{this.state.total}
            </>
        );
    }

    renderFooter() {
        return (
            <div style={{ textAlign: "center", paddingLeft: "3px" }}>
                {this.state.exported ?
                    <Button label="Close" icon="pi pi-check" onClick={this.onHideHandler}
                            className="p-button-raised p-button-success"/> :
                    <Button label="Cancel" icon="pi pi-times" onClick={this.onHideHandler}
                            className="p-button-raised p-button-warning"/>
                }
            </div>
        );
    }

    render() {
        return (
            <Dialog header="Export"
                    visible={this.state.visible}
                    style={{ width: '350px' }}
                    footer={this.renderFooter()}
                    position="center"
                    closable={false}
                    onHide={() => this.setState({ visible: false })}
                    modal>
                <span className="p-text-secondary">{this.state.currentModule}</span>
                <ProgressBar value={this.state.progress} displayValueTemplate={this.progressValueTemplate} />
                { this.state.subTotal > 0 && <ProgressBar color="#607D8B" style={{height: "6px"}} value={this.state.subProgress} showValue={false} /> }
                { this.state.exported && <DownloadReport filename={this.state.filename} dataSet={this.state.dataSet}/> }
            </Dialog>
        )
    }
}