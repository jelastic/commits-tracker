import React, { Component } from 'react'
import eskape from 'eskape'
import { TreeTable } from 'primereact/treetable'
import { Column } from 'primereact/column'

import './TreeGrid.css'
import {CommitsNodeService} from "../../../service/CommitsNodeService";
import ModuleIcon from './../../modules/module-icon/ModuleIcon'
import projects from '../../../data/projects'
import accounts from '../../../data/accounts'
import {Button} from "primereact/button";

export class TreeGrid extends Component {
    constructor(props) {
        super(props)

        let currentModules = null

        if (props.modules && props.modules !== 'all') {
            let moduleKeys = props.modules.split(',')

            currentModules = []

            for (const key of moduleKeys) {
                if (projects.keys[key]) {
                    currentModules.push(projects.keys[key])
                }
            }
        }

        this.state = {
            nodes: [],
            expandedKeys: {},
            loading: true,
            account: accounts.keys[props.account],
            period: props.period,
            modules: currentModules
        };

        this.nodeService = new CommitsNodeService()
        this.ref = React.createRef()

        this.onExpand = this.onExpand.bind(this)
    }

    componentDidMount() {
        //todo: find better solution
        this.ref.current.container.querySelector(".p-treetable-scrollable-body").style.overflowY = "auto"
        //

        projects.getProjects().then(() => {
            setTimeout(() => {
                this.setState({
                    loading: false,
                    nodes: this.loadNodes()
                })
            }, 500)
        })
    }

    loadNodes() {
        let currentModules = projects.data;

        if (this.state.modules && this.state.modules[0]) {
            let keys = {}

            for (const item of this.state.modules) {
                keys[item.key] = item
            }

            currentModules = [];

            for (const item of projects.data) {
                if (keys[item.key]) {
                    currentModules.push(item)
                }
            }
        }

        return currentModules;
    }

    setAsyncState = (newState) =>
        new Promise((resolve) => this.setState(newState, resolve))

    reset(state) {
        this.setAsyncState(state).then(() => {
            this.setState({
                ...state,
                loading: false,
                expandedKeys: {},
                nodes: this.loadNodes()
            })
        })
    }

    onExpand(event) {
        if (!event.node.children && this.props.period) {
            this.setState({ loading: true });

            const data = event.node.data
            const account = this.state.account
            const dateFrom = this.state.period[0]
            const dateTo = this.state.period[1]
            const lazyNode = { ...event.node }

            this.nodeService.getTreeTableNodes(data.type, account, data.projectId, dateFrom, dateTo, data.group).then(childNodes => {
                lazyNode.children = childNodes || []

                if (lazyNode.children.length === 0) {
                    lazyNode.children.push({ data: { shortId: "No commits found" }})
                }

                function applyNode(node, key, lazyNode) {
                    for (let i = 0, n = node.children.length; i < n; i++) {
                        const childNode = node.children[i];

                        if (childNode.children) {
                            applyNode(childNode, key, lazyNode)
                        } else if (childNode.key === key) {
                            node.children[i] = lazyNode;
                            break;
                        }
                    }
                }

                // todo: improve
                const nodes = this.state.nodes.map(node => {
                    if (node.children) {
                        applyNode(node, event.node.key, lazyNode)
/*                        for (let i = 0, n = node.children.length; i < n; i++) {
                            const childNode = node.children[i];

                            if (childNode.key === event.node.key) {
                                node.children[i] = lazyNode;
                                break;
                            }
                        }*/
                    } else if (node.key === event.node.key) {
                        node = lazyNode;
                    }

                    return node;
                });

                this.setState({
                    loading: false,
                    nodes: nodes
                });
            })
        }
    }

    commitHashTemplate(node) {
        let shortId = node.data.shortId;
        let webUrl = node.data.webUrl;

        return <a href={webUrl} target="_blank" rel="noreferrer">{shortId}</a>;
    }

    titleTemplate(node) {
        if (node.data.title) {
            let title = eskape`${node.data.title}`.replace(/(JE|OB|SUP|WHMCS|K8S)-[1-9]\d+/g, issueId =>
                `<a target="_blank" rel="noreferrer" href="https://jelastic.team/browse/${issueId}">${issueId}</a>`
            )

            return (
                <>
                    <a className="commit-hash" href={node.data.webUrl} target="_blank" rel="noreferrer">{node.data.shortId}</a>
                    <span className="commit-title" dangerouslySetInnerHTML={{ __html: title }} />
                </>
            )
        }

        // let icon = (node.data.type === "GitLab") ? GitLabIcon : GitHubIcon;
        let className = (node.data.shortId && !node.data.type && !node.data.title) ? 'p-text-secondary' : ''

        return (
            <span className="module-row">
                { node.data.type && <ModuleIcon type={node.data.type} isGroup={node.data.group}/> }
                <span className={className}>{node.data.shortId}</span>

                { node.data.url && <Button
                    icon="pi pi-external-link p-treetable-toggler-icon"
                    className="p-button-rounded p-button-text"
                    onClick={() => window.open(node.data.url)}
                />}
          </span>
        )
    }

    authorTemplate(node) {
        return (
            <>
                {node.data.authorName}
                {
                    node.data.committerEmail !== node.data.authorEmail ||
                    node.data.committerName !== node.data.authorName ? '*' : ''
                }
            </>
        )
    }

    render() {
        return (
            <TreeTable
                className="commit-tree"
                columnResizeMode="fit"
                value={this.state.nodes}
                ref={this.ref}
                loading={this.state.loading}
                expandedKeys={this.state.expandedKeys}
                onToggle={e => this.setState({expandedKeys: e.value})}
                onExpand={this.onExpand}
                selectionMode="single"
                scrollHeight="100%"
                scrollable
                resizableColumns
                lazy
            >
                {/*<Column field="shortId" style={{width:"35%"}} header="ID" body={this.commitHashTemplate} expander />*/}
                <Column field="title" header="Title" body={this.titleTemplate} expander />
                <Column field="committerName" header="Author" body={this.authorTemplate} style={{width:'20%'}}/>
                <Column field="committedDate" header="Date" style={{width:'15%'}}/>
            </TreeTable>
        )
    }
}