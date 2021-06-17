import Moment from "moment"

import GitLabService from "./GitLabService"
import GitHubService from "./GitHubService"

import {GITLAB, DEFAULT_DISPLAY_DATE_FORMAT, SLASH, GITHUB, GITLAB_ROOT_GROUP_PREFIX} from "../constants";

const ENV = window.ENV

//@todo: improve design & remove duplicated code
export class CommitsNodeService {
    constructor() {
        this.gitLabService = new GitLabService(ENV.GITLAB_SERVER_URL, ENV.GITLAB_TOKEN)
        this.gitHubService = new GitHubService(ENV.GITHUB_TOKEN)
    }

    getTreeTableNodes(type, account, projectId, dateFrom, dateTo, isGroup) {
        return this.getNodes(type, account, projectId, dateFrom, dateTo, isGroup, true)
    }

    getNodes(type, account, projectId, dateFrom, dateTo, isGroup, isTableNode, onRepoChanged) {
        if (type === GITLAB) {
            return this.getGitLabNodes(account, projectId, dateFrom, dateTo, isGroup, isTableNode, onRepoChanged)
        }

        return this.getGitHubNodes(account, projectId, dateFrom, dateTo, isGroup, isTableNode, onRepoChanged)
    }

    async getGitLabNodes(account, projectId, dateFrom, dateTo, isGroup, isTableNode, onRepoChanged) {
        if (isGroup) {
            return this.getGitLabGroupNodes({ account, projectId, dateFrom, dateTo, isTableNode, onRepoChanged })
        }

        return this.getGitLabCommitNodes(account, projectId, dateFrom, dateTo, isTableNode)
    }

    async getGitLabGroupNodes({ account, projectId, dateFrom, dateTo, isTableNode, onRepoChanged }) {
        let nodes = []

        if (isTableNode) {
            const repos = await this.gitLabService.getSubgroups(projectId)

            for (const repo of repos) {
                nodes.push({
                    key: projectId + repo.id,
                    parentKey: projectId,
                    leaf: false,
                    data: {
                        type: GITLAB,
                        shortId: repo.name,
                        group: true,
                        projectId: repo.id,
                        url: repo.web_url
                    }
                })
            }

            const groupProjects = await this.gitLabService.getAllGroupProjects(projectId)

            for (const groupProject of groupProjects) {
                nodes.push({
                    key: projectId + groupProject.id,
                    parentKey: projectId,
                    leaf: false,
                    data: {
                        type: GITLAB,
                        shortId: groupProject.name,
                        projectId: groupProject.id,
                        url: groupProject.http_url_to_repo
                    }
                })
            }

        } else {
            const repos = await this.gitLabService.getAllSubgroupProjects(projectId)

            for (let i = 0, n = repos.length; i < n; i++) {
                const repo = repos[i]

                if (onRepoChanged && !onRepoChanged(repo.name, repo, i, n)) {
                    break
                }

                const repoNodes = await this.getGitLabCommitNodes(account, repo.id, dateFrom, dateTo, isTableNode)

                if (repoNodes.length) {
                    nodes.push({shortId: repo.name_with_namespace.replace(GITLAB_ROOT_GROUP_PREFIX, "").replace(), group: true})
                    nodes = nodes.concat(repoNodes)
                }
            }
        }

        return nodes
    }

    getGitLabCommitNodes(account, projectId, dateFrom, dateTo, isTableNode) {
        return this.gitLabService.getCommits(projectId, dateFrom, dateTo).then(data  => {
            const nodes = []

            if (data) {
                for (let i = data.length; i--;) {
                    const item = data[i];

                    if (account && !(
                        item.author_name === account.name ||
                        item.author_name === account.id ||
                        item.author_email === account.email ||
                        item.committer_name === account.name ||
                        item.committer_name === account.id ||
                        item.committer_email === account.email ||
                        (account.emailAliases && (
                            account.emailAliases[item.author_email] ||
                            account.emailAliases[item.committer_email]
                        ))
                    )) { continue }

                    let nodeData = {
                        shortId: item.short_id,
                        title: item.message.replace(/\n/g, ' '),
                        committedDate: Moment(item.committed_date).format(DEFAULT_DISPLAY_DATE_FORMAT),
                        committerName: item.committer_name,
                        committerEmail: item.committer_email,
                        authorName: item.author_name,
                        authorEmail: item.author_email,
                        webUrl: item.web_url
                    }

                    if (isTableNode) {
                        nodeData = { data: nodeData }
                    }

                    nodes.push(nodeData)
                }
            }

            return nodes
        })
    }

    async getGitHubNodes(account, projectId, dateFrom, dateTo, isGroup, isTableNode, onRepoChanged) {
        if (isGroup) {
            return this.getGitHubOrgNodes({ account, projectId, dateFrom, dateTo, isTableNode, onRepoChanged })
        }

        return this.getGitHubCommitNodes(account, projectId, dateFrom, dateTo, isTableNode)
    }

    async getGitHubOrgNodes({ account, projectId, dateFrom, dateTo, isTableNode, onRepoChanged }) {
        const repos = await this.gitHubService.getOrgRepos(projectId)
        let nodes = []

        if (isTableNode) {
            for (const repo of repos) {
                nodes.push({
                    key: repo.full_name,
                    parentKey: projectId,
                    leaf: false,
                    data: {
                        type: GITHUB,
                        shortId: repo.name,
                        projectId: repo.full_name,
                        url: repo.html_url
                    }
                })
            }
        } else {
            for (let i = 0, n = repos.length; i < n; i++) {
                const repo = repos[i]

                if (onRepoChanged && !onRepoChanged(repo.name, repo, i, n)) {
                    break
                }

                const repoNodes = await this.getGitHubCommitNodes(account, repo.full_name, dateFrom, dateTo, isTableNode)

                if (repoNodes.length) {
                    nodes.push({ shortId: repo.name, group: true })
                    nodes = nodes.concat(repoNodes)
                }
            }
        }

        return nodes
    }

    getGitHubCommitNodes(account, projectId, dateFrom, dateTo, isTableNode) {
        const [ owner, repo ] = (projectId || "").split(SLASH)

        return this.gitHubService.getCommits({ owner, repo, dateFrom, dateTo }).then(data => {
            const nodes = []

            if (data) {
                for (const item of data) {
                    const author = item.commit.author || {}
                    const committer = item.commit.committer || {}

                    if (account && !(
                        author.name === account.name ||
                        author === account.id ||
                        author.email === account.email ||
                        committer.name === account.name ||
                        committer.email === account.id ||
                        committer.email === account.email ||
                        (account.emailAliases && (
                            account.emailAliases[author.email] ||
                            account.emailAliases[committer.email]
                        ))
                    )) { continue }

                    let nodeData = {
                        shortId: item.sha.slice(0, 7),
                        title: item.commit.message.replace(/\n/g, ' '),
                        committedDate: Moment(item.commit.author.date).format(DEFAULT_DISPLAY_DATE_FORMAT),
                        committerName: item.commit.committer.name,
                        committerEmail: item.commit.committer.email,
                        authorName: item.commit.author.name,
                        authorEmail: item.commit.author.email,
                        webUrl: item.html_url
                    }

                    if (isTableNode) {
                        nodeData = { data: nodeData }
                    }

                    nodes.push(nodeData)
                }
            }

            return nodes
        })
    }
}