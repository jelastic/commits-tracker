import { Octokit } from '@octokit/rest'
import Moment from "moment";
import { GITHUB_DATE_FORMAT_END, GITHUB_DATE_FORMAT_START } from "../constants";

const RESULTS_PER_PAGE = 100 // available limit on GitHub

export default class GitHubService {
    constructor(auth) {
        this.octokit = new Octokit({ auth })
    }

    getCommits({ owner, repo, author, dateFrom, dateTo }) {
        dateFrom = Moment(dateFrom).format(GITHUB_DATE_FORMAT_START);
        dateTo = Moment(dateTo).format(GITHUB_DATE_FORMAT_END);

        const params = {
            owner,
            repo,
            since: dateFrom,
            until: dateTo,
            per_page: RESULTS_PER_PAGE
        }

        if (author) {
            params.author = author
        }

        return this.octokit.paginate(this.octokit.repos.listCommits, params)
    }

    getOrgRepos(org) {
        return this.octokit.paginate(this.octokit.repos.listForOrg, {
            org,
            per_page: RESULTS_PER_PAGE
        })
    }
}